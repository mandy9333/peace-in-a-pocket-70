import { useCallback, useEffect, useRef, useState } from "react";
import {
  blobToBase64,
  cueKey,
  deleteRecording,
  getRecording,
  listRecordedKeys,
  saveRecording,
} from "@/lib/voice-recordings";
import {
  clearPublishedCache,
  getPublishedClipUrl,
  loadPublishedClips,
} from "@/lib/published-voice";
import { publishVoiceClip, unpublishVoiceClip } from "@/utils/voice.functions";

export type CloudStatus = "saving" | "saved" | "error";

/**
 * Records the user's own voiceover clips for a session's cues.
 *
 * When `cloudSave` is true (the creator), every finished take is also
 * uploaded to the app's cloud storage in the background, so a recording
 * is never stranded in this browser's local storage alone.
 */
export function useVoiceRecorder(sessionId: string, opts?: { cloudSave?: boolean }) {
  const cloudSave = opts?.cloudSave ?? false;
  const [recordedKeys, setRecordedKeys] = useState<Set<string>>(new Set());
  const [publishedKeys, setPublishedKeys] = useState<Set<string>>(new Set());
  const [cloudState, setCloudState] = useState<Record<string, CloudStatus>>({});
  const [publishingIndex, setPublishingIndex] = useState<number | null>(null);
  const [recordingIndex, setRecordingIndex] = useState<number | null>(null);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlsRef = useRef<string[]>([]);

  const refresh = useCallback(async () => {
    try {
      const keys = await listRecordedKeys();
      setRecordedKeys(new Set(keys.filter((k) => k.startsWith(`${sessionId}:`))));
    } catch {
      /* ignore */
    }
    try {
      const published = await loadPublishedClips(true);
      setPublishedKeys(new Set([...published.keys()].filter((k) => k.startsWith(`${sessionId}:`))));
    } catch {
      /* ignore */
    }
  }, [sessionId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const stopTracks = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const startRecording = useCallback(
    async (index: number) => {
      setError(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        const recorder = new MediaRecorder(stream);
        const chunks: BlobPart[] = [];
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunks.push(event.data);
        };
        recorder.onstop = () => {
          stopTracks();
          const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
          const key = cueKey(sessionId, index);
          void (async () => {
            try {
              await saveRecording(key, blob);
              await refresh();
            } catch {
              setError("Could not save that recording.");
              return;
            }
            // Creator cloud backup: never leave a take on this device alone.
            if (!cloudSave) return;
            setCloudState((prev) => ({ ...prev, [key]: "saving" }));
            try {
              await publishVoiceClip({
                data: {
                  cueKey: key,
                  audioBase64: await blobToBase64(blob),
                  mimeType: blob.type || "audio/webm",
                },
              });
              clearPublishedCache();
              setCloudState((prev) => ({ ...prev, [key]: "saved" }));
              await refresh();
            } catch {
              setCloudState((prev) => ({ ...prev, [key]: "error" }));
              setError(
                "Saved on this device, but the cloud backup failed. Your take is safe here — try re-recording when your connection is stronger.",
              );
            }
          })();
        };
        recorderRef.current = recorder;
        recorder.start();
        setRecordingIndex(index);
      } catch {
        stopTracks();
        setRecordingIndex(null);
        setError("Microphone access is needed to record your voice.");
      }
    },
    [refresh, sessionId, cloudSave],
  );

  const stopRecording = useCallback(() => {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    recorderRef.current = null;
    setRecordingIndex(null);
  }, []);

  const play = useCallback(
    async (index: number) => {
      try {
        const key = cueKey(sessionId, index);
        const blob = await getRecording(key);
        let src: string | null = null;
        if (blob) {
          const url = URL.createObjectURL(blob);
          urlsRef.current.push(url);
          src = url;
        } else if (cloudSave) {
          // No local take (different device?) — fall back to the cloud copy.
          src = await getPublishedClipUrl(key);
        }
        if (!src) return;
        let audio = audioRef.current;
        if (!audio) {
          audio = new Audio();
          audioRef.current = audio;
        }
        audio.onended = () => setPlayingIndex(null);
        audio.src = src;
        setPlayingIndex(index);
        await audio.play();
      } catch {
        setPlayingIndex(null);
        setError("Could not play that recording.");
      }
    },
    [sessionId, cloudSave],
  );

  const stopPlayback = useCallback(() => {
    audioRef.current?.pause();
    setPlayingIndex(null);
  }, []);

  const remove = useCallback(
    async (index: number) => {
      try {
        const key = cueKey(sessionId, index);
        await deleteRecording(key);
        if (cloudSave) {
          try {
            await unpublishVoiceClip({ data: { cueKey: key } });
            clearPublishedCache();
          } catch {
            /* local copy is gone; cloud cleanup is best-effort */
          }
          setCloudState((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
          });
        }
        await refresh();
      } catch {
        setError("Could not delete that recording.");
      }
    },
    [refresh, sessionId, cloudSave],
  );

  useEffect(() => {
    const urls = urlsRef.current;
    return () => {
      stopTracks();
      audioRef.current?.pause();
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  /** Uploads a recorded clip so every member hears it. */
  const publish = useCallback(
    async (index: number) => {
      setError(null);
      setPublishingIndex(index);
      try {
        const key = cueKey(sessionId, index);
        const blob = await getRecording(key);
        if (!blob && !cloudSave) throw new Error("Record this line first.");
        if (blob) {
          await publishVoiceClip({
            data: {
              cueKey: key,
              audioBase64: await blobToBase64(blob),
              mimeType: blob.type || "audio/webm",
            },
          });
        }
        // With cloudSave the take is already in the cloud; this just confirms it.
        clearPublishedCache();
        setCloudState((prev) => ({ ...prev, [key]: "saved" }));
        await refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not share that recording.");
      } finally {
        setPublishingIndex(null);
      }
    },
    [refresh, sessionId, cloudSave],
  );

  const unpublish = useCallback(
    async (index: number) => {
      setError(null);
      setPublishingIndex(index);
      try {
        await unpublishVoiceClip({ data: { cueKey: cueKey(sessionId, index) } });
        clearPublishedCache();
        await refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not remove that recording.");
      } finally {
        setPublishingIndex(null);
      }
    },
    [refresh, sessionId],
  );

  const isPublished = useCallback(
    (index: number) => publishedKeys.has(cueKey(sessionId, index)),
    [publishedKeys, sessionId],
  );

  const has = useCallback(
    (index: number) =>
      recordedKeys.has(cueKey(sessionId, index)) ||
      (cloudSave && publishedKeys.has(cueKey(sessionId, index))),
    [recordedKeys, publishedKeys, sessionId, cloudSave],
  );

  /** Cloud backup status for a cue (creator only). */
  const cloudStatus = useCallback(
    (index: number): CloudStatus | null => {
      const key = cueKey(sessionId, index);
      if (!cloudSave) return null;
      return cloudState[key] ?? (publishedKeys.has(key) ? "saved" : null);
    },
    [cloudState, publishedKeys, sessionId, cloudSave],
  );

  const recordedCount = cloudSave
    ? new Set([...recordedKeys, ...publishedKeys]).size
    : recordedKeys.size;

  return {
    has,
    isPublished,
    publishedCount: publishedKeys.size,
    publishingIndex,
    publish,
    unpublish,
    recordedCount,
    recordingIndex,
    playingIndex,
    error,
    startRecording,
    stopRecording,
    play,
    stopPlayback,
    remove,
    cloudStatus,
  };
}

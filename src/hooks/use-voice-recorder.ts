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
  loadPublishedClips,
} from "@/lib/published-voice";
import { publishVoiceClip, unpublishVoiceClip } from "@/utils/voice.functions";

/** Records the user's own voiceover clips for a session's cues. */
export function useVoiceRecorder(sessionId: string) {
  const [recordedKeys, setRecordedKeys] = useState<Set<string>>(new Set());
  const [publishedKeys, setPublishedKeys] = useState<Set<string>>(new Set());
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
      setPublishedKeys(
        new Set([...published.keys()].filter((k) => k.startsWith(`${sessionId}:`))),
      );
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
          void (async () => {
            try {
              await saveRecording(cueKey(sessionId, index), blob);
              await refresh();
            } catch {
              setError("Could not save that recording.");
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
    [refresh, sessionId],
  );

  const stopRecording = useCallback(() => {
    recorderRef.current?.state === "recording" && recorderRef.current.stop();
    recorderRef.current = null;
    setRecordingIndex(null);
  }, []);

  const play = useCallback(
    async (index: number) => {
      try {
        const blob = await getRecording(cueKey(sessionId, index));
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        urlsRef.current.push(url);
        let audio = audioRef.current;
        if (!audio) {
          audio = new Audio();
          audioRef.current = audio;
        }
        audio.onended = () => setPlayingIndex(null);
        audio.src = url;
        setPlayingIndex(index);
        await audio.play();
      } catch {
        setPlayingIndex(null);
        setError("Could not play that recording.");
      }
    },
    [sessionId],
  );

  const stopPlayback = useCallback(() => {
    audioRef.current?.pause();
    setPlayingIndex(null);
  }, []);

  const remove = useCallback(
    async (index: number) => {
      try {
        await deleteRecording(cueKey(sessionId, index));
        await refresh();
      } catch {
        setError("Could not delete that recording.");
      }
    },
    [refresh, sessionId],
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
        if (!blob) throw new Error("Record this line first.");
        await publishVoiceClip({
          data: {
            cueKey: key,
            audioBase64: await blobToBase64(blob),
            mimeType: blob.type || "audio/webm",
          },
        });
        clearPublishedCache();
        await refresh();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not share that recording.",
        );
      } finally {
        setPublishingIndex(null);
      }
    },
    [refresh, sessionId],
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
        setError(
          err instanceof Error ? err.message : "Could not remove that recording.",
        );
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
    (index: number) => recordedKeys.has(cueKey(sessionId, index)),
    [recordedKeys, sessionId],
  );

  return {
    has,
    isPublished,
    publishedCount: publishedKeys.size,
    publishingIndex,
    publish,
    unpublish,
    recordedCount: recordedKeys.size,
    recordingIndex,
    playingIndex,
    error,
    startRecording,
    stopRecording,
    play,
    stopPlayback,
    remove,
  };
}

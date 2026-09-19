import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, Square, Play, Trash2, Volume2, VolumeX } from "lucide-react";
import { cueKey, deleteRecording, getRecording, saveRecording } from "@/lib/voice-recordings";
import creatorVideo from "@/assets/mandys-creator-message.mp4.asset.json";
import creatorVideoPoster from "@/assets/mandys-creator-message-poster.jpg.asset.json";

const CREATOR_KEY = cueKey("creator-message", 0);

const SCRIPT =
  "Hi, I'm Mandy. I created Stillpoint because I needed a quiet place to come back to myself, and I couldn't find one that felt simple enough to actually use every day. These sessions are short and gentle, made for real life: a morning reset, a way to let stress go, a moment of balance before bed. Every practice here is one I use myself. So I'd love for you to slow down with me for a few minutes each day. Find your still point. It's closer than you think.";

/**
 * The welcome-page creator video. When Mandy has recorded the message in her
 * own voice, the video plays muted and her recording plays in sync.
 */
export function CreatorVideo() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const urlRef = useRef<string | null>(null);
  const [ownVoice, setOwnVoice] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [showScript, setShowScript] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getRecording(CREATOR_KEY).then((blob) => {
      if (!cancelled && blob) {
        const url = URL.createObjectURL(blob);
        urlRef.current = url;
        setOwnVoice(url);
      }
    });
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      audioRef.current?.pause();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  // Mute the embedded narration and play Mandy's own recording in sync.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !ownVoice) return;
    video.muted = true;
    const onPlay = () => {
      let audio = audioRef.current;
      if (!audio) {
        audio = new Audio(ownVoice);
        audioRef.current = audio;
      }
      audio.currentTime = 0;
      void audio.play().catch(() => undefined);
    };
    const onPause = () => {
      audioRef.current?.pause();
    };
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onPause);
    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onPause);
    };
  }, [ownVoice]);

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = () => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        void (async () => {
          try {
            await saveRecording(CREATOR_KEY, blob);
            if (urlRef.current) URL.revokeObjectURL(urlRef.current);
            const url = URL.createObjectURL(blob);
            urlRef.current = url;
            setOwnVoice(url);
          } catch {
            setError("Could not save that recording.");
          }
        })();
      };
      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
      setShowScript(true);
    } catch {
      streamRef.current = null;
      setRecording(false);
      setError("Microphone access is needed to record your voice.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    recorderRef.current = null;
    setRecording(false);
  }, []);

  const preview = useCallback(() => {
    if (!ownVoice) return;
    const audio = new Audio(ownVoice);
    void audio.play().catch(() => setError("Could not play that recording."));
  }, [ownVoice]);

  const remove = useCallback(async () => {
    try {
      await deleteRecording(CREATOR_KEY);
      audioRef.current?.pause();
      audioRef.current = null;
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
      if (videoRef.current) videoRef.current.muted = false;
      setOwnVoice(null);
    } catch {
      setError("Could not delete that recording.");
    }
  }, []);

  return (
    <section className="mt-7" aria-labelledby="creator-video-title">
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h2 id="creator-video-title" className="text-base font-semibold text-foreground">
          A note from Mandy
        </h2>
        <span className="text-xs text-muted-foreground">45 seconds</span>
      </div>
      <video
        ref={videoRef}
        className="aspect-video w-full rounded-lg bg-secondary object-cover ring-1 ring-border"
        controls
        playsInline
        preload="metadata"
        poster={creatorVideoPoster.url}
        aria-label="A personal welcome message from Mandy, creator of Stillpoint"
      >
        <source src={creatorVideo.url} type="video/mp4" />
        Your browser does not support video playback.
      </video>

      <div className="mt-3 rounded-2xl bg-card p-4 ring-1 ring-border">
        {ownVoice ? (
          <div className="space-y-3">
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Volume2 className="size-4 text-primary" />
              Your voice plays with this video
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={preview}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground"
              >
                <Play className="size-3.5" /> Preview
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowScript(true);
                  void startRecording();
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground"
              >
                <Mic className="size-3.5" /> Re-record
              </button>
              <button
                type="button"
                onClick={() => void remove()}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground"
              >
                <Trash2 className="size-3.5" /> Use original
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <VolumeX className="size-4 text-primary" />
              Record the message in your own voice — it plays over the video instead of the
              standard narration.
            </p>
            {recording ? (
              <button
                type="button"
                onClick={stopRecording}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
              >
                <Square className="size-3.5" /> Stop recording
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setShowScript(true);
                  void startRecording();
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
              >
                <Mic className="size-3.5" /> Record in my voice
              </button>
            )}
          </div>
        )}
        {showScript && (
          <p className="mt-3 rounded-xl bg-secondary p-3 text-xs leading-relaxed text-muted-foreground">
            Read this slowly and warmly: “{SCRIPT}”
          </p>
        )}
        {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
        <p className="mt-2 text-[11px] text-muted-foreground">
          Your recording stays on this device — nothing is uploaded.
        </p>
      </div>
    </section>
  );
}

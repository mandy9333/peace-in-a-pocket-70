import { useEffect, useRef, useState } from "react";
import { Mic, PlayCircle, Square, Trash2, Volume2, X } from "lucide-react";
import howItWorksAsset from "@/assets/how-it-works.mp4.asset.json";
import { cueKey, getRecording } from "@/lib/voice-recordings";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";
import { supabase } from "@/integrations/supabase/client";

const NARRATION_ID = "how-it-works";

const steps = [
  "Welcome to Stillpoint. Here is how it works.",
  "Pick a session from Home or the Library.",
  "Press play — the timer and breathing circle guide your pace.",
  "Adjust the soundscape and voice guidance volumes to taste.",
  "Record the guidance in your own voice from the voice panel.",
  "Finish the session to build your streak on the Profile tab.",
];

export function HowItWorks() {
  const [open, setOpen] = useState(false);
  const [narrating, setNarrating] = useState<number | null>(null);
  const [narrationError, setNarrationError] = useState<string | null>(null);
  const recorder = useVoiceRecorder(NARRATION_ID);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const urlsRef = useRef<string[]>([]);
  const cancelRef = useRef(false);
  const runningRef = useRef(false);

  useEffect(() => {
    const urls = urlsRef.current;
    return () => {
      audioRef.current?.pause();
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const clipUrl = async (index: number) => {
    // Always read the newest saved recording so a line just recorded is used.
    const own = await getRecording(cueKey(NARRATION_ID, index));
    if (own) {
      const url = URL.createObjectURL(own);
      urlsRef.current.push(url);
      return url;
    }
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error("Sign in is required for narration.");
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text: steps[index] }),
    });
    if (!res.ok) throw new Error("Narration is unavailable right now.");
    const url = URL.createObjectURL(await res.blob());
    urlsRef.current.push(url);
    return url;
  };

  const stopNarration = () => {
    cancelRef.current = true;
    runningRef.current = false;
    audioRef.current?.pause();
    setNarrating(null);
  };

  const playNarration = async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    cancelRef.current = false;
    setNarrationError(null);
    let audio = audioRef.current;
    if (!audio) {
      audio = new Audio();
      audioRef.current = audio;
    }
    try {
      for (let i = 0; i < steps.length; i++) {
        if (cancelRef.current) break;
        setNarrating(i);
        const url = await clipUrl(i);
        if (cancelRef.current) break;
        audio.src = url;
        await audio.play();
        await new Promise<void>((resolve) => {
          const timer = setInterval(() => {
            if (cancelRef.current || audio!.ended) {
              clearInterval(timer);
              resolve();
            }
          }, 200);
        });
      }
    } catch (err) {
      setNarrationError(
        err instanceof Error ? err.message : "Narration failed.",
      );
    } finally {
      runningRef.current = false;
      setNarrating(null);
    }
  };

  /** Restart narration from the top so newly recorded lines are heard. */
  const restartNarration = () => {
    stopNarration();
    cancelRef.current = false;
    setTimeout(() => void playNarration(), 60);
  };

  return (
    <section className="mb-10">
      <button
        type="button"
        onClick={() => {
          // Unlock audio within the tap so the voice over can start with the video.
          if (!audioRef.current) audioRef.current = new Audio();
          void audioRef.current
            .play()
            .then(() => audioRef.current?.pause())
            .catch(() => {});
          cancelRef.current = false;
          setOpen(true);
        }}
        className="group relative block w-full overflow-hidden rounded-3xl bg-card text-left ring-1 ring-border"
      >
        <video
          src={howItWorksAsset.url}
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          className="aspect-video w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 p-5">
          <span className="flex size-11 flex-shrink-0 items-center justify-center rounded-full bg-white/95 text-foreground shadow-lg transition-transform group-hover:scale-105">
            <PlayCircle className="size-6" />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/70">
              New here?
            </p>
            <h2 className="text-lg font-semibold text-white">
              How Stillpoint works
            </h2>
          </div>
        </div>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-5 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="How Stillpoint works"
          onClick={() => {
            stopNarration();
            recorder.stopPlayback();
            setOpen(false);
          }}
        >
          <div
            className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-3xl bg-card ring-1 ring-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <video
                ref={videoRef}
                src={howItWorksAsset.url}
                controls
                autoPlay
                muted
                loop
                playsInline
                onPlay={() => {
                  if (runningRef.current) {
                    void audioRef.current?.play().catch(() => {});
                  } else {
                    void playNarration();
                  }
                }}
                onPause={() => audioRef.current?.pause()}
                className="aspect-video w-full bg-black object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  stopNarration();
                  recorder.stopPlayback();
                  setOpen(false);
                }}
                aria-label="Close video"
                className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-black/60 text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="border-b border-border p-5">
              <button
                type="button"
                onClick={() =>
                  narrating === null ? void playNarration() : stopNarration()
                }
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                {narrating === null ? (
                  <>
                    <Volume2 className="size-4" /> Replay voice over
                  </>
                ) : (
                  <>
                    <Square className="size-4 fill-current" /> Stop narration
                  </>
                )}
              </button>
              <p className="mt-2 text-center text-[11px] text-muted-foreground">
                {recorder.recordedCount > 0
                  ? `${recorder.recordedCount} of ${steps.length} lines in your own voice — they play with the video.`
                  : "The voice over plays with the video — tap the mic on any line to make it your own voice."}
              </p>
              {narrationError ? (
                <p className="mt-2 text-center text-[11px] text-destructive">
                  {narrationError}
                </p>
              ) : null}
              {recorder.error ? (
                <p className="mt-2 text-center text-[11px] text-destructive">
                  {recorder.error}
                </p>
              ) : null}
            </div>

            <ol className="space-y-4 p-6">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span
                    className={`flex size-6 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                      narrating === i
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-primary"
                    }`}
                  >
                    {i === 0 ? "•" : i}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{step}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (recorder.recordingIndex === i) {
                            recorder.stopRecording();
                            // Give the clip a moment to save, then play it back in place.
                            setTimeout(restartNarration, 700);
                          } else {
                            stopNarration();
                            void recorder.startRecording(i);
                          }
                        }}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
                          recorder.recordingIndex === i
                            ? "bg-destructive text-white"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        {recorder.recordingIndex === i ? (
                          <>
                            <Square className="size-3 fill-current" /> Stop
                          </>
                        ) : (
                          <>
                            <Mic className="size-3" />
                            {recorder.has(i) ? "Re-record" : "Record"}
                          </>
                        )}
                      </button>
                      {recorder.has(i) ? (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              recorder.playingIndex === i
                                ? recorder.stopPlayback()
                                : void recorder.play(i)
                            }
                            className="rounded-full bg-muted px-3 py-1 text-[11px] font-medium text-foreground"
                          >
                            {recorder.playingIndex === i ? "Stop" : "Preview"}
                          </button>
                          <button
                            type="button"
                            onClick={() => void recorder.remove(i)}
                            aria-label="Delete recording"
                            className="flex size-7 items-center justify-center rounded-full text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      ) : null}
    </section>
  );
}

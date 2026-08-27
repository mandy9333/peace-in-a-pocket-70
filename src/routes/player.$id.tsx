import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { getSessionById, formatTime } from "@/lib/meditation";
import { useMeditationStats } from "@/hooks/use-meditation-stats";
import { useSoundscape } from "@/hooks/use-soundscape";
import { useVoiceover } from "@/hooks/use-voiceover";
import { cueKey } from "@/lib/voice-recordings";
import {
  ArrowLeft,
  Pause,
  Play,
  RotateCcw,
  Check,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
} from "lucide-react";


export const Route = createFileRoute("/player/$id")({
  head: ({ params }) => {
    const session = getSessionById(params.id)!;
    return {
      meta: [
        { title: `${session.title} — Stillpoint` },
        { name: "description", content: session.description },
        { property: "og:title", content: `${session.title} — Stillpoint` },
        { property: "og:description", content: session.description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: Player,
});

function Player() {
  const { id } = Route.useParams();
  const session = getSessionById(id)!;
  const navigate = useNavigate();
  const { recordSession } = useMeditationStats();

  const durationSeconds = session.durationMinutes * 60;
  const [elapsed, setElapsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasRecorded = useRef(false);
  const { volume, setVolume, muted, setMuted, start, pause } = useSoundscape(
    session.category,
  );
  const voice = useVoiceover();
  const spokenRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (isPlaying) void start();
    else pause();
  }, [isPlaying, start, pause]);

  // Warm the first few narration clips once the session starts.
  useEffect(() => {
    if (!isPlaying) return;
    voice.prefetch(
      session.voiceover.slice(0, 3).map((cue, index) => ({
        text: cue.text,
        key: cueKey(session.id, index),
      })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, session.id]);

  // Speak guidance cues as their moment arrives.
  useEffect(() => {
    if (!isPlaying) return;
    const index = session.voiceover.findIndex(
      (c) => elapsed >= c.at && !spokenRef.current.has(c.at),
    );
    if (index === -1) return;
    const cue = session.voiceover[index]!;
    spokenRef.current.add(cue.at);
    void voice.speak(cue.text, cueKey(session.id, index));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, isPlaying, session.id]);

  // Silence narration when paused.
  useEffect(() => {
    if (!isPlaying) voice.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);


  useEffect(() => {
    if (isPlaying && elapsed < durationSeconds) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 1;
          if (next >= durationSeconds) {
            setIsPlaying(false);
            setIsFinished(true);
            if (!hasRecorded.current) {
              hasRecorded.current = true;
              recordSession(session.durationMinutes);
            }
            return durationSeconds;
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, elapsed, durationSeconds, session.durationMinutes, recordSession]);

  const remaining = durationSeconds - elapsed;
  const progress = elapsed / durationSeconds;

  const reset = () => {
    setIsPlaying(false);
    setIsFinished(false);
    setElapsed(0);
    hasRecorded.current = false;
    spokenRef.current.clear();
    voice.stop();
  };


  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <img
        src={session.image}
        alt=""
        width={1024}
        height={1024}
        className="pointer-events-none fixed inset-0 h-full w-full object-cover opacity-10"
      />

      <header className="relative z-10 flex items-center justify-between px-6 pt-12">
        <button
          onClick={() => navigate({ to: "/" })}
          className="flex size-10 items-center justify-center rounded-full bg-card ring-1 ring-border"
          aria-label="Back"
        >
          <ArrowLeft className="size-5" />
        </button>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6">
        {/* Breathing visual */}
        <div className="relative mb-12 flex items-center justify-center">
          <div
            className="absolute size-72 rounded-full bg-primary/20 blur-2xl animate-breathe"
            style={{ animationPlayState: isPlaying ? "running" : "paused" }}
          />
          <div
            className="absolute size-56 rounded-full border-2 border-primary/30 animate-breathe-ring"
            style={{ animationPlayState: isPlaying ? "running" : "paused" }}
          />
          <div
            className="absolute size-44 rounded-full border border-primary/20"
            style={{
              transform: `scale(${0.9 + progress * 0.2})`,
              transition: isPlaying ? "transform 1s linear" : "transform 0.5s ease-out",
            }}
          />
          <div className="relative flex size-40 items-center justify-center rounded-full bg-card shadow-2xl ring-1 ring-border">
            <span className="text-4xl font-semibold tabular-nums tracking-tight text-foreground">
              {formatTime(isFinished ? 0 : remaining)}
            </span>
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">
            {session.title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isFinished
              ? "Session complete. Take a gentle breath."
              : isPlaying
              ? "Breathe in, breathe out."
              : "Press play to begin."}
          </p>
        </div>

        {/* Controls */}
        <div className="mt-12 flex items-center gap-8">
          <button
            onClick={reset}
            className="flex size-12 items-center justify-center rounded-full bg-card text-muted-foreground ring-1 ring-border transition-colors hover:text-foreground"
            aria-label="Reset"
          >
            <RotateCcw className="size-5" />
          </button>

          <button
            onClick={() => setIsPlaying((p) => !p)}
            className="flex size-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-transform active:scale-95"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="size-8 fill-current" />
            ) : (
              <Play className="size-8 fill-current" />
            )}
          </button>

          <Link
            to="/"
            className="flex size-12 items-center justify-center rounded-full bg-card text-muted-foreground ring-1 ring-border transition-colors hover:text-foreground"
            aria-label="Done"
          >
            <Check className="size-5" />
          </Link>
        </div>

        {/* Soundscape */}
        <div className="mt-10 w-full max-w-xs rounded-2xl bg-card/80 p-4 ring-1 ring-border backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {session.label} soundscape
            </span>
            <button
              onClick={() => setMuted((m) => !m)}
              className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
              aria-label={muted ? "Unmute music" : "Mute music"}
              aria-pressed={muted}
            >
              {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            </button>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => {
              setVolume(Number(e.target.value));
              if (muted) setMuted(false);
            }}
            aria-label="Music volume"
            className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary disabled:opacity-40"
            disabled={muted}
            style={{
              background: muted
                ? undefined
                : `linear-gradient(to right, var(--primary) ${volume * 100}%, var(--muted) ${volume * 100}%)`,
            }}
          />
        </div>

        {/* Voice guidance */}
        <div className="mt-4 w-full max-w-xs rounded-2xl bg-card/80 p-4 ring-1 ring-border backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Voice guidance
              {voice.isSpeaking && voice.enabled ? " · speaking" : ""}
            </span>
            <button
              onClick={() => {
                const next = !voice.enabled;
                voice.setEnabled(next);
                if (!next) voice.stop();
              }}
              className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
              aria-label={voice.enabled ? "Turn off voice guidance" : "Turn on voice guidance"}
              aria-pressed={voice.enabled}
            >
              {voice.enabled ? <Mic className="size-4" /> : <MicOff className="size-4" />}
            </button>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={voice.volume}
            onChange={(e) => voice.setVolume(Number(e.target.value))}
            aria-label="Voice volume"
            className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary disabled:opacity-40"
            disabled={!voice.enabled}
            style={{
              background: !voice.enabled
                ? undefined
                : `linear-gradient(to right, var(--primary) ${voice.volume * 100}%, var(--muted) ${voice.volume * 100}%)`,
            }}
          />
          <button
            onClick={() =>
              navigate({ to: "/record/$id", params: { id: session.id } })
            }
            className="mt-3 w-full rounded-full bg-muted py-2 text-[12px] font-medium text-foreground transition-opacity hover:opacity-80"
          >
            Record in my own voice
          </button>
          {voice.error ? (
            <p className="mt-2 text-[11px] text-destructive">{voice.error}</p>
          ) : null}
        </div>

      </main>
    </div>
  );
}

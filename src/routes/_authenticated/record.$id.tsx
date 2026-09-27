import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { getSessionById, formatTime } from "@/lib/meditation";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";
import { ArrowLeft, Mic, Square, Play, Pause, Trash2, Check, Users, Loader2 } from "lucide-react";
import { useVoiceOwner } from "@/hooks/use-voice-owner";

export const Route = createFileRoute("/_authenticated/record/$id")({
  head: ({ params }) => {
    const session = getSessionById(params.id)!;
    return {
      meta: [
        { title: `Record your voice — ${session.title} | Stillpoint` },
        {
          name: "description",
          content: `Record your own voice guidance for ${session.title}. Clips stay on your device.`,
        },
        { property: "og:title", content: `Record your voice — ${session.title}` },
        {
          property: "og:description",
          content: `Record your own voice guidance for ${session.title}.`,
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: RecordStudio,
});

function RecordStudio() {
  const { id } = Route.useParams();
  const session = getSessionById(id)!;
  const navigate = useNavigate();
  const recorder = useVoiceRecorder(session.id);
  const isOwner = useVoiceOwner();
  const total = session.voiceover.length;

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="flex items-center gap-3 px-6 pt-12">
        <button
          onClick={() => navigate({ to: "/player/$id", params: { id: session.id } })}
          className="flex size-10 items-center justify-center rounded-full bg-card ring-1 ring-border"
          aria-label="Back to session"
        >
          <ArrowLeft className="size-5" />
        </button>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {recorder.recordedCount} of {total} recorded
        </span>
      </header>

      <main className="px-6">
        <h1 className="mt-6 text-2xl font-semibold text-foreground">
          Your voice for {session.title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Read each line aloud in your own voice. Each recording replaces the
          generated narration during the session, and any line you skip keeps
          the standard voice.{isOwner
            ? " Tap Share with members to publish a line so everyone who joins hears you."
            : " Recordings stay on this device."}
        </p>

        {recorder.error ? (
          <p className="mt-4 text-[13px] text-destructive">{recorder.error}</p>
        ) : null}

        <ol className="mt-8 space-y-4">
          {session.voiceover.map((cue, index) => {
            const isRecording = recorder.recordingIndex === index;
            const isPlaying = recorder.playingIndex === index;
            const recorded = recorder.has(index);
            const published = recorder.isPublished(index);
            return (
              <li
                key={cue.at}
                className="rounded-2xl bg-card p-4 ring-1 ring-border"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Cue {index + 1} · at {formatTime(cue.at)}
                  </span>
                  {published ? (
                    <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
                      <Users className="size-3" /> heard by members
                    </span>
                  ) : recorded ? (
                    <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
                      <Check className="size-3" /> yours
                    </span>
                  ) : null}
                </div>

                <p className="mt-3 text-[15px] leading-relaxed text-foreground">
                  {cue.text}
                </p>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() =>
                      isRecording
                        ? recorder.stopRecording()
                        : void recorder.startRecording(index)
                    }
                    disabled={
                      recorder.recordingIndex !== null && !isRecording
                    }
                    className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-transform active:scale-95 disabled:opacity-40"
                  >
                    {isRecording ? (
                      <>
                        <Square className="size-3.5 fill-current" /> Stop
                      </>
                    ) : (
                      <>
                        <Mic className="size-3.5" />
                        {recorded ? "Re-record" : "Record"}
                      </>
                    )}
                  </button>

                  {recorded ? (
                    <>
                      <button
                        onClick={() =>
                          isPlaying
                            ? recorder.stopPlayback()
                            : void recorder.play(index)
                        }
                        className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:text-foreground"
                        aria-label={isPlaying ? "Stop preview" : "Play recording"}
                      >
                        {isPlaying ? (
                          <Pause className="size-4 fill-current" />
                        ) : (
                          <Play className="size-4 fill-current" />
                        )}
                      </button>
                      <button
                        onClick={() => void recorder.remove(index)}
                        className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:text-destructive"
                        aria-label="Delete recording"
                      >
                        <Trash2 className="size-4" />
                      </button>
                      {isOwner ? (
                        <button
                          onClick={() =>
                            void (published
                              ? recorder.unpublish(index)
                              : recorder.publish(index))
                          }
                          disabled={recorder.publishingIndex === index}
                          className="ml-auto flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[12px] font-medium text-foreground disabled:opacity-50"
                        >
                          {recorder.publishingIndex === index ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Users className="size-3.5" />
                          )}
                          {published ? "Stop sharing" : "Share with members"}
                        </button>
                      ) : null}
                    </>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </main>
    </div>
  );
}

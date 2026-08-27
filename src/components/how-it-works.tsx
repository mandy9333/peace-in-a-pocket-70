import { useState } from "react";
import { PlayCircle, X } from "lucide-react";
import howItWorksAsset from "@/assets/how-it-works.mp4.asset.json";

const steps = [
  "Pick a session from Home or the Library.",
  "Press play — the timer and breathing circle guide your pace.",
  "Adjust the soundscape and voice guidance volumes to taste.",
  "Record the guidance in your own voice from the voice panel.",
  "Finish the session to build your streak on the Profile tab.",
];

export function HowItWorks() {
  const [open, setOpen] = useState(false);

  return (
    <section className="mb-10">
      <button
        type="button"
        onClick={() => setOpen(true)}
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
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-3xl bg-card ring-1 ring-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <video
                src={howItWorksAsset.url}
                controls
                autoPlay
                playsInline
                className="aspect-video w-full bg-black object-cover"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close video"
                className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-black/60 text-white"
              >
                <X className="size-4" />
              </button>
            </div>
            <ol className="space-y-3 p-6">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-foreground">
                  <span className="flex size-6 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold text-primary">
                    {i + 1}
                  </span>
                  <span className="text-muted-foreground">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      ) : null}
    </section>
  );
}

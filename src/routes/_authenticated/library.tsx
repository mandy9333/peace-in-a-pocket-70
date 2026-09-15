import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  sessions,
  categoryLabel,
  getWeeklySession,
  getMoonSession,
  type MeditationSession,
} from "@/lib/meditation";
import { moonPhaseLabel, moonPhase } from "@/lib/moon";
import { Clock, Moon, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/library")({
  head: () => ({
    meta: [
      { title: "Library — Stillpoint" },
      { name: "description", content: "Browse guided meditation sessions." },
      { property: "og:title", content: "Library — Stillpoint" },
      { property: "og:description", content: "Browse guided meditation sessions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Library,
});

function SessionRow({ session }: { session: MeditationSession }) {
  return (
    <Link
      to="/player/$id"
      params={{ id: session.id }}
      className="group flex items-center gap-4 overflow-hidden rounded-2xl bg-card p-3 ring-1 ring-border transition-shadow hover:shadow-md"
    >
      <div className="size-24 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
        <img
          src={session.image}
          alt={session.title}
          width={1024}
          height={1024}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col pr-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
          {categoryLabel[session.category]}
        </span>
        <h3 className="mt-1 text-lg font-semibold text-foreground">
          {session.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
          {session.description}
        </p>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3.5" />
          <span>{session.durationMinutes} minutes</span>
        </div>
      </div>
    </Link>
  );
}

function Library() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);

  const weekly = now ? getWeeklySession(now) : null;
  const moonSession = now ? getMoonSession(now) : null;

  return (
    <div className="min-h-screen bg-background pb-32">
      <main className="mx-auto max-w-md px-6 pt-12">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Library
          </h1>
          <p className="mt-1 text-muted-foreground">
            Choose a practice for where you are now.
          </p>
        </header>

        {moonSession && now && (
          <section className="mb-8">
            <div className="mb-3 flex items-center gap-1.5">
              <Moon className="size-3.5 text-primary" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {moonPhaseLabel[moonPhase(now)]} — open today
              </h2>
            </div>
            <SessionRow session={moonSession} />
          </section>
        )}

        {weekly && (
          <section className="mb-8">
            <div className="mb-3 flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-primary" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                New this week
              </h2>
            </div>
            <SessionRow session={weekly} />
            <p className="mt-2 px-1 text-xs text-muted-foreground">
              A new practice opens here every Sunday, plus a special one on each
              full moon and half moon.
            </p>
          </section>
        )}

        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Always here
          </h2>
          <div className="grid gap-4">
            {sessions.map((session) => (
              <SessionRow key={session.id} session={session} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

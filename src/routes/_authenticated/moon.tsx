import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  fullMoonSession,
  halfMoonSession,
  weeklySessions,
  getWeeklySession,
  getMoonSession,
  type MeditationSession,
} from "@/lib/meditation";
import {
  nextFullMoon,
  nextHalfMoon,
  weekIndex,
  weekStart,
} from "@/lib/moon";
import { Moon, Mic, Play, Sparkles, CalendarDays } from "lucide-react";

export const Route = createFileRoute("/_authenticated/moon")({
  head: () => ({
    meta: [
      { title: "Moon Rituals & Weekly Practices — Stillpoint" },
      {
        name: "description",
        content:
          "Full moon and half moon meditations, plus the new practice that opens every week.",
      },
      { property: "og:title", content: "Moon Rituals & Weekly Practices" },
      {
        property: "og:description",
        content:
          "Full moon and half moon meditations, plus the new practice that opens every week.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MoonPage,
});

const formatDate = (d: Date) =>
  d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

function RitualCard({
  session,
  eyebrow,
  when,
  openNow,
}: {
  session: MeditationSession;
  eyebrow: string;
  when: string;
  openNow: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-3xl bg-card ring-1 ring-border">
      <div className="relative">
        <img
          src={session.image}
          alt={session.title}
          width={1024}
          height={1024}
          loading="lazy"
          className="aspect-[16/9] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
            <Moon className="size-3" />
            {eyebrow}
          </span>
          <h2 className="mt-2 text-xl font-semibold text-white">{session.title}</h2>
        </div>
      </div>
      <div className="p-5">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {session.description}
        </p>
        <p className="mt-3 text-xs font-medium text-primary">
          {openNow ? "Open today" : when}
        </p>
        <div className="mt-4 flex gap-2">
          <Link
            to="/player/$id"
            params={{ id: session.id }}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
          >
            <Play className="size-4 fill-current" />
            {session.durationMinutes} min
          </Link>
          <Link
            to="/record/$id"
            params={{ id: session.id }}
            className="flex items-center justify-center gap-2 rounded-full bg-secondary px-4 py-3 text-sm font-semibold text-foreground ring-1 ring-border"
          >
            <Mic className="size-4" />
            My voice
          </Link>
        </div>
      </div>
    </div>
  );
}

function MoonPage() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);

  const activeMoon = now ? getMoonSession(now) : null;
  const weekly = now ? getWeeklySession(now) : null;

  const upcoming = now
    ? Array.from({ length: 6 }, (_, i) => {
        const date = new Date(weekStart(now).getTime() + i * 7 * 86400000);
        const session = weeklySessions[
          (weekIndex(date) % weeklySessions.length + weeklySessions.length) %
            weeklySessions.length
        ]!;
        return { date, session, current: i === 0 };
      })
    : [];

  return (
    <div className="min-h-screen bg-background pb-32">
      <main className="mx-auto max-w-md px-6 pt-12">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Rituals
          </h1>
          <p className="mt-1 text-muted-foreground">
            Moon practices and the new session that opens each week.
          </p>
        </header>

        <div className="grid gap-5">
          <RitualCard
            session={fullMoonSession}
            eyebrow="Full moon"
            when={now ? `Next full moon · ${formatDate(nextFullMoon(now))}` : "\u00a0"}
            openNow={activeMoon?.id === fullMoonSession.id}
          />
          <RitualCard
            session={halfMoonSession}
            eyebrow="Half moon"
            when={now ? `Next half moon · ${formatDate(nextHalfMoon(now))}` : "\u00a0"}
            openNow={activeMoon?.id === halfMoonSession.id}
          />
        </div>

        <section className="mt-10">
          <div className="mb-1 flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-primary" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Weekly schedule
            </h2>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            A new practice opens every Sunday.
          </p>

          {weekly && (
            <div className="mb-4 rounded-2xl bg-secondary p-4 ring-1 ring-border">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                This week
              </p>
              <h3 className="mt-1 text-base font-semibold text-foreground">
                {weekly.title}
              </h3>
              <div className="mt-3 flex gap-2">
                <Link
                  to="/player/$id"
                  params={{ id: weekly.id }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
                >
                  <Play className="size-4 fill-current" />
                  {weekly.durationMinutes} min
                </Link>
                <Link
                  to="/record/$id"
                  params={{ id: weekly.id }}
                  className="flex items-center justify-center gap-2 rounded-full bg-card px-4 py-2.5 text-sm font-semibold text-foreground ring-1 ring-border"
                >
                  <Mic className="size-4" />
                  My voice
                </Link>
              </div>
            </div>
          )}

          <ul className="divide-y divide-border overflow-hidden rounded-2xl bg-card ring-1 ring-border">
            {upcoming.slice(1).map(({ date, session }) => (
              <li key={date.toISOString()} className="flex items-center gap-3 p-4">
                <CalendarDays className="size-4 flex-shrink-0 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {session.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Opens {formatDate(date)}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {session.durationMinutes} min
                </span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

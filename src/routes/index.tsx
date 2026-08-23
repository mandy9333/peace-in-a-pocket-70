import { createFileRoute, Link } from "@tanstack/react-router";
import { useMeditationStats } from "@/hooks/use-meditation-stats";
import { sessions, formatTime } from "@/lib/meditation";
import { Flame, Play } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Stillpoint — Meditation" },
      { name: "description", content: "Start your daily meditation practice." },
      { property: "og:title", content: "Stillpoint — Meditation" },
      { property: "og:description", content: "Start your daily meditation practice." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const { stats } = useMeditationStats();
  const daily = sessions[0]!;
  const recent = sessions.slice(1, 4);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <main className="mx-auto max-w-md px-6 pt-12">
        <header className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
              {greeting()}
            </h1>
          </div>
          <div className="flex flex-col items-center rounded-2xl bg-secondary px-4 py-2">
            <div className="flex items-center gap-1.5 text-primary">
              <Flame className="size-4" fill="currentColor" />
              <span className="text-lg font-semibold leading-none">{stats.streak}</span>
            </div>
            <span className="mt-1 text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
              Streak
            </span>
          </div>
        </header>

        {/* Daily session */}
        <section className="mb-10">
          <Link
            to="/player/$id"
            params={{ id: daily.id }}
            className="group relative block overflow-hidden rounded-3xl bg-card ring-1 ring-border"
          >
            <img
              src={daily.image}
              alt={daily.title}
              width={1024}
              height={1024}
              className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <span className="inline-block rounded-full bg-primary/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                {daily.label}
              </span>
              <h2 className="mt-3 text-2xl font-semibold text-white">
                {daily.title}
              </h2>
              <p className="mt-1 max-w-[28ch] text-sm text-white/80">
                {daily.description}
              </p>
              <div className="mt-5 flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-white text-foreground shadow-lg">
                  <Play className="size-4 fill-current" />
                </span>
                <span className="text-sm font-medium text-white">
                  {daily.durationMinutes} min
                </span>
              </div>
            </div>
          </Link>
        </section>

        {/* Recent sessions */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent sessions</h3>
            <Link
              to="/library"
              className="text-sm font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 no-scrollbar">
            {recent.map((session) => (
              <Link
                key={session.id}
                to="/player/$id"
                params={{ id: session.id }}
                className="flex w-40 flex-shrink-0 flex-col"
              >
                <div className="overflow-hidden rounded-2xl bg-muted ring-1 ring-border">
                  <img
                    src={session.image}
                    alt={session.title}
                    width={1024}
                    height={1024}
                    loading="lazy"
                    className="aspect-square w-full object-cover"
                  />
                </div>
                <h4 className="mt-3 text-sm font-semibold text-foreground">
                  {session.title}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {session.durationMinutes} min · {session.label}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Mini stats */}
        <section className="mt-10 rounded-3xl bg-card p-6 ring-1 ring-border">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Practice this week
          </h3>
          <div className="mt-4 flex gap-2">
            {stats.weeklyProgress.map((done, i) => {
              const days = ["S", "M", "T", "W", "T", "F", "S"];
              return (
                <div key={i} className="flex-1 text-center">
                  <div
                    className={`h-8 rounded-full transition-colors ${
                      done ? "bg-primary" : "bg-muted"
                    }`}
                  />
                  <span className="mt-1 block text-[10px] text-muted-foreground">
                    {days[i]}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-6 flex justify-between border-t border-border pt-4">
            <div>
              <p className="text-2xl font-semibold text-foreground">
                {stats.totalMinutes}
              </p>
              <p className="text-xs text-muted-foreground">Total minutes</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold text-foreground">
                {stats.sessionsCompleted}
              </p>
              <p className="text-xs text-muted-foreground">Sessions</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useMeditationStats } from "@/hooks/use-meditation-stats";
import { Calendar, Clock, Flame, Award } from "lucide-react";
import profileBg from "@/assets/profile-bg.jpg";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Stillpoint" },
      { name: "description", content: "Track your meditation practice and progress." },
      { property: "og:title", content: "Profile — Stillpoint" },
      { property: "og:description", content: "Track your meditation practice and progress." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Profile,
});

function Profile() {
  const { stats } = useMeditationStats();

  const days = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="min-h-screen bg-background pb-32">
      <main className="mx-auto max-w-md px-6 pt-12">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Profile
          </h1>
          <p className="mt-1 text-muted-foreground">
            Your practice, at a glance.
          </p>
        </header>

        {/* Hero card */}
        <section className="relative mb-8 overflow-hidden rounded-3xl bg-card ring-1 ring-border">
          <img
            src={profileBg}
            alt=""
            width={1024}
            height={1024}
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
          <div className="relative p-6">
            <div className="flex items-center gap-4">
              <div className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-semibold shadow-lg">
                S
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Stillpoint</h2>
                <p className="text-sm text-muted-foreground">Daily meditator</p>
              </div>
            </div>
            <div className="mt-6 flex gap-4">
              <div className="flex-1 rounded-2xl bg-white/80 p-4 backdrop-blur-sm">
                <Flame className="size-5 text-primary" fill="currentColor" />
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {stats.streak}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Day streak
                </p>
              </div>
              <div className="flex-1 rounded-2xl bg-white/80 p-4 backdrop-blur-sm">
                <Clock className="size-5 text-primary" />
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {stats.totalMinutes}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Total minutes
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Weekly progress */}
        <section className="mb-8 rounded-3xl bg-card p-6 ring-1 ring-border">
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="size-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">This week</h3>
          </div>
          <div className="flex gap-2">
            {stats.weeklyProgress.map((done, i) => (
              <div key={i} className="flex-1 text-center">
                <div
                  className={`flex h-14 items-end justify-center rounded-2xl p-2 transition-colors ${
                    done ? "bg-primary" : "bg-muted"
                  }`}
                >
                  {done && (
                    <div className="h-full w-1.5 rounded-full bg-primary-foreground/30" />
                  )}
                </div>
                <span className="mt-2 block text-[10px] font-medium text-muted-foreground">
                  {days[i]}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Milestones */}
        <section className="rounded-3xl bg-card p-6 ring-1 ring-border">
          <h3 className="mb-4 text-lg font-semibold">Milestones</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div
                className={`flex size-12 items-center justify-center rounded-full ${
                  stats.sessionsCompleted >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                <Award className="size-5" />
              </div>
              <div>
                <p className="font-semibold text-foreground">First Session</p>
                <p className="text-xs text-muted-foreground">
                  {stats.sessionsCompleted >= 1 ? "Completed" : "Complete your first session"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div
                className={`flex size-12 items-center justify-center rounded-full ${
                  stats.totalMinutes >= 60 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                <Clock className="size-5" />
              </div>
              <div>
                <p className="font-semibold text-foreground">One Hour</p>
                <p className="text-xs text-muted-foreground">
                  {stats.totalMinutes >= 60 ? "Completed" : "Meditate for 60 minutes total"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div
                className={`flex size-12 items-center justify-center rounded-full ${
                  stats.streak >= 7 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                <Flame className="size-5" fill="currentColor" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Week Streak</p>
                <p className="text-xs text-muted-foreground">
                  {stats.streak >= 7 ? "Completed" : "Practice 7 days in a row"}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

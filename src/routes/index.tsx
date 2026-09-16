import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Moon, Mic, Sparkles } from "lucide-react";
import { useSubscription } from "@/hooks/use-subscription";
import { PLANS } from "@/lib/paddle";
import { SiteFooter } from "@/components/site-footer";
import { PaymentTestModeBanner } from "@/components/payment-test-mode-banner";
import creatorVideo from "@/assets/mandys-creator-message.mp4.asset.json";
import creatorVideoPoster from "@/assets/mandys-creator-message-poster.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Stillpoint — A members-only meditation practice" },
      {
        name: "description",
        content:
          "Stillpoint is a calm daily meditation membership: guided sessions, a new practice each week, moon rituals and your own recorded voice. $2.99/month or $19/year.",
      },
      { property: "og:title", content: "Stillpoint — A members-only meditation practice" },
      {
        property: "og:description",
        content:
          "Guided meditation, weekly sessions and moon rituals for $2.99 a month or $19 a year.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const highlights = [
  {
    icon: Sparkles,
    title: "A new session every week",
    body: "Fresh guided practices arrive each Sunday, alongside the core four you can return to any day.",
  },
  {
    icon: Moon,
    title: "Full moon & half moon rituals",
    body: "Special longer practices that open on the nights the moon turns full or half.",
  },
  {
    icon: Mic,
    title: "Your own voice, if you want it",
    body: "Record each line of guidance yourself. Recordings stay on your device and play in place of the standard voice.",
  },
];

function Landing() {
  const { user, isActive } = useSubscription();

  return (
    <div className="min-h-screen bg-background">
      <PaymentTestModeBanner />
      <main className="mx-auto max-w-md px-6 pt-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Mandy's Meditation Space
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-foreground">
          Stillpoint
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          A quiet daily meditation practice — guided sessions, ambient sound and rituals that
          follow the moon.
        </p>

        <section className="mt-7" aria-labelledby="creator-video-title">
          <div className="mb-3 flex items-baseline justify-between gap-4">
            <h2 id="creator-video-title" className="text-base font-semibold text-foreground">
              A note from Mandy
            </h2>
            <span className="text-xs text-muted-foreground">45 seconds</span>
          </div>
          <video
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
        </section>

        <div className="mt-8 space-y-3">
          {isActive ? (
            <Link
              to="/home"
              className="block rounded-full bg-primary px-6 py-3 text-center text-sm font-semibold text-primary-foreground"
            >
              Enter your practice
            </Link>
          ) : (
            <>
              <Link
                to="/pricing"
                className="block rounded-full bg-primary px-6 py-3 text-center text-sm font-semibold text-primary-foreground"
              >
                Become a member — {PLANS.monthly.price}/month
              </Link>
              <Link
                to="/auth"
                search={{ next: "/pricing" }}
                className="block rounded-full border border-border bg-card px-6 py-3 text-center text-sm font-semibold text-foreground"
              >
                {user ? "Continue" : "Create your account"}
              </Link>
            </>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          {PLANS.monthly.price} per month or {PLANS.yearly.price} per year. Cancel any time.
          30-day money-back guarantee.
        </p>

        <section className="mt-14 space-y-4">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-3xl bg-card p-6 ring-1 ring-border">
                <Icon className="size-5 text-primary" />
                <h2 className="mt-3 text-base font-semibold text-foreground">{item.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
              </div>
            );
          })}
        </section>

        <section className="mt-10 rounded-3xl bg-secondary p-6 ring-1 ring-border">
          <h2 className="text-lg font-semibold text-foreground">Membership</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Everything is included — there is no free tier and no ads.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {[
              `${PLANS.monthly.price} per month`,
              `${PLANS.yearly.price} per year (best value)`,
              "Cancel any time from your account",
              "30-day money-back guarantee",
            ].map((line) => (
              <li key={line} className="flex gap-2">
                <Check className="mt-0.5 size-4 flex-shrink-0 text-primary" />
                {line}
              </li>
            ))}
          </ul>
          <Link
            to="/pricing"
            className="mt-6 block rounded-full bg-primary px-6 py-3 text-center text-sm font-semibold text-primary-foreground"
          >
            See plans and join
          </Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

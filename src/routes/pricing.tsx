import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useSubscription } from "@/hooks/use-subscription";
import { usePaddleCheckout } from "@/hooks/use-paddle-checkout";
import { PLANS, type PlanKey } from "@/lib/paddle";
import { SiteFooter } from "@/components/site-footer";
import { PaymentTestModeBanner } from "@/components/payment-test-mode-banner";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Membership & Pricing — Stillpoint" },
      {
        name: "description",
        content:
          "Stillpoint membership is $2.99 per month or $19 per year, with full access to every guided meditation, weekly session and moon ritual.",
      },
      { property: "og:title", content: "Membership & Pricing — Stillpoint" },
      {
        property: "og:description",
        content: "Full access to every meditation for $2.99 a month or $19 a year.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PricingPage,
});

const included = [
  "Every guided meditation in the library",
  "A brand-new session each week",
  "Full moon and half moon rituals",
  "Ambient soundscapes that soften under each spoken line",
  "Record the guidance in your own voice",
  "Streaks, minutes and milestones",
];

function PricingPage() {
  const { user, isActive, loading } = useSubscription();
  const { openCheckout, loading: checkoutBusy } = usePaddleCheckout();
  const navigate = useNavigate();

  async function choose(plan: PlanKey) {
    if (!user) {
      void navigate({ to: "/auth", search: { next: "/pricing" } });
      return;
    }
    await openCheckout({
      priceId: PLANS[plan].priceId,
      customerEmail: user.email ?? undefined,
      userId: user.id,
      successUrl: `${window.location.origin}/home?checkout=success`,
    });
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <PaymentTestModeBanner />
      <main className="mx-auto max-w-md px-6 pt-14">
        <Link to="/" className="text-sm text-muted-foreground hover:underline">
          ← Stillpoint
        </Link>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground">
          Become a member
        </h1>
        <p className="mt-2 text-muted-foreground">
          One membership. Every practice. Cancel any time.
        </p>

        <div className="mt-8 space-y-4">
          {(Object.keys(PLANS) as PlanKey[]).map((key) => {
            const plan = PLANS[key];
            const isYear = key === "yearly";
            return (
              <div
                key={key}
                className={`rounded-3xl p-6 ring-1 ${
                  isYear ? "bg-secondary ring-primary/40" : "bg-card ring-border"
                }`}
              >
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      {plan.label}
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-foreground">{plan.price}</p>
                    <p className="text-xs text-muted-foreground">{plan.per}</p>
                  </div>
                  {isYear && (
                    <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                      Best value
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  disabled={checkoutBusy || loading}
                  onClick={() => void choose(key)}
                  className="mt-5 w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                >
                  {isActive ? "You're a member" : `Choose ${plan.label.toLowerCase()}`}
                </button>
              </div>
            );
          })}
        </div>

        {isActive && (
          <Link
            to="/account"
            className="mt-6 block text-center text-sm font-medium text-primary hover:underline"
          >
            Manage your membership
          </Link>
        )}

        <section className="mt-10 rounded-3xl bg-card p-6 ring-1 ring-border">
          <h2 className="text-lg font-semibold text-foreground">What's included</h2>
          <ul className="mt-4 space-y-3">
            {included.map((item) => (
              <li key={item} className="flex gap-3 text-sm text-muted-foreground">
                <Check className="mt-0.5 size-4 flex-shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-6 text-xs text-muted-foreground">
          Prices in US dollars. Subscriptions renew automatically each month or year until
          cancelled. You can cancel any time, and we offer a 30-day money-back guarantee — see
          our{" "}
          <Link to="/refunds" className="underline">
            refund policy
          </Link>
          . Payments and invoicing are handled by our reseller Paddle.com, the Merchant of
          Record for all orders of Mandy's Meditation Space.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}

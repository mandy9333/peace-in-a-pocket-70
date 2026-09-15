import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, Loader2 } from "lucide-react";
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

function PricingPage() {
  const { user, isActive, loading } = useSubscription();
  const { openCheckout, loading: checkoutBusy } = usePaddleCheckout();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<PlanKey>("yearly");

  async function checkout() {
    if (!user) {
      void navigate({ to: "/auth", search: { next: "/pricing" } });
      return;
    }
    await openCheckout({
      priceId: PLANS[plan].priceId,
      successUrl: `${window.location.origin}/home?checkout=success`,
    });
  }

  const selected = PLANS[plan];

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
          Every meditation, every ritual, one membership.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-2 rounded-full bg-secondary p-1.5">
          {(Object.keys(PLANS) as PlanKey[]).map((key) => {
            const option = PLANS[key];
            const active = plan === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setPlan(key)}
                className={`relative rounded-full px-4 py-3 text-center transition-colors ${
                  active
                    ? "bg-card shadow-sm ring-1 ring-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {key === "yearly" && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                    Best value
                  </span>
                )}
                <span className="block text-sm font-semibold">{option.label}</span>
                <span className="mt-0.5 block text-lg font-semibold text-foreground">
                  {option.price}
                  <span className="text-xs font-normal text-muted-foreground">
                    {" "}
                    {option.per}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          disabled={checkoutBusy || loading || isActive}
          onClick={() => void checkout()}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-base font-semibold text-primary-foreground disabled:opacity-60"
        >
          {checkoutBusy && <Loader2 className="size-4 animate-spin" />}
          {isActive
            ? "You're a member"
            : user
              ? `Continue — ${selected.price} ${selected.per}`
              : "Sign in to continue"}
        </button>

        {isActive && (
          <Link
            to="/account"
            className="mt-4 block text-center text-sm font-medium text-primary hover:underline"
          >
            Manage your membership
          </Link>
        )}

        <ul className="mt-8 space-y-2.5">
          {[
            "Every guided meditation",
            "A new session each week",
            "Full & half moon rituals",
            "Cancel any time",
          ].map((item) => (
            <li key={item} className="flex gap-3 text-sm text-muted-foreground">
              <Check className="mt-0.5 size-4 flex-shrink-0 text-primary" />
              {item}
            </li>
          ))}
        </ul>

        <p className="mt-8 text-xs text-muted-foreground">
          Renews automatically until cancelled. 30-day money-back guarantee — see our{" "}
          <Link to="/refunds" className="underline">
            refund policy
          </Link>
          . Payments are handled by our reseller Paddle.com, the Merchant of Record for all
          orders of Mandy's Meditation Space.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}

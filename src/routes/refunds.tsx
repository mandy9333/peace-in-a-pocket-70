import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/refunds")({
  head: () => ({
    meta: [
      { title: "Refund Policy — Stillpoint" },
      {
        name: "description",
        content:
          "Stillpoint offers a 30-day money-back guarantee on memberships from Mandy's Meditation Space.",
      },
      { property: "og:title", content: "Refund Policy — Stillpoint" },
      { property: "og:description", content: "A 30-day money-back guarantee on membership." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RefundPage,
});

function RefundPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-2xl px-6 pt-14 pb-8">
        <Link to="/" className="text-sm text-muted-foreground hover:underline">
          ← Stillpoint
        </Link>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground">
          Refund Policy
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated 15 September 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-base font-semibold text-foreground">30-day money-back guarantee</h2>
            <p className="mt-2">
              Mandy's Meditation Space offers a 30-day money-back guarantee on Stillpoint
              memberships. If the practice isn't right for you, request a full refund within 30
              days of your order date and we'll return what you paid.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">How to request a refund</h2>
            <p className="mt-2">
              Refunds are processed by our payment provider and Merchant of Record, Paddle. To
              request one, visit{" "}
              <a
                href="https://paddle.net"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                paddle.net
              </a>{" "}
               with the email address you used at checkout, or contact us at{" "}
               <a href="mailto:Mandygudeman@gmail.com" className="underline">Mandygudeman@gmail.com</a>
              in the app and we'll arrange it for you. Refunds are returned to the original
              payment method, normally within 5–10 business days of approval.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">Cancelling your membership</h2>
            <p className="mt-2">
              You can cancel at any time from your account page in the app. Cancelling stops
              future renewals; your access continues until the end of the period you have already
              paid for. Cancelling on its own doesn't trigger a refund — if you'd also like your
              money back, request a refund as described above.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">Beyond 30 days</h2>
            <p className="mt-2">
              After the 30-day window we will still consider refund requests, for example if you
              were charged in error or couldn't access the service. Paddle's own{" "}
              <a
                href="https://www.paddle.com/legal/refund-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                refund policy
              </a>{" "}
              also applies to every order, and your statutory rights are unaffected.
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

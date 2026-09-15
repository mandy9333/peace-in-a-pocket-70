import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Stillpoint" },
      {
        name: "description",
        content:
          "The terms of using Stillpoint, the meditation membership from Mandy's Meditation Space.",
      },
      { property: "og:title", content: "Terms & Conditions — Stillpoint" },
      {
        property: "og:description",
        content: "The terms of using the Stillpoint meditation membership.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-2xl px-6 pt-14 pb-8">
        <Link to="/" className="text-sm text-muted-foreground hover:underline">
          ← Stillpoint
        </Link>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground">
          Terms &amp; Conditions
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated 15 September 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-base font-semibold text-foreground">1. Who you are contracting with</h2>
            <p className="mt-2">
              Stillpoint is operated by Mandy's Meditation Space ("we", "us", "our"). By creating
              an account, subscribing or continuing to use Stillpoint, you agree to these terms
              and enter into an agreement with Mandy's Meditation Space. You confirm that you are
              of legal age in your country, or have the authority to accept these terms on behalf
              of the organisation you represent.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">2. What Stillpoint provides</h2>
            <p className="mt-2">
              Stillpoint is a digital meditation membership. It gives members access to guided
              audio meditations, a new weekly session, full moon and half moon rituals, ambient
              soundscapes, progress tracking, and tools to record guidance in their own voice.
              Stillpoint supports general wellbeing and is not medical, psychological or
              therapeutic advice, diagnosis or treatment.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">3. Your account</h2>
            <p className="mt-2">
              You must provide accurate information and keep it up to date. You are responsible
              for keeping your login details confidential and for all activity under your account.
              Your membership is for your personal use and may not be shared.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">4. Acceptable use</h2>
            <p className="mt-2">You must not:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>use Stillpoint for any unlawful purpose, or for fraud or spam;</li>
              <li>copy, resell, redistribute, publicly broadcast or sublicense our audio, video or written content;</li>
              <li>infringe anyone's intellectual property rights;</li>
              <li>upload or record content you do not have the rights to;</li>
              <li>interfere with the security of the service, including probing, scraping, reverse engineering, or introducing malware;</li>
              <li>circumvent membership limits or access controls.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">5. Ownership and licence</h2>
            <p className="mt-2">
              Mandy's Meditation Space retains all ownership and intellectual property rights in
              Stillpoint, including its software, recordings, imagery, text and branding. While
              your membership is active we grant you a limited, non-exclusive,
              non-transferable right to stream and use the content for your own personal
              practice. Voice recordings you make stay on your own device and remain yours.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">6. Payment, billing and subscription terms</h2>
            <p className="mt-2">
              Membership is offered on a monthly ($2.99) or yearly ($19) basis, in US dollars, and
              renews automatically at the end of each billing period until cancelled. You can
              cancel at any time from your account page; access continues to the end of the
              period you have already paid for.
            </p>
            <p className="mt-2">
              Our order process is conducted by our online reseller Paddle.com. Paddle.com is the
              Merchant of Record for all our orders. Paddle provides all customer service
              inquiries and handles returns. Payment, billing, tax, cancellation and refund
              mechanics are also governed by{" "}
              <a
                href="https://www.paddle.com/legal/checkout-buyer-terms"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Paddle's Buyer Terms
              </a>
              . Our own refund commitment is set out in our{" "}
              <Link to="/refunds" className="underline">
                Refund Policy
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">7. Service level and warranties</h2>
            <p className="mt-2">
              We work to keep Stillpoint available and reliable, but we do not guarantee that it
              will be uninterrupted, timely, secure or error-free. To the fullest extent permitted
              by law we disclaim all implied warranties, including merchantability and fitness for
              a particular purpose.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">8. Suspension and termination</h2>
            <p className="mt-2">
              We may suspend or terminate your access for material breach of these terms,
              non-payment, security or fraud risk, or repeated or serious policy violations. You
              may stop using Stillpoint and cancel your membership at any time. On termination
              your access to member content ends; you may request a copy of your account data
              before deletion.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">9. Liability</h2>
            <p className="mt-2">
              To the extent permitted by law, our total liability arising from your use of
              Stillpoint is limited to the fees you paid in the twelve months before the claim. We
              are not liable for indirect, consequential or special losses, including loss of
              profits, data or goodwill. Nothing in these terms excludes liability for fraud,
              death or personal injury caused by negligence, or any liability that cannot be
              excluded by law.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">10. Changes, law and contact</h2>
            <p className="mt-2">
              We may update these terms; material changes will be announced in the app. These
              terms are governed by the laws of the seller's jurisdiction, and the courts there
              have jurisdiction over any dispute. Questions? Contact Mandy's Meditation Space
               at <a href="mailto:Mandygudeman@gmail.com" className="underline">Mandygudeman@gmail.com</a>,
               or Paddle for anything to do with billing.
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

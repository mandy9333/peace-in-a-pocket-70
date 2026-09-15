import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Notice — Stillpoint" },
      {
        name: "description",
        content:
          "How Mandy's Meditation Space collects, uses and protects personal data in Stillpoint.",
      },
      { property: "og:title", content: "Privacy Notice — Stillpoint" },
      {
        property: "og:description",
        content: "How we collect, use and protect your personal data.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-2xl px-6 pt-14 pb-8">
        <Link to="/" className="text-sm text-muted-foreground hover:underline">
          ← Stillpoint
        </Link>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground">
          Privacy Notice
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated 15 September 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-base font-semibold text-foreground">Who we are</h2>
            <p className="mt-2">
              Stillpoint is operated by Mandy's Meditation Space, which is the data controller for
              the personal data described here. That means we decide what data is collected and
              why, and we are responsible for looking after it.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">What we collect and why</h2>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                <strong className="text-foreground">Account data</strong> — your email address,
                login credentials and sign-in provider. Used to create and secure your account and
                to give you access to your membership. Legal basis: performance of our contract
                with you.
              </li>
              <li>
                <strong className="text-foreground">Membership status</strong> — plan, status and
                billing period dates received from our payment provider. Used to unlock member
                content and to answer your questions. Legal basis: contract.
              </li>
              <li>
                <strong className="text-foreground">Support messages</strong> — what you send us.
                Used to help you. Legal basis: contract and legitimate interests.
              </li>
              <li>
                <strong className="text-foreground">Technical and usage data</strong> — device and
                browser information, IP address, error reports and basic usage events. Used for
                security, fraud prevention, fixing faults and improving the app. Legal basis:
                legitimate interests.
              </li>
              <li>
                <strong className="text-foreground">Practice data</strong> — streaks, minutes and
                completed sessions. These are stored on your own device, not on our servers.
              </li>
              <li>
                <strong className="text-foreground">Your voice recordings</strong> — recordings you
                make to narrate sessions stay in your browser's storage on your device. We do not
                upload, listen to or store them.
              </li>
            </ul>
            <p className="mt-2">
              Text you choose to have spoken by the generated voice is sent to our text-to-speech
              provider solely to produce that audio.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">Who we share data with</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                Paddle.com, our reseller and Merchant of Record, for the sale of the membership,
                subscription management, payments, invoicing and tax compliance.
              </li>
              <li>
                Service providers and subprocessors that host the app, provide the database and
                authentication, deliver audio and monitor errors.
              </li>
              <li>Professional advisers such as accountants or lawyers, where needed.</li>
              <li>Authorities, where we are required to by law.</li>
            </ul>
            <p className="mt-2">
              We do not sell your personal data. Where data is transferred outside your region, we
              rely on appropriate safeguards such as standard contractual clauses or adequacy
              decisions.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">How long we keep it</h2>
            <p className="mt-2">
              We keep account and membership data for as long as your account is open, and for a
              limited period afterwards to meet legal, accounting and fraud-prevention duties.
              After that it is deleted or anonymised. You can ask us to delete your account at any
              time.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">Your rights</h2>
            <p className="mt-2">
              Depending on where you live, you may have the right to access your data, correct it,
              delete it, restrict or object to its use, receive a portable copy, and withdraw
              consent. If you are in the UK or EEA you may also complain to your local data
               protection authority. Contact us at{" "}
               <a href="mailto:Mandygudeman@gmail.com" className="underline">Mandygudeman@gmail.com</a> and we will
              respond within one month.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">Security and cookies</h2>
            <p className="mt-2">
              We use appropriate technical and organisational measures, including encryption in
              transit, access controls and row-level database security, to protect your data.
              Stillpoint uses only essential cookies and local storage needed to keep you signed
              in and to remember your settings; we do not use advertising cookies. You can clear
              them in your browser settings, though you will then need to sign in again.
            </p>
          </section>

          <section>
            <p>
              See also our{" "}
              <Link to="/terms" className="underline">
                Terms &amp; Conditions
              </Link>{" "}
              and{" "}
              <Link to="/refunds" className="underline">
                Refund Policy
              </Link>
              .
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

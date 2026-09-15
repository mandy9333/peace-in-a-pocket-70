import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sendContactMessage } from "@/utils/contact.functions";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Stillpoint" },
      {
        name: "description",
        content:
          "Questions about Stillpoint or your membership with Mandy's Meditation Space? Send us a message.",
      },
      { property: "og:title", content: "Contact — Stillpoint" },
      {
        property: "og:description",
        content: "Send a question to Mandy's Meditation Space about Stillpoint or your membership.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setError("");
    try {
      await sendContactMessage({ data: { name, email, message } });
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong — please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-2xl px-6 pt-14 pb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Contact us</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Questions about Stillpoint, your membership, or billing? Send a message and Mandy's
          Meditation Space will get back to you at the email you provide. You can also email us
          directly at{" "}
          <a href="mailto:Mandygudeman@gmail.com" className="text-primary hover:underline">
            Mandygudeman@gmail.com
          </a>
          .
        </p>

        {status === "sent" ? (
          <div className="mt-10 rounded-2xl border border-border bg-card p-6 text-center">
            <h2 className="text-base font-semibold text-foreground">Message sent</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Thank you — we'll reply to {email} as soon as we can.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="contact-name">Your name</Label>
              <Input
                id="contact-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={100}
                autoComplete="name"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">Email</Label>
              <Input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={200}
                autoComplete="email"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-message">Your question</Label>
              <Textarea
                id="contact-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                maxLength={5000}
                rows={6}
                className="rounded-xl"
              />
            </div>
            {status === "error" && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={status === "sending"} className="w-full rounded-full">
              {status === "sending" ? "Sending…" : "Send message"}
            </Button>
          </form>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

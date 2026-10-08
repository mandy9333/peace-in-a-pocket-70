import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getMyVoiceRole } from "@/utils/voice.functions";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/creator/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Creator sign-in — Stillpoint" },
      {
        name: "description",
        content: "Creator entrance. Members sign in elsewhere.",
      },
    ],
  }),
  component: CreatorLoginPage,
});

/**
 * The creator's own entrance — separate from the member sign-in.
 * Sign-in only (no sign-ups here); the signed-in account must hold the
 * creator role to reach the studio.
 */
function CreatorLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        if (!cancelled) setChecking(false);
        return;
      }
      try {
        const { isOwner } = await getMyVoiceRole();
        if (!cancelled && isOwner) {
          void navigate({ to: "/creator/dashboard", replace: true });
          return;
        }
      } catch {
        /* fall through to the form */
      }
      if (!cancelled) setChecking(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const { isOwner } = await getMyVoiceRole();
      if (!isOwner) {
        await supabase.auth.signOut();
        toast.error("This entrance is for the creator only.");
        return;
      }
      toast.success("Welcome back, creator.");
      void navigate({ to: "/creator/dashboard", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Opening the studio…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <main className="mx-auto max-w-md px-6 pt-16">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Sparkles className="size-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider">Creator entrance</span>
        </div>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground">
          Studio sign-in
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This door is yours alone. Members sign in on the main page.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-3">
          <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Creator email
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
          />
          <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Password
          </label>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground disabled:opacity-60"
          >
            {busy ? "One moment…" : "Enter the studio"}
          </button>
        </form>
      </main>
    </div>
  );
}

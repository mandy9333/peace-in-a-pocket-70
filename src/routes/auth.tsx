import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Stillpoint" },
      {
        name: "description",
        content: "Sign in or create your Stillpoint account to start your membership.",
      },
      { property: "og:title", content: "Sign in — Stillpoint" },
      {
        property: "og:description",
        content: "Sign in or create your Stillpoint account to start your membership.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    next: typeof search["next"] === "string" ? (search["next"] as string) : undefined,
  }),
  component: AuthPage,
});

function safePath(next?: string) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/home";
  return next;
}

function AuthPage() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navigate({ to: safePath(next), replace: true });
    });
  }, [navigate, next]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}${safePath(next)}` },
        });
        if (error) throw error;
        if (!data.session) {
          toast.success("Check your email to confirm your address, then sign in.");
          setMode("signin");
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      void navigate({ to: safePath(next), replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    try {
      sessionStorage.setItem("stillpoint:next", safePath(next));
    } catch {
      /* ignore */
    }
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in didn't work. Please try again.");
      return;
    }
    if (result.redirected) return;
    void navigate({ to: safePath(next), replace: true });
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <main className="mx-auto max-w-md px-6 pt-16">
        <Link to="/" className="text-sm text-muted-foreground hover:underline">
          ← Stillpoint
        </Link>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "signup"
            ? "One account for your practice, your streaks and your own recorded voice."
            : "Sign in to continue your practice."}
        </p>

        <button
          type="button"
          onClick={handleGoogle}
          className="mt-8 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          Continue with Google
        </button>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or use your email
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="password"
            required
            minLength={6}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {busy ? "One moment…" : mode === "signup" ? "Create account" : "Sign in"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
          className="mt-5 w-full text-sm text-muted-foreground hover:text-foreground"
        >
          {mode === "signup"
            ? "Already have an account? Sign in"
            : "New here? Create an account"}
        </button>
      </main>
      <SiteFooter />
    </div>
  );
}

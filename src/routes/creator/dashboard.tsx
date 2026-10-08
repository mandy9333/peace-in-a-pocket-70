import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getMyVoiceRole } from "@/utils/voice.functions";
import { loadPublishedClips } from "@/lib/published-voice";
import { allSessions } from "@/lib/meditation";
import {
  ArrowRight,
  CalendarHeart,
  FileText,
  Loader2,
  LogOut,
  Mic,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/creator/dashboard")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Creator Studio — Stillpoint" }],
  }),
  component: CreatorDashboard,
});

interface SessionStat {
  id: string;
  title: string;
  total: number;
  inCloud: number;
}

/**
 * The creator's home base: voiceover command center today, with room to
 * grow into meditation drafts and moon-drop scheduling.
 */
function CreatorDashboard() {
  const navigate = useNavigate();
  const [state, setState] = useState<"checking" | "ok" | "denied">("checking");
  const [stats, setStats] = useState<SessionStat[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        void navigate({ to: "/creator", replace: true });
        return;
      }
      try {
        const { isOwner } = await getMyVoiceRole();
        if (cancelled) return;
        if (!isOwner) {
          setState("denied");
          return;
        }
        const clips = await loadPublishedClips(true);
        setStats(
          allSessions.map((s) => ({
            id: s.id,
            title: s.title,
            total: s.voiceover.length,
            inCloud: [...clips.keys()].filter((k) => k.startsWith(`${s.id}:`)).length,
          })),
        );
        setState("ok");
      } catch {
        if (!cancelled) setState("denied");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    void navigate({ to: "/creator", replace: true });
  }

  if (state === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Opening your studio…
        </p>
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="max-w-sm text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-secondary">
            <ShieldAlert className="size-6 text-primary" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
            Creators only
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This studio belongs to the app's creator. If that's you, sign in with your creator
            account.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link
              to="/creator"
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
            >
              Creator sign-in
            </Link>
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              Back to the app
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="flex items-center justify-between px-6 pt-12">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Creator Studio
          </span>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground"
        >
          <LogOut className="size-3.5" /> Sign out
        </button>
      </header>

      <main className="mx-auto max-w-2xl px-6">
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground">
          Your voice, everywhere
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Every take you record now backs up to the cloud automatically — no more lost progress.
          Open a session's studio to record, listen back, and share takes with members.
        </p>

        <h2 className="mt-10 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <Mic className="size-4" /> Voiceover sessions
        </h2>
        <div className="mt-4 space-y-3">
          {stats.map((s) => (
            <Link
              key={s.id}
              to="/record/$id"
              params={{ id: s.id }}
              className="flex items-center justify-between rounded-2xl bg-card p-4 ring-1 ring-border transition-transform active:scale-[0.99]"
            >
              <div>
                <p className="text-[15px] font-semibold text-foreground">{s.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {s.inCloud} of {s.total} takes safe in the cloud
                </p>
                <div className="mt-2 h-1.5 w-40 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${s.total ? Math.round((s.inCloud / s.total) * 100) : 0}%` }}
                  />
                </div>
              </div>
              <span className="flex items-center gap-1 text-[13px] font-medium text-primary">
                Open studio <ArrowRight className="size-4" />
              </span>
            </Link>
          ))}
        </div>

        <h2 className="mt-10 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Coming next
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-card p-4 ring-1 ring-border opacity-70">
            <FileText className="size-5 text-primary" />
            <p className="mt-2 text-[15px] font-semibold text-foreground">Meditation drafts</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Write sessions ahead of time and publish them when they're ready.
            </p>
          </div>
          <div className="rounded-2xl bg-card p-4 ring-1 ring-border opacity-70">
            <CalendarHeart className="size-5 text-primary" />
            <p className="mt-2 text-[15px] font-semibold text-foreground">Moon drops</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Schedule full-moon and new-moon additions on the lunar rhythm.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

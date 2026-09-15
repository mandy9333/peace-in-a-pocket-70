import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/callback")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Completing sign in — Stillpoint" },
      { name: "description", content: "Completing your secure Stillpoint sign in." },
      { property: "og:title", content: "Completing sign in — Stillpoint" },
      { property: "og:description", content: "Completing your secure Stillpoint sign in." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthCallback,
});

function safeStoredPath() {
  const value = sessionStorage.getItem("stillpoint:next");
  sessionStorage.removeItem("stillpoint:next");
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/home";
}

function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    let settled = false;
    const finish = (signedIn: boolean) => {
      if (!active || settled) return;
      settled = true;
      if (signedIn) window.location.replace(safeStoredPath());
      else void navigate({ to: "/auth", search: { next: "/home" }, replace: true });
    };
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) finish(true);
    });
    const timer = window.setTimeout(() => void supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      finish(Boolean(data.user));
    }), 500);
    return () => {
      active = false;
      window.clearTimeout(timer);
      listener.subscription.unsubscribe();
    };
  }, [navigate]);

  return <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">Completing sign in…</div>;
}
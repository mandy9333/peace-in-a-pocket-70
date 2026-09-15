import { createFileRoute, Outlet, redirect, Link, useLocation } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/use-subscription";
import { Lock } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth", search: { next: "/home" } });
    return { user: data.user };
  },
  component: MemberArea,
});

function MemberArea() {
  const { isActive, loading, isPastDue } = useSubscription();
  const location = useLocation();
  const isAccountPage = location.pathname === "/account";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Opening your practice…</p>
      </div>
    );
  }

  if (!isActive && !isAccountPage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="max-w-sm text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-secondary">
            <Lock className="size-6 text-primary" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
            Membership required
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Stillpoint is a members-only practice. Choose a plan to unlock every session,
            weekly practice and moon ritual.
          </p>
          <Link
            to="/pricing"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            See plans
          </Link>
          <p className="mt-4 text-xs text-muted-foreground">
            Already paid?{" "}
            <Link to="/account" className="font-semibold text-primary underline">
              Refresh your membership
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isPastDue && (
        <div className="bg-orange-100 px-4 py-2 text-center text-xs text-orange-900">
          We couldn't take your last payment.{" "}
          <Link to="/account" className="font-semibold underline">
            Update your payment details
          </Link>
        </div>
      )}
      <Outlet />
    </>
  );
}

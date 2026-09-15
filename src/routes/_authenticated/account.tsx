import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/use-subscription";
import { createPortalSession } from "@/utils/payments.functions";
import { deleteMyAccount } from "@/utils/payments.functions";
import { PLANS } from "@/lib/paddle";
import { clearAllRecordings } from "@/lib/voice-recordings";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CreditCard, LogOut, ExternalLink, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "Your membership — Stillpoint" },
      { name: "description", content: "Manage your Stillpoint membership and payment details." },
      { property: "og:title", content: "Your membership — Stillpoint" },
      {
        property: "og:description",
        content: "Manage your Stillpoint membership and payment details.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user, subscription } = useSubscription();
  const openPortal = useServerFn(createPortalSession);
  const removeAccount = useServerFn(deleteMyAccount);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const planLabel =
    subscription?.price_id === PLANS.yearly.priceId
      ? `${PLANS.yearly.label} — ${PLANS.yearly.price} ${PLANS.yearly.per}`
      : `${PLANS.monthly.label} — ${PLANS.monthly.price} ${PLANS.monthly.per}`;

  const renews = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  async function handlePortal() {
    setBusy(true);
    try {
      const { url } = await openPortal({});
      window.open(url, "_blank", "noopener");
    } catch {
      toast.error("We couldn't open your billing page. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", search: { next: "/home" }, replace: true });
  }

  async function handleDeleteAccount() {
    setBusy(true);
    try {
      await removeAccount({ data: { confirmation: "DELETE" } });
      await clearAllRecordings().catch(() => undefined);
      localStorage.removeItem("meditation_stats_v1");
      localStorage.removeItem("stillpoint.voice");
      localStorage.removeItem("stillpoint.sound");
      await queryClient.cancelQueries();
      queryClient.clear();
      await supabase.auth.signOut({ scope: "local" });
      window.location.replace("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We couldn't delete your account.");
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <main className="mx-auto max-w-md px-6 pt-12">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Your membership
          </h1>
          <p className="mt-1 text-muted-foreground">{user?.email}</p>
        </header>

        <section className="rounded-3xl bg-card p-6 ring-1 ring-border">
          <div className="flex items-center gap-2 text-primary">
            <CreditCard className="size-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              {subscription?.status === "past_due"
                ? "Payment problem"
                : subscription?.cancel_at_period_end
                  ? "Ending soon"
                  : "Active"}
            </span>
          </div>
          <p className="mt-3 text-lg font-semibold text-foreground">{planLabel}</p>
          {renews && (
            <p className="mt-1 text-sm text-muted-foreground">
              {subscription?.cancel_at_period_end
                ? `Access until ${renews}`
                : `Renews ${renews}`}
            </p>
          )}
          <Button
            type="button"
            onClick={() => void handlePortal()}
            disabled={busy}
            className="mt-6 h-11 w-full rounded-full"
          >
            {busy ? "Opening…" : "Manage or cancel"}
            <ExternalLink className="size-4" />
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            Opens a secure billing page from Paddle, our Merchant of Record, where you can update
            your card, download invoices or cancel.
          </p>
        </section>

        <section className="mt-6 border-t border-border pt-6">
          <h2 className="text-sm font-semibold text-foreground">Support and account</h2>
          <a
            href="mailto:Mandygudeman@gmail.com"
            className="mt-3 block text-sm text-primary hover:underline"
          >
            Mandygudeman@gmail.com
          </a>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="mt-5 px-0 text-destructive hover:text-destructive">
                <Trash2 className="size-4" /> Delete account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-sm rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your account permanently?</AlertDialogTitle>
                <AlertDialogDescription>
                  Your account, membership record, practice history, and voice recordings on this device will be removed. If your membership still renews, cancel it in the billing portal first.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep account</AlertDialogCancel>
                <AlertDialogAction
                  disabled={busy}
                  onClick={(event) => {
                    event.preventDefault();
                    void handleDeleteAccount();
                  }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {busy ? "Deleting…" : "Delete permanently"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </section>

        <section className="mt-6 space-y-3 text-sm">
          <Link to="/pricing" className="block text-primary hover:underline">
            View plans
          </Link>
          <Link to="/refunds" className="block text-muted-foreground hover:underline">
            Refund policy
          </Link>
          <Link to="/terms" className="block text-muted-foreground hover:underline">
            Terms &amp; conditions
          </Link>
          <Link to="/privacy" className="block text-muted-foreground hover:underline">
            Privacy notice
          </Link>
        </section>

        <button
          type="button"
          onClick={() => void handleSignOut()}
          className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </main>
    </div>
  );
}

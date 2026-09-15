import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { PaddleEnv } from "@/lib/paddle.server";
import { z } from "zod";

const planSchema = z.enum(["stillpoint_monthly", "stillpoint_yearly"]);

function isEntitled(status: string, periodEnd: string | null) {
  const inPeriod = periodEnd === null || new Date(periodEnd).getTime() > Date.now();
  return (["active", "trialing", "past_due"].includes(status) && inPeriod)
    || (status === "canceled" && periodEnd !== null && inPeriod);
}

/** Creates a checkout transaction whose buyer identity is set by the authenticated server. */
export const createCheckoutTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ priceId: planSchema }).parse(data))
  .handler(async ({ data, context }) => {
    const { gatewayFetch, getRequestEnvironment } = await import("@/lib/paddle.server");
    const request = getRequest();
    if (!request) throw new Error("Unable to determine payment environment");
    const environment = getRequestEnvironment(request);
    const priceResponse = await gatewayFetch(
      environment,
      `/prices?external_id=${encodeURIComponent(data.priceId)}`,
    );
    if (!priceResponse.ok) throw new Error("Unable to find this membership plan");
    const priceResult = (await priceResponse.json()) as { data?: Array<{ id: string }> };
    const price = priceResult.data?.[0];
    if (!price) throw new Error("Membership plan is unavailable");

    // Prefill the member's email in checkout by attaching a Paddle customer.
    const email = (context.claims as { email?: string } | undefined)?.email;
    let customerId: string | undefined;
    if (email) {
      const customerResponse = await gatewayFetch(environment, "/customers", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      if (customerResponse.ok) {
        const customerResult = (await customerResponse.json()) as { data?: { id?: string } };
        customerId = customerResult.data?.id;
      }
    }

    const transactionResponse = await gatewayFetch(environment, "/transactions", {
      method: "POST",
      body: JSON.stringify({
        items: [{ price_id: price.id, quantity: 1 }],
        custom_data: { userId: context.userId },
        ...(customerId ? { customer_id: customerId } : {}),
      }),
    });
    const transactionResult = (await transactionResponse.json()) as {
      data?: { id?: string };
      error?: { detail?: string };
    };
    if (!transactionResponse.ok || !transactionResult.data?.id) {
      throw new Error(transactionResult.error?.detail || "Unable to start checkout");
    }
    return { transactionId: transactionResult.data.id };
  });

/** Returns a hosted portal URL where the member can update payment details or cancel. */
export const createPortalSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const request = getRequest();
    if (!request) throw new Error("Unable to determine payment environment");
    const { getRequestEnvironment } = await import("@/lib/paddle.server");
    const environment = getRequestEnvironment(request);
    const { data: rows } = await supabase
      .from("subscriptions")
      .select("paddle_customer_id, paddle_subscription_id, environment")
      .eq("user_id", userId)
      .eq("environment", environment)
      .in("status", ["active", "trialing", "past_due", "canceled"])
      .order("created_at", { ascending: false })
      .limit(10);

    const sub = rows?.[0];
    if (!sub) throw new Error("No membership found");

    const { getPaddleClient } = await import("@/lib/paddle.server");
    const paddle = getPaddleClient(sub.environment as PaddleEnv);
    const session = await paddle.customerPortalSessions.create(sub.paddle_customer_id, [
      sub.paddle_subscription_id,
    ]);
    return { url: session.urls.general.overview };
  });

export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ confirmation: z.literal("DELETE") }).parse(data))
  .handler(async ({ context }) => {
    const request = getRequest();
    if (!request) throw new Error("Unable to determine payment environment");
    const { getRequestEnvironment } = await import("@/lib/paddle.server");
    const environment = getRequestEnvironment(request);
    const { data: subscriptions, error } = await context.supabase
      .from("subscriptions")
      .select("status, current_period_end, cancel_at_period_end")
      .eq("user_id", context.userId)
      .eq("environment", environment);
    if (error) throw error;

    const renewable = (subscriptions ?? []).some((sub) =>
      isEntitled(sub.status, sub.current_period_end) && !sub.cancel_at_period_end,
    );
    if (renewable) {
      throw new Error("Cancel your membership in the billing portal before deleting your account.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(context.userId);
    if (deleteError) throw deleteError;
    return { deleted: true };
  });

export const refreshMySubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const request = getRequest();
    if (!request) throw new Error("Unable to determine payment environment");
    const { gatewayFetch, getRequestEnvironment } = await import("@/lib/paddle.server");
    const environment = getRequestEnvironment(request);
    const { data: rows, error } = await context.supabase
      .from("subscriptions")
      .select("paddle_subscription_id")
      .eq("user_id", context.userId)
      .eq("environment", environment)
      .order("created_at", { ascending: false })
      .limit(10);
    if (error) throw error;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Recovery path: the purchase went through but no webhook ever created a row.
    // Find this member's subscription at Paddle by the userId we set at checkout.
    if (!rows || rows.length === 0) {
      const listResponse = await gatewayFetch(
        environment,
        "/subscriptions?per_page=200&status=active,trialing,past_due,canceled",
      );
      if (listResponse.ok) {
        const listResult = (await listResponse.json()) as {
          data?: Array<{
            id: string;
            customer_id: string;
            status: string;
            custom_data?: { userId?: string } | null;
            current_billing_period?: { starts_at?: string; ends_at?: string } | null;
            scheduled_change?: { action?: string } | null;
            items?: Array<{
              price?: { import_meta?: { external_id?: string } | null } | null;
              product?: { import_meta?: { external_id?: string } | null } | null;
            }>;
          }>;
        };
        const match = listResult.data?.find(
          (sub) => sub.custom_data?.userId === context.userId,
        );
        const priceId = match?.items?.[0]?.price?.import_meta?.external_id;
        const productId = match?.items?.[0]?.product?.import_meta?.external_id;
        if (match && priceId && productId) {
          const { error: insertError } = await supabaseAdmin.from("subscriptions").upsert(
            {
              user_id: context.userId,
              paddle_subscription_id: match.id,
              paddle_customer_id: match.customer_id,
              product_id: productId,
              price_id: priceId,
              status: match.status,
              current_period_start: match.current_billing_period?.starts_at ?? null,
              current_period_end: match.current_billing_period?.ends_at ?? null,
              cancel_at_period_end: match.scheduled_change?.action === "cancel",
              environment,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "paddle_subscription_id" },
          );
          if (insertError) throw insertError;
          return { refreshed: true, recovered: true };
        }
      }
    }

    for (const row of rows ?? []) {
      const response = await gatewayFetch(environment, `/subscriptions/${row.paddle_subscription_id}`);
      if (!response.ok) continue;
      const result = (await response.json()) as {
        data?: {
          status?: string;
          current_billing_period?: { starts_at?: string; ends_at?: string };
          scheduled_change?: { action?: string } | null;
        };
      };
      const subscription = result.data;
      if (!subscription?.status) continue;
      const { error: updateError } = await supabaseAdmin
        .from("subscriptions")
        .update({
          status: subscription.status,
          current_period_start: subscription.current_billing_period?.starts_at ?? null,
          current_period_end: subscription.current_billing_period?.ends_at ?? null,
          cancel_at_period_end: subscription.scheduled_change?.action === "cancel",
          updated_at: new Date().toISOString(),
        })
        .eq("paddle_subscription_id", row.paddle_subscription_id)
        .eq("user_id", context.userId)
        .eq("environment", environment);
      if (updateError) throw updateError;
    }
    return { refreshed: true };
  });

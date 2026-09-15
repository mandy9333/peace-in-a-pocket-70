import { useState } from "react";
import { initializePaddle } from "@/lib/paddle";
import { createCheckoutTransaction } from "@/utils/payments.functions";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

export function usePaddleCheckout() {
  const [loading, setLoading] = useState(false);
  const createTransaction = useServerFn(createCheckoutTransaction);

  const openCheckout = async (options: {
    priceId: string;
    successUrl?: string | undefined;
  }) => {
    setLoading(true);
    try {
      await initializePaddle();
      const [{ transactionId }, { data: userData }] = await Promise.all([
        createTransaction({
          data: { priceId: options.priceId as "stillpoint_monthly" | "stillpoint_yearly" },
        }),
        supabase.auth.getUser(),
      ]);
      const email = userData.user?.email;

      window.Paddle.Checkout.open({
        transactionId,
        ...(email ? { customer: { email } } : {}),
        settings: {
          displayMode: "overlay",
          successUrl: options.successUrl || `${window.location.origin}/home?checkout=success`,
          allowLogout: false,
          variant: "one-page",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return { openCheckout, loading };
}

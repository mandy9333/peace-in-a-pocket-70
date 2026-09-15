import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { getRequestEnvironment } from "@/lib/paddle.server";

const VOICE = "sage";

export const Route = createFileRoute("/api/tts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authHeader = request.headers.get("authorization");
        const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : "";
        if (!token) return Response.json({ error: "Sign in is required." }, { status: 401 });

        const url = process.env["SUPABASE_URL"];
        const publishableKey = process.env["SUPABASE_PUBLISHABLE_KEY"];
        if (!url || !publishableKey) {
          return Response.json({ error: "Membership access is unavailable." }, { status: 500 });
        }
        const supabase = createClient<Database>(url, publishableKey, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data: userData, error: authError } = await supabase.auth.getUser(token);
        const userId = userData.user?.id;
        if (authError || !userId) {
          return Response.json({ error: "Sign in is required." }, { status: 401 });
        }
        const environment = getRequestEnvironment(request);
        const { data: subscriptions, error: membershipError } = await supabase
          .from("subscriptions")
          .select("status, current_period_end")
          .eq("user_id", userId)
          .eq("environment", environment);
        const now = Date.now();
        const entitled = (subscriptions ?? []).some((sub) => {
          const inPeriod = !sub.current_period_end || new Date(sub.current_period_end).getTime() > now;
          return (["active", "trialing", "past_due"].includes(sub.status) && inPeriod)
            || (sub.status === "canceled" && !!sub.current_period_end && inPeriod);
        });
        if (membershipError || !entitled) {
          return Response.json({ error: "An active membership is required." }, { status: 403 });
        }

        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) {
          return new Response(
            JSON.stringify({ error: "Voice guidance is not configured." }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }

        let text = "";
        try {
          const body = (await request.json()) as { text?: unknown };
          if (typeof body.text === "string") text = body.text.trim();
        } catch {
          /* handled below */
        }
        if (!text || text.length > 1200) {
          return new Response(
            JSON.stringify({ error: "Invalid narration text." }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }

        const response = await fetch(
          "https://ai.gateway.lovable.dev/v1/audio/speech",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "openai/gpt-4o-mini-tts",
              input: text,
              voice: VOICE,
              response_format: "mp3",
              speed: 0.9,
              instructions:
                "Speak slowly, softly and warmly, like a meditation guide. Leave gentle pauses at punctuation.",
            }),
          },
        );

        if (!response.ok) {
          const detail = await response.text().catch(() => "");
          console.error(`TTS failed [${response.status}]: ${detail}`);
          return new Response(
            JSON.stringify({ error: detail || "Voice generation failed." }),
            {
              status: response.status,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        return new Response(await response.arrayBuffer(), {
          headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "private, max-age=86400",
          },
        });
      },
    },
  },
});

import { createFileRoute } from "@tanstack/react-router";

const VOICE = "sage";

export const Route = createFileRoute("/api/tts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
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
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});

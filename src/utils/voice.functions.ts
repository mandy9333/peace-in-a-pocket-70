import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { isEntitled } from "@/lib/entitlement";
import type { Database } from "@/integrations/supabase/types";

const BUCKET = "voice-overs";
/** The creator account allowed to publish voiceovers for every member. */
const OWNER_EMAIL = "mandygudeman@gmail.com";

const cueKeySchema = z
  .string()
  .min(3)
  .max(120)
  .regex(/^[a-z0-9-]+:\d{1,3}$/, "Unexpected clip key");

function storagePath(cueKey: string) {
  const [sessionId, index] = cueKey.split(":");
  return `${sessionId}/${index}.webm`;
}

async function assertOwner(userId: string, email: string | undefined) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: roles } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin");
  if (roles && roles.length > 0) return supabaseAdmin;
  if (email && email.toLowerCase() === OWNER_EMAIL) {
    await supabaseAdmin.from("user_roles").upsert(
      { user_id: userId, role: "admin" },
      { onConflict: "user_id,role" },
    );
    return supabaseAdmin;
  }
  throw new Error("Only the creator can publish voiceovers.");
}

/** Grants the creator account its owner role on first sign-in and reports it. */
export const getMyVoiceRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const email = (context.claims as { email?: string } | undefined)?.email;
    try {
      await assertOwner(context.userId, email);
      return { isOwner: true };
    } catch {
      return { isOwner: false };
    }
  });

/** Publishes one recorded clip so every member hears it. */
export const publishVoiceClip = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        cueKey: cueKeySchema,
        audioBase64: z.string().min(100).max(28_000_000),
        mimeType: z.string().min(4).max(80),
        isPublic: z.boolean().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const email = (context.claims as { email?: string } | undefined)?.email;
    const admin = await assertOwner(context.userId, email);
    const bytes = Uint8Array.from(atob(data.audioBase64), (c) => c.charCodeAt(0));
    const path = storagePath(data.cueKey);
    const { error: uploadError } = await admin.storage.from(BUCKET).upload(path, bytes, {
      contentType: data.mimeType,
      upsert: true,
    });
    if (uploadError) throw uploadError;
    const { error } = await admin.from("voice_clips").upsert(
      {
        cue_key: data.cueKey,
        bucket: BUCKET,
        path,
        is_public: data.isPublic ?? false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "cue_key" },
    );
    if (error) throw error;
    return { published: true };
  });

/** Removes a published clip so the generated narration is used again. */
export const unpublishVoiceClip = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ cueKey: cueKeySchema }).parse(data))
  .handler(async ({ data, context }) => {
    const email = (context.claims as { email?: string } | undefined)?.email;
    const admin = await assertOwner(context.userId, email);
    await admin.storage.from(BUCKET).remove([storagePath(data.cueKey)]);
    const { error } = await admin.from("voice_clips").delete().eq("cue_key", data.cueKey);
    if (error) throw error;
    return { removed: true };
  });

/** Playable link for a clip marked public, such as the welcome-page message. */
export const getPublicVoiceClipUrl = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ cueKey: cueKeySchema }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: clip } = await supabaseAdmin
      .from("voice_clips")
      .select("bucket, path, is_public")
      .eq("cue_key", data.cueKey)
      .maybeSingle();
    if (!clip || !clip.is_public) return { url: null as string | null };
    const { data: signed } = await supabaseAdmin.storage
      .from(clip.bucket)
      .createSignedUrl(clip.path, 60 * 60 * 6);
    return { url: signed?.signedUrl ?? null };
  });

/** Playable links for session clips — members with an active membership only. */
export const getMemberVoiceClipUrls = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ cueKeys: z.array(cueKeySchema).min(1).max(40) }).parse(data))
  .handler(async ({ data, context }) => {
    const request = getRequest();
    if (!request) throw new Error("Unable to determine membership environment");
    const { getRequestEnvironment } = await import("@/lib/paddle.server");
    const environment = getRequestEnvironment(request);
    const { data: subscriptions } = await context.supabase
      .from("subscriptions")
      .select("status, current_period_end")
      .eq("user_id", context.userId)
      .eq("environment", environment);
    const entitled = (subscriptions ?? []).some((sub) =>
      isEntitled(sub.status, sub.current_period_end),
    );
    if (!entitled) throw new Error("An active membership is required.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: clips } = await supabaseAdmin
      .from("voice_clips")
      .select("cue_key, bucket, path")
      .in("cue_key", data.cueKeys);
    const urls: Record<string, string> = {};
    for (const clip of clips ?? []) {
      const { data: signed } = await supabaseAdmin.storage
        .from(clip.bucket)
        .createSignedUrl(clip.path, 60 * 60 * 6);
      if (signed?.signedUrl) urls[clip.cue_key] = signed.signedUrl;
    }
    return { urls };
  });

/** Unused placeholder kept out of the client bundle. */
export type VoiceClipClient = ReturnType<typeof createClient<Database>>;

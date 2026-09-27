/**
 * Voiceover clips Mandy has published for every member.
 * Published clips live in the app's cloud storage; playback links are signed
 * on the server (members only, except clips marked public such as the
 * welcome-page message).
 */
import { supabase } from "@/integrations/supabase/client";
import {
  getMemberVoiceClipUrls,
  getPublicVoiceClipUrl,
} from "@/utils/voice.functions";

let publishedCache: Promise<Map<string, boolean>> | null = null;
const urlCache = new Map<string, string>();

/** cue key → is_public, for every clip published so far. */
export function loadPublishedClips(force = false): Promise<Map<string, boolean>> {
  if (!publishedCache || force) {
    publishedCache = supabase
      .from("voice_clips")
      .select("cue_key, is_public")
      .then(({ data }) => {
        const map = new Map<string, boolean>();
        for (const row of data ?? []) map.set(row.cue_key, row.is_public);
        return map;
      })
      .catch(() => new Map<string, boolean>());
  }
  return publishedCache;
}

export function clearPublishedCache() {
  publishedCache = null;
  urlCache.clear();
}

/** Playable URL for a published clip, or null when none is published. */
export async function getPublishedClipUrl(cueKey: string): Promise<string | null> {
  const cached = urlCache.get(cueKey);
  if (cached) return cached;
  const published = await loadPublishedClips();
  if (!published.has(cueKey)) return null;
  try {
    if (published.get(cueKey)) {
      const { url } = await getPublicVoiceClipUrl({ data: { cueKey } });
      if (url) urlCache.set(cueKey, url);
      return url ?? null;
    }
    const { urls } = await getMemberVoiceClipUrls({ data: { cueKeys: [cueKey] } });
    const url = urls[cueKey] ?? null;
    if (url) urlCache.set(cueKey, url);
    return url;
  } catch {
    return null;
  }
}

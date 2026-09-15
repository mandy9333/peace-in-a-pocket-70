import { useCallback, useEffect, useRef, useState } from "react";
import { getRecording } from "@/lib/voice-recordings";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "stillpoint.voice";

/** Speaks meditation guidance cues via the server text-to-speech route. */
export function useVoiceover() {
  const [enabled, setEnabled] = useState(true);
  const [volume, setVolume] = useState(0.9);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef(new Map<string, string>());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { enabled?: boolean; volume?: number };
        if (typeof parsed.enabled === "boolean") setEnabled(parsed.enabled);
        if (typeof parsed.volume === "number") setVolume(parsed.volume);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ enabled, volume }));
    } catch {
      /* ignore */
    }
  }, [enabled, volume]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setIsSpeaking(false);
  }, []);

  const fetchClip = useCallback(async (text: string, key?: string) => {
    const cacheId = key ?? text;
    const cached = cacheRef.current.get(cacheId);
    if (cached) return cached;
    // Prefer the user's own recording for this cue when one exists.
    if (key) {
      try {
        const own = await getRecording(key);
        if (own) {
          const ownUrl = URL.createObjectURL(own);
          cacheRef.current.set(cacheId, ownUrl);
          return ownUrl;
        }
      } catch {
        /* fall back to generated narration */
      }
    }
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error("Sign in is required for voice guidance.");
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      let message = "Voice guidance is unavailable right now.";
      try {
        const body = (await res.json()) as { error?: string };
        if (body.error) message = body.error;
      } catch {
        /* keep default */
      }
      throw new Error(message);
    }
    const url = URL.createObjectURL(await res.blob());
    cacheRef.current.set(cacheId, url);
    return url;
  }, []);

  const speak = useCallback(
    async (text: string, key?: string) => {
      if (!enabled || !text) return;
      try {
        setError(null);
        const url = await fetchClip(text, key);
        let audio = audioRef.current;
        if (!audio) {
          audio = new Audio();
          audio.onended = () => setIsSpeaking(false);
          audioRef.current = audio;
        }
        audio.src = url;
        audio.volume = volume;
        setIsSpeaking(true);
        await audio.play();
      } catch (err) {
        setIsSpeaking(false);
        setError(err instanceof Error ? err.message : "Voice guidance failed.");
      }
    },
    [enabled, fetchClip, volume],
  );

  /** Warm the cache so the first cue starts without a delay. */
  const prefetch = useCallback(
    (cues: { text: string; key?: string }[]) => {
      if (!enabled) return;
      void (async () => {
        for (const cue of cues) {
          try {
            await fetchClip(cue.text, cue.key);
          } catch {
            return;
          }
        }
      })();
    },
    [enabled, fetchClip],
  );

  useEffect(() => {
    const cache = cacheRef.current;
    return () => {
      audioRef.current?.pause();
      cache.forEach((url) => URL.revokeObjectURL(url));
      cache.clear();
    };
  }, []);

  return {
    enabled,
    setEnabled,
    volume,
    setVolume,
    isSpeaking,
    error,
    speak,
    stop,
    prefetch,
  };
}

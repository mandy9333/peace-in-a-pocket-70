import { useCallback, useEffect, useRef, useState } from "react";

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

  const fetchClip = useCallback(async (text: string) => {
    const cached = cacheRef.current.get(text);
    if (cached) return cached;
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    cacheRef.current.set(text, url);
    return url;
  }, []);

  const speak = useCallback(
    async (text: string) => {
      if (!enabled || !text) return;
      try {
        setError(null);
        const url = await fetchClip(text);
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
    (texts: string[]) => {
      if (!enabled) return;
      void (async () => {
        for (const text of texts) {
          try {
            await fetchClip(text);
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

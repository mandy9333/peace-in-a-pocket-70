import { useCallback, useEffect, useRef, useState } from "react";
import type { MeditationCategory } from "@/lib/meditation";

/** Per-category ambient recipe: drone partials (Hz) + a slow shimmer voice. */
const recipes: Record<
  MeditationCategory,
  { partials: number[]; shimmer: number; lfoRate: number; filter: number }
> = {
  morning: { partials: [110, 165, 220, 330], shimmer: 660, lfoRate: 0.08, filter: 1200 },
  sleep: { partials: [65.4, 98, 130.8], shimmer: 261.6, lfoRate: 0.05, filter: 600 },
  focus: { partials: [146.8, 220, 293.7], shimmer: 587.3, lfoRate: 0.12, filter: 1600 },
  calm: { partials: [98, 146.8, 196, 246.9], shimmer: 493.9, lfoRate: 0.07, filter: 900 },
};

const STORAGE_KEY = "stillpoint.sound";

interface Nodes {
  ctx: AudioContext;
  master: GainNode;
  stop: () => void;
}

export function useSoundscape(category: MeditationCategory) {
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(false);
  const nodesRef = useRef<Nodes | null>(null);
  const playingRef = useRef(false);

  // Load persisted preferences after mount (avoids SSR mismatch).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { volume?: number; muted?: boolean };
        if (typeof parsed.volume === "number") setVolume(parsed.volume);
        if (typeof parsed.muted === "boolean") setMuted(parsed.muted);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ volume, muted }));
    } catch {
      /* ignore */
    }
  }, [volume, muted]);

  // While guidance is speaking the ambient bed dips instead of stopping,
  // so music keeps flowing in the pauses between words.
  const [ducked, setDucked] = useState(false);
  const target = muted ? 0 : volume * 0.25 * (ducked ? 0.45 : 1);

  const build = useCallback(() => {
    const AudioCtor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtor) return null;

    const ctx = new AudioCtor();
    const recipe = recipes[category];

    const master = ctx.createGain();
    master.gain.value = 0;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = recipe.filter;
    filter.Q.value = 0.6;
    filter.connect(master);
    master.connect(ctx.destination);

    const oscillators: OscillatorNode[] = [];

    recipe.partials.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 0 ? "sine" : "triangle";
      osc.frequency.value = freq;
      osc.detune.value = (i % 2 === 0 ? 1 : -1) * (3 + i * 2);

      const gain = ctx.createGain();
      gain.gain.value = 0.5 / (i + 1.4);
      osc.connect(gain).connect(filter);

      // Slow breathing swell per partial.
      const lfo = ctx.createOscillator();
      lfo.frequency.value = recipe.lfoRate * (1 + i * 0.23);
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = gain.gain.value * 0.6;
      lfo.connect(lfoGain).connect(gain.gain);

      osc.start();
      lfo.start();
      oscillators.push(osc, lfo);
    });

    // Airy shimmer voice, very quiet.
    const shimmer = ctx.createOscillator();
    shimmer.type = "sine";
    shimmer.frequency.value = recipe.shimmer;
    const shimmerGain = ctx.createGain();
    shimmerGain.gain.value = 0.04;
    shimmer.connect(shimmerGain).connect(filter);
    shimmer.start();
    oscillators.push(shimmer);

    return {
      ctx,
      master,
      stop: () => {
        oscillators.forEach((o) => {
          try {
            o.stop();
          } catch {
            /* already stopped */
          }
        });
      },
    } satisfies Nodes;
  }, [category]);

  const fade = (node: GainNode, ctx: AudioContext, to: number, seconds: number) => {
    const now = ctx.currentTime;
    node.gain.cancelScheduledValues(now);
    node.gain.setValueAtTime(node.gain.value, now);
    node.gain.linearRampToValueAtTime(to, now + seconds);
  };

  const start = useCallback(async () => {
    if (!nodesRef.current) {
      const built = build();
      if (!built) return;
      nodesRef.current = built;
    }
    const nodes = nodesRef.current;
    playingRef.current = true;
    if (nodes.ctx.state === "suspended") await nodes.ctx.resume();
    fade(nodes.master, nodes.ctx, target, 2.5);
  }, [build, target]);

  const pause = useCallback(() => {
    playingRef.current = false;
    const nodes = nodesRef.current;
    if (!nodes) return;
    fade(nodes.master, nodes.ctx, 0, 1.2);
  }, []);

  const teardown = useCallback(() => {
    const nodes = nodesRef.current;
    if (!nodes) return;
    nodesRef.current = null;
    playingRef.current = false;
    nodes.stop();
    void nodes.ctx.close();
  }, []);

  // Live-apply volume/mute while playing.
  useEffect(() => {
    const nodes = nodesRef.current;
    if (!nodes || !playingRef.current) return;
    fade(nodes.master, nodes.ctx, target, 0.4);
  }, [target]);

  useEffect(() => teardown, [teardown]);

  return { volume, setVolume, muted, setMuted, start, pause, teardown };
}

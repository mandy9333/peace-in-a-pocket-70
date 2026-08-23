import { useState, useEffect, useCallback } from "react";

export interface MeditationStats {
  totalMinutes: number;
  sessionsCompleted: number;
  streak: number;
  lastPracticeDate: string | null;
  weeklyProgress: boolean[];
}

const STORAGE_KEY = "meditation_stats_v1";

const getToday = () => new Date().toISOString().split("T")[0] as string;

const getYesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0] as string;
};

const defaultStats: MeditationStats = {
  totalMinutes: 0,
  sessionsCompleted: 0,
  streak: 0,
  lastPracticeDate: null,
  weeklyProgress: [false, false, false, false, false, false, false],
};

const loadStats = (): MeditationStats => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStats;
    const parsed = JSON.parse(raw) as MeditationStats;
    return { ...defaultStats, ...parsed };
  } catch {
    return defaultStats;
  }
};

const saveStats = (stats: MeditationStats) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // ignore
  }
};

export const useMeditationStats = () => {
  const [stats, setStats] = useState<MeditationStats>(defaultStats);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setStats(loadStats());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveStats(stats);
  }, [stats, hydrated]);

  const recordSession = useCallback((minutes: number) => {
    const today: string = getToday() ?? null;
    const yesterday = getYesterday();

    setStats((prev) => {
      let newStreak = prev.streak;
      if (prev.lastPracticeDate === today) {
        // already practiced today, keep streak
      } else if (prev.lastPracticeDate === yesterday) {
        newStreak = prev.streak + 1;
      } else {
        newStreak = 1;
      }

      const weeklyProgress = [...prev.weeklyProgress];
      const dayIndex = new Date().getDay();
      weeklyProgress[dayIndex] = true;

      return {
        totalMinutes: prev.totalMinutes + minutes,
        sessionsCompleted: prev.sessionsCompleted + 1,
        streak: newStreak,
        lastPracticeDate: today,
        weeklyProgress,
      };
    });
  }, []);

  return { stats, hydrated, recordSession };
};

/** Simple moon phase math — good to within a few hours, no network needed. */

const SYNODIC = 29.530588853;
/** Known new moon: 2000-01-06 18:14 UTC */
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14) / 86400000;

export type MoonPhase =
  | "new"
  | "waxing-crescent"
  | "first-quarter"
  | "waxing-gibbous"
  | "full"
  | "waning-gibbous"
  | "last-quarter"
  | "waning-crescent";

/** Days since the last new moon (0 – 29.53). */
export const moonAge = (date: Date) => {
  const days = date.getTime() / 86400000;
  const age = (days - KNOWN_NEW_MOON) % SYNODIC;
  return age < 0 ? age + SYNODIC : age;
};

export const moonPhase = (date: Date): MoonPhase => {
  const age = moonAge(date);
  if (age < 1.0 || age >= SYNODIC - 1.0) return "new";
  if (age < 6.4) return "waxing-crescent";
  if (age < 8.4) return "first-quarter";
  if (age < 13.8) return "waxing-gibbous";
  if (age < 15.8) return "full";
  if (age < 21.1) return "waning-gibbous";
  if (age < 23.1) return "last-quarter";
  return "waning-crescent";
};

export const moonPhaseLabel: Record<MoonPhase, string> = {
  new: "New Moon",
  "waxing-crescent": "Waxing Crescent",
  "first-quarter": "First Quarter",
  "waxing-gibbous": "Waxing Gibbous",
  full: "Full Moon",
  "waning-gibbous": "Waning Gibbous",
  "last-quarter": "Last Quarter",
  "waning-crescent": "Waning Crescent",
};

/** Which special moon practice, if any, is open today. */
export const activeMoonRitual = (date: Date): "full" | "half" | null => {
  const phase = moonPhase(date);
  if (phase === "full") return "full";
  if (phase === "first-quarter" || phase === "last-quarter") return "half";
  return null;
};

/** Whole weeks since Sunday 2024-01-07 — drives the weekly session rotation. */
export const weekIndex = (date: Date) => {
  const start = Date.UTC(2024, 0, 7);
  return Math.max(0, Math.floor((date.getTime() - start) / (7 * 86400000)));
};

/** Sunday that starts the current week, in local time. */
export const weekStart = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
};

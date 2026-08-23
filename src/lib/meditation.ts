import sessionMorning from "@/assets/session-morning.jpg";
import sessionSleep from "@/assets/session-sleep.jpg";
import sessionFocus from "@/assets/session-focus.jpg";
import sessionCalm from "@/assets/session-calm.jpg";

export type MeditationCategory = "morning" | "sleep" | "focus" | "calm";

export interface MeditationSession {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  category: MeditationCategory;
  image: string;
  label: string;
}

export const sessions: MeditationSession[] = [
  {
    id: "morning-stillness",
    title: "Morning Stillness",
    description: "A ten-minute practice to anchor your attention for the day ahead.",
    durationMinutes: 10,
    category: "morning",
    image: sessionMorning,
    label: "Daily Foundation",
  },
  {
    id: "deep-rest",
    title: "Deep Rest",
    description: "Release the day and settle into a quiet body for restful sleep.",
    durationMinutes: 20,
    category: "sleep",
    image: sessionSleep,
    label: "Sleep",
  },
  {
    id: "center-point",
    title: "Center Point",
    description: "Sharpen focus with a guided breath and body-scan practice.",
    durationMinutes: 8,
    category: "focus",
    image: sessionFocus,
    label: "Focus",
  },
  {
    id: "quiet-garden",
    title: "Quiet Garden",
    description: "A gentle reset for anxious moments and scattered thoughts.",
    durationMinutes: 12,
    category: "calm",
    image: sessionCalm,
    label: "Calm",
  },
];

export const getSessionById = (id: string) =>
  sessions.find((s) => s.id === id) ?? sessions[0];

export const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

export const categoryLabel: Record<MeditationCategory, string> = {
  morning: "Morning",
  sleep: "Sleep",
  focus: "Focus",
  calm: "Calm",
};

import sessionMorningAsset from "@/assets/session-morning.jpg.asset.json";
import sessionSleepAsset from "@/assets/session-sleep.jpg.asset.json";
import sessionFocusAsset from "@/assets/session-focus.jpg.asset.json";
import sessionCalmAsset from "@/assets/session-calm.jpg.asset.json";

const sessionMorning = sessionMorningAsset.url;
const sessionSleep = sessionSleepAsset.url;
const sessionFocus = sessionFocusAsset.url;
const sessionCalm = sessionCalmAsset.url;

export type MeditationCategory = "morning" | "sleep" | "focus" | "calm";

/** A spoken guidance line, played at `at` seconds into the session. */
export interface VoiceCue {
  at: number;
  text: string;
}

export interface MeditationSession {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  category: MeditationCategory;
  image: string;
  label: string;
  voiceover: VoiceCue[];
}


export const sessions: MeditationSession[] = [
  {
    id: "morning-stillness",
    title: "10 Minutes of Recalibration",
    description: "A ten-minute practice to reset your mind and recalibrate for the day ahead.",
    durationMinutes: 10,
    category: "morning",
    image: sessionMorning,
    label: "Daily Foundation",
  },
  {
    id: "deep-rest",
    title: "De-stress Portal",
    description: "Step through a guided doorway to release tension and settle into restful sleep.",
    durationMinutes: 20,
    category: "sleep",
    image: sessionSleep,
    label: "Sleep",
  },
  {
    id: "center-point",
    title: "Balancing the Scales",
    description: "A focused breath and body-scan practice to steady attention and restore equilibrium.",
    durationMinutes: 8,
    category: "focus",
    image: sessionFocus,
    label: "Focus",
  },
  {
    id: "quiet-garden",
    title: "True Peace",
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

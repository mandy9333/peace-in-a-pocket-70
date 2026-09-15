import sessionMorningAsset from "@/assets/session-morning.jpg.asset.json";
import sessionSleepAsset from "@/assets/session-sleep.jpg.asset.json";
import sessionFocusAsset from "@/assets/session-focus.jpg.asset.json";
import sessionCalmAsset from "@/assets/session-calm.jpg.asset.json";
import sessionFullMoon from "@/assets/session-full-moon.jpg";
import sessionHalfMoon from "@/assets/session-half-moon.jpg";
import sessionWeeklyA from "@/assets/session-weekly-a.jpg";
import sessionWeeklyB from "@/assets/session-weekly-b.jpg";
import { activeMoonRitual, weekIndex } from "@/lib/moon";

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
    voiceover: [
      { at: 2, text: "Welcome. Settle in, and let your eyes soften or close. For the next ten minutes, there is nothing to fix and nowhere to be." },
      { at: 45, text: "Draw a slow breath in through the nose. And let it go, longer than you took it in. Let your shoulders drop away from your ears." },
      { at: 150, text: "Notice where the day is already pulling at you. Name it quietly, and set it down beside you. It will still be there when you are ready." },
      { at: 300, text: "Come back to the breath. Feel it move through the chest, the belly, the whole body. This is your baseline. This is calibration." },
      { at: 450, text: "Picture the hours ahead moving at your pace, not theirs. Steady. Unhurried. Chosen." },
      { at: 555, text: "Begin to deepen the breath. Feel your hands, your feet. When you are ready, open your eyes and carry this stillness with you." },
    ],
  },
  {
    id: "deep-rest",
    title: "De-stress Portal",
    description: "Step through a guided doorway to release tension and settle into restful sleep.",
    durationMinutes: 20,
    category: "sleep",
    image: sessionSleep,
    label: "Sleep",
    voiceover: [
      { at: 2, text: "Let yourself grow heavy. Wherever you are resting, allow the surface beneath you to hold your full weight." },
      { at: 60, text: "Imagine a doorway just ahead of you, warm and quiet. With each breath out, you move a little closer to it." },
      { at: 240, text: "Step through. On this side, the day you carried is no longer yours to hold. Let your jaw unclench. Let your hands open." },
      { at: 480, text: "Soften the forehead. The eyes. The throat. The chest. The belly. Let each part of you sink a little deeper." },
      { at: 780, text: "Your breath does not need your help now. Let it slow on its own, like a tide going out." },
      { at: 1020, text: "There is nothing left to do. Drift. Rest. You are safe here." },
    ],
  },
  {
    id: "center-point",
    title: "Balancing the Scales",
    description: "A focused breath and body-scan practice to steady attention and restore equilibrium.",
    durationMinutes: 8,
    category: "focus",
    image: sessionFocus,
    label: "Focus",
    voiceover: [
      { at: 2, text: "Sit tall. Crown lifting, shoulders wide, hands resting easily. Find the point where you are neither straining nor slumping." },
      { at: 50, text: "Breathe in for four. Hold for two. Out for six. Let the rhythm do the steadying for you." },
      { at: 160, text: "Scan slowly from the top of the head down to the feet. Where you find tightness, breathe into it and let it ease." },
      { at: 300, text: "Picture two scales, slowly coming level. Effort on one side, ease on the other. Let them balance." },
      { at: 400, text: "When attention drifts, that is not failure. Notice it, and return. That return is the whole practice." },
      { at: 450, text: "Take one full breath. Feel clear and level. Open your eyes and begin again from here." },
    ],
  },
  {
    id: "quiet-garden",
    title: "True Peace",
    description: "A gentle reset for anxious moments and scattered thoughts.",
    durationMinutes: 12,
    category: "calm",
    image: sessionCalm,
    label: "Calm",
    voiceover: [
      { at: 2, text: "You do not have to calm down. You only have to be here. Take one honest breath, however it comes." },
      { at: 60, text: "Feel three points of contact: your feet, your seat, your hands. You are held by all of them." },
      { at: 210, text: "Let your thoughts move like weather across a wide sky. You are not the weather. You are the sky." },
      { at: 420, text: "Breathe in gently. Breathe out a little longer. With each exhale, let something small go." },
      { at: 570, text: "Peace is not the absence of noise. It is the space you keep beneath it. That space is always yours." },
      { at: 690, text: "Come back slowly. Move your fingers, your shoulders. Carry this quiet with you into the room." },
    ],
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

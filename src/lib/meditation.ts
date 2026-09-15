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


/** A new one of these opens every week, rotating through the year. */
export const weeklySessions: MeditationSession[] = [
  {
    id: "weekly-clean-slate",
    title: "Clean Slate",
    description: "A weekly reset that clears what last week left behind.",
    durationMinutes: 10,
    category: "morning",
    image: sessionWeeklyA,
    label: "This Week",
    voiceover: [
      { at: 2, text: "This is a new week. Nothing from the last one has to follow you into it. Take one slow breath and begin here." },
      { at: 120, text: "Think of one thing you are ready to leave behind. Breathe it out, all the way out, and let the week open in front of you." },
      { at: 360, text: "Now choose one word for the days ahead. Hold it on the breath in. Steady, quiet, yours." },
      { at: 555, text: "Come back gently. The slate is clean. Step into the week from this stillness." },
    ],
  },
  {
    id: "weekly-slow-water",
    title: "Slow Water",
    description: "Let a hurried mind settle the way water settles when it is left alone.",
    durationMinutes: 12,
    category: "calm",
    image: sessionWeeklyB,
    label: "This Week",
    voiceover: [
      { at: 2, text: "Nothing here needs to move quickly. Let your breath find its own slow pace." },
      { at: 150, text: "Picture stirred water going still. You are not clearing it. You are simply letting it be undisturbed." },
      { at: 420, text: "Each exhale, a little more settles. Each pause, a little more clarity." },
      { at: 675, text: "Stay slow as you return. Carry the stillness at the surface with you." },
    ],
  },
  {
    id: "weekly-open-hands",
    title: "Open Hands",
    description: "A practice in letting go of what you cannot control this week.",
    durationMinutes: 10,
    category: "calm",
    image: sessionWeeklyA,
    label: "This Week",
    voiceover: [
      { at: 2, text: "Rest your hands palms up. This is the shape of letting go. Let your breath soften." },
      { at: 130, text: "Name what is not yours to carry. Place it in your open hands, and let the exhale take it." },
      { at: 380, text: "What is left is what you can actually touch. That is enough for this week." },
      { at: 555, text: "Close your hands slowly. Hold only what you chose. Open your eyes." },
    ],
  },
  {
    id: "weekly-steady-ground",
    title: "Steady Ground",
    description: "A grounding practice for a week that feels uncertain.",
    durationMinutes: 8,
    category: "focus",
    image: sessionWeeklyB,
    label: "This Week",
    voiceover: [
      { at: 2, text: "Feel the ground beneath you. It is not asking anything of you. It is simply holding you." },
      { at: 110, text: "Breathe in for four. Out for six. Let the rhythm be the thing you stand on." },
      { at: 300, text: "Uncertainty does not need to be solved today. Only met, one breath at a time." },
      { at: 450, text: "Press your feet down once. Feel steady. Rise from here." },
    ],
  },
  {
    id: "weekly-quiet-courage",
    title: "Quiet Courage",
    description: "Gather calm strength for something the week is asking of you.",
    durationMinutes: 10,
    category: "morning",
    image: sessionWeeklyA,
    label: "This Week",
    voiceover: [
      { at: 2, text: "Sit tall. Courage is quieter than we expect. It often looks like a steady breath." },
      { at: 140, text: "Bring to mind what the week is asking of you. Do not push it away. Breathe alongside it." },
      { at: 390, text: "You have done difficult things before, breath by breath. This is the same." },
      { at: 555, text: "Feel your spine long, your breath even. Go and do the next small thing." },
    ],
  },
  {
    id: "weekly-soft-landing",
    title: "Soft Landing",
    description: "Close out the week and set your body down gently.",
    durationMinutes: 15,
    category: "sleep",
    image: sessionWeeklyB,
    label: "This Week",
    voiceover: [
      { at: 2, text: "The week is behind you now. Let your body grow heavy where it rests." },
      { at: 180, text: "Let each part of you land: shoulders, hands, hips, feet. Nothing more to hold up." },
      { at: 540, text: "Let the breath slow on its own. You do not need to guide it any longer." },
      { at: 840, text: "Rest here as long as you like. You have arrived." },
    ],
  },
];

/** Special practices that only open on a full moon or a half moon. */
export const fullMoonSession: MeditationSession = {
  id: "full-moon-release",
  title: "Full Moon Release",
  description: "A full-moon ritual for releasing what has run its course.",
  durationMinutes: 15,
  category: "calm",
  image: sessionFullMoon,
  label: "Full Moon",
  voiceover: [
    { at: 2, text: "Tonight the moon is full. Nothing is hidden. Sit with that openness and take one long breath." },
    { at: 150, text: "Bring to mind what has run its course. A worry, a habit, a story you keep retelling. See it clearly, without judgment." },
    { at: 420, text: "On this exhale, release it. Not forced. Simply set down, the way the tide lets go of the shore." },
    { at: 660, text: "Feel the space that opens where it used to live. Let the light fill it." },
    { at: 840, text: "The moon will wane and so will this. Come back slowly, lighter than you arrived." },
  ],
};

export const halfMoonSession: MeditationSession = {
  id: "half-moon-balance",
  title: "Half Moon Balance",
  description: "A quarter-moon practice for holding light and dark in balance.",
  durationMinutes: 10,
  category: "focus",
  image: sessionHalfMoon,
  label: "Half Moon",
  voiceover: [
    { at: 2, text: "The moon is exactly half tonight. Light and dark, held evenly. Sit tall and breathe." },
    { at: 130, text: "Notice what is bright in your life right now. Give it one full breath, without grasping." },
    { at: 320, text: "Now notice what is shadowed. Give it one full breath too, without turning away." },
    { at: 480, text: "Neither side needs to win. Balance is not stillness. It is a constant, gentle correction." },
    { at: 555, text: "Take one level breath. Rise, balanced, and carry both halves with you." },
  ],
};

export const moonSessions = [fullMoonSession, halfMoonSession];

/** The rotating session for the week containing `date`. */
export const getWeeklySession = (date: Date) =>
  weeklySessions[weekIndex(date) % weeklySessions.length]!;

/** The moon practice open on `date`, if any. */
export const getMoonSession = (date: Date) => {
  const ritual = activeMoonRitual(date);
  if (ritual === "full") return fullMoonSession;
  if (ritual === "half") return halfMoonSession;
  return null;
};

export const allSessions: MeditationSession[] = [
  ...sessions,
  ...weeklySessions,
  ...moonSessions,
];

export const getSessionById = (id: string) =>
  allSessions.find((s) => s.id === id) ?? sessions[0];

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

import type { ActivityKind } from "./types";

export interface ActivityPreset {
  title: string;
  kind: ActivityKind;
  durationMin: number;
}

export const ACTIVITY_PRESETS: ActivityPreset[] = [
  { title: "Pull Session", kind: "training", durationMin: 45 },
  { title: "Push Session", kind: "training", durationMin: 45 },
  { title: "Legs & Pistols", kind: "training", durationMin: 40 },
  { title: "Core & L-Sit", kind: "training", durationMin: 25 },
  { title: "Muscle-Up Skill", kind: "skill", durationMin: 30 },
  { title: "Handstand Skill", kind: "skill", durationMin: 30 },
  { title: "CAP Bootcamp", kind: "event", durationMin: 90 },
  { title: "Street Workout", kind: "game", durationMin: 60 },
  { title: "Morning Mobility", kind: "recovery", durationMin: 20 },
  { title: "Cooldown", kind: "recovery", durationMin: 15 },
];

export const DURATION_PRESETS = [15, 20, 30, 45, 60, 90];

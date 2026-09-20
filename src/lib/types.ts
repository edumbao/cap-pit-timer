export const ACTIVITY_KINDS = [
  "training",
  "skill",
  "event",
  "game",
  "recovery",
] as const;

export type ActivityKind = (typeof ACTIVITY_KINDS)[number];

export const KIND_LABEL: Record<ActivityKind, string> = {
  training: "Training",
  skill: "Skill",
  event: "Event",
  game: "Game",
  recovery: "Recovery",
};

export type TabId = "today" | "timer" | "log";

export interface Alarm {
  id: string;
  title: string;
  kind: ActivityKind;
  time: string;
  date: string;
  repeatDaily: boolean;
  durationMin: number;
  enabled: boolean;
  completedDates: string[];
  createdAt: number;
}

export interface HistoryItem {
  id: string;
  title: string;
  kind: ActivityKind;
  durationMs: number;
  completedAt: number;
  alarmId?: string;
}

export interface ActiveSession {
  id: string;
  alarmId?: string;
  title: string;
  kind: ActivityKind;
  startedAt: number;
  accumulatedMs: number;
  running: boolean;
  targetMs: number;
}

export interface RingingState {
  alarmId: string;
  firedAt: number;
}

export type SlotStatus =
  | "upcoming"
  | "next"
  | "ringing"
  | "live"
  | "done"
  | "missed";

export interface DaySlot {
  alarm: Alarm;
  status: SlotStatus;
  at: Date;
}

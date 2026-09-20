import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ActiveSession,
  ActivityKind,
  Alarm,
  HistoryItem,
  RingingState,
  TabId,
} from "./types";
import { addMinutesToStamp, sessionElapsed, todayISO } from "./time";

interface ClockState {
  initialized: boolean;
  tab: TabId;
  alarms: Alarm[];
  history: HistoryItem[];
  session: ActiveSession | null;
  ringing: RingingState | null;
  lastFired: Record<string, string>;
  notifyReady: boolean;
  setTab: (tab: TabId) => void;
  markNotifyReady: () => void;
  ensureSeed: () => void;
  addAlarm: (input: {
    title: string;
    kind: ActivityKind;
    time: string;
    date: string;
    repeatDaily: boolean;
    durationMin: number;
  }) => string;
  updateAlarm: (id: string, patch: Partial<Alarm>) => void;
  removeAlarm: (id: string) => void;
  fireAlarm: (alarmId: string, key: string) => void;
  dismissRing: () => void;
  snoozeRing: (minutes?: number) => void;
  startSession: (input: {
    title: string;
    kind: ActivityKind;
    alarmId?: string;
    targetMin?: number;
  }) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  completeSession: () => void;
  discardSession: () => void;
  completeAlarm: (alarmId: string, durationMs?: number) => void;
}

function uid(): string {
  return crypto.randomUUID();
}

const DEFAULT_ALARMS: Alarm[] = [
  {
    id: "seed-mobility",
    title: "Morning Mobility",
    kind: "recovery",
    time: "06:30",
    date: "2000-01-01",
    repeatDaily: true,
    durationMin: 20,
    enabled: true,
    completedDates: [],
    createdAt: 0,
  },
  {
    id: "seed-pull",
    title: "Pull Session",
    kind: "training",
    time: "09:00",
    date: "2000-01-01",
    repeatDaily: true,
    durationMin: 45,
    enabled: true,
    completedDates: [],
    createdAt: 0,
  },
  {
    id: "seed-skill",
    title: "Muscle-Up Skill",
    kind: "skill",
    time: "12:00",
    date: "2000-01-01",
    repeatDaily: true,
    durationMin: 30,
    enabled: true,
    completedDates: [],
    createdAt: 0,
  },
  {
    id: "seed-street",
    title: "Street Workout",
    kind: "game",
    time: "17:00",
    date: "2000-01-01",
    repeatDaily: true,
    durationMin: 60,
    enabled: true,
    completedDates: [],
    createdAt: 0,
  },
  {
    id: "seed-bootcamp",
    title: "CAP Bootcamp",
    kind: "event",
    time: "18:00",
    date: "2000-01-01",
    repeatDaily: true,
    durationMin: 90,
    enabled: true,
    completedDates: [],
    createdAt: 0,
  },
];

export const useClockStore = create<ClockState>()(
  persist(
    (set, get) => ({
      initialized: true,
      tab: "today",
      alarms: DEFAULT_ALARMS,
      history: [],
      session: null,
      ringing: null,
      lastFired: {},
      notifyReady: false,
      setTab: (tab) => set({ tab }),
      markNotifyReady: () => set({ notifyReady: true }),
      ensureSeed: () => {
        const { initialized, alarms } = get();
        if (initialized && alarms.length > 0) return;
        if (initialized) return;
        set({
          initialized: true,
          alarms: DEFAULT_ALARMS,
          history: get().history,
        });
      },
      addAlarm: (input) => {
        const id = uid();
        const alarm: Alarm = {
          id,
          title: input.title.trim(),
          kind: input.kind,
          time: input.time,
          date: input.date,
          repeatDaily: input.repeatDaily,
          durationMin: input.durationMin,
          enabled: true,
          completedDates: [],
          createdAt: Date.now(),
        };
        set({ alarms: [...get().alarms, alarm] });
        return id;
      },
      updateAlarm: (id, patch) => {
        set({
          alarms: get().alarms.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        });
      },
      removeAlarm: (id) => {
        const { ringing } = get();
        set({
          alarms: get().alarms.filter((a) => a.id !== id),
          ringing: ringing?.alarmId === id ? null : ringing,
        });
      },
      fireAlarm: (alarmId, key) => {
        const prev = get().lastFired[alarmId];
        if (prev === key) return;
        set({
          ringing: { alarmId, firedAt: Date.now() },
          lastFired: { ...get().lastFired, [alarmId]: key },
        });
      },
      dismissRing: () => set({ ringing: null }),
      snoozeRing: (minutes = 5) => {
        const ringing = get().ringing;
        if (!ringing) return;
        const src = get().alarms.find((a) => a.id === ringing.alarmId);
        const stamp = addMinutesToStamp(new Date(), minutes);
        get().addAlarm({
          title: src ? `${src.title} (snooze)` : "Snooze",
          kind: src?.kind ?? "training",
          time: stamp.time,
          date: stamp.date,
          repeatDaily: false,
          durationMin: src?.durationMin ?? 45,
        });
        set({ ringing: null });
      },
      startSession: (input) => {
        const existing = get().session;
        if (existing?.running) {
          const elapsed = sessionElapsed(existing, Date.now());
          set({
            session: {
              ...existing,
              accumulatedMs: elapsed,
              running: false,
              startedAt: Date.now(),
            },
          });
        }
        set({
          ringing: null,
          tab: "timer",
          session: {
            id: uid(),
            alarmId: input.alarmId,
            title: input.title,
            kind: input.kind,
            startedAt: Date.now(),
            accumulatedMs: 0,
            running: true,
            targetMs: (input.targetMin ?? 0) * 60_000,
          },
        });
      },
      pauseSession: () => {
        const s = get().session;
        if (!s?.running) return;
        set({
          session: {
            ...s,
            running: false,
            accumulatedMs: sessionElapsed(s, Date.now()),
            startedAt: Date.now(),
          },
        });
      },
      resumeSession: () => {
        const s = get().session;
        if (!s || s.running) return;
        set({
          session: { ...s, running: true, startedAt: Date.now() },
        });
      },
      completeSession: () => {
        const s = get().session;
        if (!s) return;
        const durationMs = sessionElapsed(s, Date.now());
        const item: HistoryItem = {
          id: uid(),
          title: s.title,
          kind: s.kind,
          durationMs,
          completedAt: Date.now(),
          alarmId: s.alarmId,
        };
        const today = todayISO();
        set({
          session: null,
          ringing: null,
          history: [item, ...get().history],
          alarms: s.alarmId
            ? get().alarms.map((a) =>
                a.id === s.alarmId
                  ? {
                      ...a,
                      completedDates: a.completedDates.includes(today)
                        ? a.completedDates
                        : [...a.completedDates, today],
                    }
                  : a,
              )
            : get().alarms,
        });
      },
      discardSession: () => set({ session: null }),
      completeAlarm: (alarmId, durationMs = 0) => {
        const alarm = get().alarms.find((a) => a.id === alarmId);
        if (!alarm) return;
        const today = todayISO();
        if (alarm.completedDates.includes(today)) return;
        const item: HistoryItem = {
          id: uid(),
          title: alarm.title,
          kind: alarm.kind,
          durationMs,
          completedAt: Date.now(),
          alarmId,
        };
        const session = get().session;
        set({
          alarms: get().alarms.map((a) =>
            a.id === alarmId
              ? { ...a, completedDates: [...a.completedDates, today] }
              : a,
          ),
          history: [item, ...get().history],
          ringing: get().ringing?.alarmId === alarmId ? null : get().ringing,
          session: session?.alarmId === alarmId ? null : session,
        });
      },
    }),
    {
      name: "cap-pit-clock-v2",
      skipHydration: true,
      partialize: (s) => ({
        initialized: s.initialized,
        alarms: s.alarms,
        history: s.history,
        session: s.session
          ? {
              ...s.session,
              running: false,
              accumulatedMs: sessionElapsed(s.session, Date.now()),
              startedAt: Date.now(),
            }
          : null,
        lastFired: s.lastFired,
        tab: s.tab,
      }),
    },
  ),
);

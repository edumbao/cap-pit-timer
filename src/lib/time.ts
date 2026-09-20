import { addDays, format, parse } from "date-fns";
import type { Alarm, DaySlot, SlotStatus } from "./types";

export function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

export function todayISO(now = new Date()): string {
  return format(now, "yyyy-MM-dd");
}

export function formatClock(now: Date): string {
  return format(now, "HH:mm:ss");
}

export function formatHm(now: Date): string {
  return format(now, "HH:mm");
}

export function parseStamp(date: string, time: string): Date {
  return parse(`${date} ${time}`, "yyyy-MM-dd HH:mm", new Date());
}

export function addMinutesToStamp(from: Date, minutes: number): {
  date: string;
  time: string;
} {
  const t = new Date(from.getTime() + minutes * 60_000);
  return { date: format(t, "yyyy-MM-dd"), time: format(t, "HH:mm") };
}

export function occurrenceOnDate(alarm: Alarm, date: string): Date {
  return parseStamp(date, alarm.time);
}

export function nextOccurrence(alarm: Alarm, now: Date): Date | null {
  if (alarm.repeatDaily) {
    const todayHit = occurrenceOnDate(alarm, todayISO(now));
    if (todayHit.getTime() > now.getTime()) return todayHit;
    return occurrenceOnDate(alarm, format(addDays(now, 1), "yyyy-MM-dd"));
  }
  const hit = parseStamp(alarm.date, alarm.time);
  if (hit.getTime() > now.getTime()) return hit;
  return null;
}

export function formatHud(ms: number): string {
  const sign = ms < 0 ? "-" : "";
  const abs = Math.abs(ms);
  const totalSec = Math.floor(abs / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${sign}${pad2(h)}:${pad2(m)}:${pad2(s)}`;
  return `${sign}${pad2(m)}:${pad2(s)}`;
}

export function formatLap(ms: number): string {
  const abs = Math.max(0, ms);
  const totalSec = Math.floor(abs / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const cs = Math.floor((abs % 1000) / 10);
  if (h > 0) return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
  return `${pad2(m)}:${pad2(s)}.${pad2(cs)}`;
}

export function formatShortDuration(ms: number): string {
  if (ms <= 0) return "0:00";
  const totalSec = Math.round(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${pad2(m)}m`;
  if (m > 0) return `${m}m ${pad2(s)}s`;
  return `${s}s`;
}

export function sessionElapsed(session: {
  startedAt: number;
  accumulatedMs: number;
  running: boolean;
}, nowMs: number): number {
  const live = session.running ? Math.max(0, nowMs - session.startedAt) : 0;
  return session.accumulatedMs + live;
}

export function buildDaySlots(
  alarms: Alarm[],
  now: Date,
  ringingId: string | null,
  liveAlarmId: string | null,
): DaySlot[] {
  const today = todayISO(now);
  const nowMs = now.getTime();
  const items: DaySlot[] = [];

  for (const alarm of alarms) {
    if (!alarm.enabled) continue;
    const onToday = alarm.repeatDaily || alarm.date === today;
    if (!onToday) continue;
    const at = occurrenceOnDate(alarm, today);
    const done = alarm.completedDates.includes(today);
    let status: SlotStatus;
    if (done) status = "done";
    else if (ringingId === alarm.id) status = "ringing";
    else if (liveAlarmId === alarm.id) status = "live";
    else if (at.getTime() < nowMs) status = "missed";
    else status = "upcoming";
    items.push({ alarm, status, at });
  }

  items.sort((a, b) => a.at.getTime() - b.at.getTime());

  const next = items.find((s) => s.status === "upcoming");
  if (next) next.status = "next";

  return items;
}

export function nextUpcoming(slots: DaySlot[]): DaySlot | undefined {
  return slots.find((s) => s.status === "next" || s.status === "upcoming");
}

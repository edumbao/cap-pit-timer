import { useEffect, useRef } from "react";
import { notifyAlarm, playGridStart, vibe } from "@/lib/audio";
import { useClockStore } from "@/lib/store";
import { occurrenceOnDate, todayISO } from "@/lib/time";
import { useNow } from "@/lib/use-now";

const WINDOW_MS = 60_000;

export function AlarmWatcher() {
  const now = useNow(400);
  const alarms = useClockStore((s) => s.alarms);
  const lastFired = useClockStore((s) => s.lastFired);
  const fireAlarm = useClockStore((s) => s.fireAlarm);
  const ringing = useClockStore((s) => s.ringing);
  const played = useRef<string | null>(null);

  useEffect(() => {
    const date = new Date(now);
    const today = todayISO(date);
    for (const alarm of alarms) {
      if (!alarm.enabled) continue;
      if (alarm.completedDates.includes(today)) continue;
      const onToday = alarm.repeatDaily || alarm.date === today;
      if (!onToday) continue;
      const at = occurrenceOnDate(alarm, today).getTime();
      if (now < at || now >= at + WINDOW_MS) continue;
      const key = `${today}T${alarm.time}`;
      if (lastFired[alarm.id] === key) continue;
      fireAlarm(alarm.id, key);
    }
  }, [now, alarms, lastFired, fireAlarm]);

  useEffect(() => {
    if (!ringing) {
      played.current = null;
      return;
    }
    if (played.current === ringing.alarmId) return;
    played.current = ringing.alarmId;
    const alarm = alarms.find((a) => a.id === ringing.alarmId);
    playGridStart();
    vibe();
    void notifyAlarm("CAP Pit Clock", alarm ? `${alarm.title} — lights out` : "Session start");
  }, [ringing, alarms]);

  return null;
}

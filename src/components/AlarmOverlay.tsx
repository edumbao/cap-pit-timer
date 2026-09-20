import { useEffect, useState } from "react";
import { useClockStore } from "@/lib/store";
import { Button } from "./ui/button";
import { PhilippineSun } from "./CapMark";
import { cn } from "@/lib/utils";

export function AlarmOverlay() {
  const ringing = useClockStore((s) => s.ringing);
  const alarms = useClockStore((s) => s.alarms);
  const dismissRing = useClockStore((s) => s.dismissRing);
  const snoozeRing = useClockStore((s) => s.snoozeRing);
  const startSession = useClockStore((s) => s.startSession);
  const completeAlarm = useClockStore((s) => s.completeAlarm);
  const [phase, setPhase] = useState<"lights" | "go">("lights");

  const alarm = ringing ? alarms.find((a) => a.id === ringing.alarmId) : undefined;

  useEffect(() => {
    if (!ringing) {
      setPhase("lights");
      return;
    }
    setPhase("lights");
    const id = window.setTimeout(() => setPhase("go"), 1100);
    return () => window.clearTimeout(id);
  }, [ringing]);

  if (!ringing || !alarm) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="alarm-title"
      className="fixed inset-0 z-[60] flex flex-col bg-bg px-5 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="livery-stripe h-1.5 w-full rounded-full" />
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <PhilippineSun className="mb-6 size-10 text-sun" />
        <p className="font-display text-[16px] uppercase tracking-[0.28em] text-muted">
          CAP Pit Clock
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          {Array.from({ length: 5 }, (_, i) => (
            <span
              key={i}
              className={cn(
                "size-10 rounded-full bg-accent shadow-[0_0_18px_color-mix(in_oklab,var(--color-accent)_55%,transparent)] sm:size-12",
                phase === "go" && "opacity-[0.12] shadow-none",
              )}
              style={{
                animation:
                  phase === "lights"
                    ? `lights-on 180ms ease-out ${i * 160}ms both`
                    : `lights-out 180ms ease-out both`,
              }}
            />
          ))}
        </div>

        <h2
          id="alarm-title"
          className="mt-10 font-display text-[56px] leading-none uppercase tracking-[0.08em] text-fg"
          style={{ animation: phase === "go" ? "go-in 400ms ease-out both" : undefined }}
        >
          {phase === "go" ? "Away we go" : "Lights out"}
        </h2>
        <p className="mt-3 font-display text-[32px] leading-none tracking-wide text-accent">
          {alarm.title}
        </p>
        <p className="mt-3 text-sm uppercase tracking-[0.18em] text-muted">
          {alarm.time} · {alarm.durationMin} min session
        </p>
      </div>

      <div className="mx-auto grid w-full max-w-md gap-2">
        <Button
          size="lg"
          className="w-full"
          onClick={() =>
            startSession({
              title: alarm.title,
              kind: alarm.kind,
              alarmId: alarm.id,
              targetMin: alarm.durationMin,
            })
          }
        >
          Start session
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="ghost" onClick={() => snoozeRing(5)}>
            Snooze 5
          </Button>
          <Button variant="sun" onClick={() => completeAlarm(alarm.id)}>
            Finish
          </Button>
        </div>
        <Button variant="outline" onClick={dismissRing}>
          Dismiss
        </Button>
      </div>
    </div>
  );
}

import { Pause, Play, Square, Flag } from "lucide-react";
import type { DaySlot } from "@/lib/types";
import { KIND_LABEL } from "@/lib/types";
import { useClockStore } from "@/lib/store";
import { formatHud, formatLap, sessionElapsed } from "@/lib/time";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { kindTone } from "./Hud";
import { cn } from "@/lib/utils";

export function TimerView({
  nowMs,
  slots,
}: {
  nowMs: number;
  slots: DaySlot[];
}) {
  const session = useClockStore((s) => s.session);
  const startSession = useClockStore((s) => s.startSession);
  const pauseSession = useClockStore((s) => s.pauseSession);
  const resumeSession = useClockStore((s) => s.resumeSession);
  const completeSession = useClockStore((s) => s.completeSession);
  const discardSession = useClockStore((s) => s.discardSession);

  if (!session) {
    const open = slots.filter((s) => s.status !== "done");
    return (
      <section className="mx-auto flex w-full max-w-lg flex-col gap-4">
        <header>
          <h2 className="font-display text-[32px] uppercase tracking-[0.12em] leading-none">
            Time tracker
          </h2>
          <p className="mt-1 text-sm text-muted">
            Start a lap on today's grid, or run an open session.
          </p>
        </header>
        {open.length === 0 ? (
          <p className="rounded-[18px] bg-surface px-4 py-6 text-sm text-muted shadow-[0_0_0_1px_rgba(244,246,248,0.08)]">
            No open sessions. Create an alarm from Today, then start the clock.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {open.map((slot) => (
              <li key={slot.alarm.id}>
                <button
                  type="button"
                  onClick={() =>
                    startSession({
                      title: slot.alarm.title,
                      kind: slot.alarm.kind,
                      alarmId: slot.alarm.id,
                      targetMin: slot.alarm.durationMin,
                    })
                  }
                  className="flex w-full items-center justify-between gap-3 rounded-[16px] bg-surface px-4 py-3.5 text-left shadow-[0_0_0_1px_rgba(244,246,248,0.08)]"
                >
                  <div className="min-w-0">
                    <p className="truncate font-display text-[22px] leading-none">
                      {slot.alarm.title}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">
                      {slot.alarm.time} · {slot.alarm.durationMin} min
                    </p>
                  </div>
                  <Play className="size-5 text-accent" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <Button
          variant="navy"
          className="w-full"
          onClick={() =>
            startSession({ title: "Open session", kind: "training", targetMin: 45 })
          }
        >
          Start open session
        </Button>
      </section>
    );
  }

  const elapsed = sessionElapsed(session, nowMs);
  const remaining = session.targetMs > 0 ? session.targetMs - elapsed : null;
  const over = remaining !== null && remaining < 0;
  const progress =
    session.targetMs > 0 ? Math.min(1, elapsed / session.targetMs) : 0;

  return (
    <section className="mx-auto flex w-full max-w-lg flex-col gap-5">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.22em] text-muted">Current lap</p>
          <h2 className="mt-1 truncate font-display text-[32px] uppercase tracking-[0.08em] leading-none">
            {session.title}
          </h2>
        </div>
        <Badge tone={session.running ? "live" : kindTone(session.kind)}>
          {session.running ? "Live" : "Paused"}
        </Badge>
      </header>

      <div className="relative overflow-hidden rounded-[26px] bg-surface px-4 py-6 text-center shadow-[0_0_0_1px_rgba(244,246,248,0.08)]">
        <p className="text-xs uppercase tracking-[0.22em] text-muted">Elapsed</p>
        <p
          className="hud-glow mt-2 font-hud text-[72px] leading-none text-fg tabular-nums"
          aria-live="polite"
        >
          {formatLap(elapsed)}
        </p>
        {remaining !== null ? (
          <p
            className={cn(
              "mt-3 font-hud text-[28px] tabular-nums",
              over ? "text-accent" : "text-muted",
            )}
          >
            {over ? "OVER " : "TO GO "}
            {formatHud(remaining)}
          </p>
        ) : (
          <p className="mt-3 text-sm uppercase tracking-[0.16em] text-muted">
            Open ended · {KIND_LABEL[session.kind]}
          </p>
        )}
        {session.targetMs > 0 ? (
          <div className="mx-auto mt-5 h-2 w-full max-w-sm overflow-hidden rounded-full bg-elevated">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-150 ease-out"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {session.running ? (
          <Button variant="ghost" size="lg" onClick={pauseSession}>
            <Pause className="size-4 fill-current" />
            Pause
          </Button>
        ) : (
          <Button variant="primary" size="lg" onClick={resumeSession}>
            <Play className="size-4 fill-current" />
            Resume
          </Button>
        )}
        <Button variant="sun" size="lg" onClick={completeSession}>
          <Flag className="size-4" />
          Finish
        </Button>
      </div>
      <Button variant="danger" onClick={discardSession}>
        <Square className="size-3.5 fill-current" />
        Discard lap
      </Button>
    </section>
  );
}

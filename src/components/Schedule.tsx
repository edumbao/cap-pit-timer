import { Check, Flag, Play, Trash2 } from "lucide-react";
import type { DaySlot } from "@/lib/types";
import { KIND_LABEL } from "@/lib/types";
import { useClockStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { kindTone } from "./Hud";

const STATUS_COPY: Record<DaySlot["status"], string> = {
  next: "Next",
  upcoming: "Queued",
  ringing: "Lights out",
  live: "On track",
  done: "Finished",
  missed: "Missed",
};

export function Schedule({ slots }: { slots: DaySlot[] }) {
  const completeAlarm = useClockStore((s) => s.completeAlarm);
  const startSession = useClockStore((s) => s.startSession);
  const removeAlarm = useClockStore((s) => s.removeAlarm);
  const session = useClockStore((s) => s.session);

  if (slots.length === 0) {
    return (
      <div className="rounded-[18px] bg-surface px-4 py-8 text-center shadow-[0_0_0_1px_rgba(244,246,248,0.08)]">
        <p className="font-display text-[22px] tracking-[0.12em] text-fg">No sessions today</p>
        <p className="mt-1 text-sm text-muted">Create an alarm to build today's grid.</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {slots.map((slot) => {
        const { alarm, status } = slot;
        const busy = session?.running && session.alarmId !== alarm.id;
        return (
          <li
            key={alarm.id}
            className={cn(
              "relative overflow-hidden rounded-[18px] bg-surface pl-1 shadow-[0_0_0_1px_rgba(244,246,248,0.08)]",
              status === "next" && "shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-accent)_55%,transparent)]",
              status === "done" && "opacity-70",
            )}
          >
            <div
              className={cn(
                "absolute inset-y-0 left-0 w-1",
                alarm.kind === "training" && "bg-accent",
                alarm.kind === "event" && "bg-navy-bright",
                alarm.kind === "game" && "bg-sun",
                alarm.kind === "skill" && "bg-fg/50",
                alarm.kind === "recovery" && "bg-ok",
              )}
            />
            <div className="flex gap-3 px-3 py-3">
              <div className="w-14 shrink-0 pt-0.5">
                <p className="font-hud text-[28px] leading-none text-fg tabular-nums">
                  {alarm.time}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-subtle">
                  {alarm.repeatDaily ? "Daily" : "Today"}
                </p>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate font-display text-[22px] leading-none tracking-wide">
                    {alarm.title}
                  </p>
                  <Badge
                    tone={
                      status === "live" || status === "ringing"
                        ? "live"
                        : status === "done"
                          ? "ok"
                          : status === "next"
                            ? "red"
                            : "mute"
                    }
                  >
                    {STATUS_COPY[status]}
                  </Badge>
                </div>
                <p className="mt-1.5 text-xs uppercase tracking-[0.16em] text-muted">
                  {KIND_LABEL[alarm.kind]} · {alarm.durationMin} min
                </p>
                {status !== "done" ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      disabled={busy}
                      onClick={() =>
                        startSession({
                          title: alarm.title,
                          kind: alarm.kind,
                          alarmId: alarm.id,
                          targetMin: alarm.durationMin,
                        })
                      }
                    >
                      <Play className="size-3.5 fill-current" />
                      Start
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => completeAlarm(alarm.id)}
                    >
                      <Check className="size-3.5" />
                      Finish
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="size-10"
                      aria-label={`Remove ${alarm.title}`}
                      onClick={() => removeAlarm(alarm.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ) : (
                  <p className="mt-2 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] text-ok">
                    <Flag className="size-3.5" />
                    Logged to history
                  </p>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

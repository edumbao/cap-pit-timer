import { useState, type FormEvent } from "react";
import { Drawer } from "vaul";
import { ACTIVITY_KINDS, KIND_LABEL, type ActivityKind } from "@/lib/types";
import { ACTIVITY_PRESETS, DURATION_PRESETS } from "@/lib/presets";
import { useClockStore } from "@/lib/store";
import { todayISO } from "@/lib/time";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function CreateAlarm({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-bg/70" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[92svh] w-full max-w-lg flex-col rounded-t-[26px] bg-surface shadow-[0_0_0_1px_rgba(244,246,248,0.1)]">
          <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-border" />
          <AlarmForm onDone={() => onOpenChange(false)} />
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function AlarmForm({ onDone }: { onDone: () => void }) {
  const addAlarm = useClockStore((s) => s.addAlarm);
  const [title, setTitle] = useState("Pull Session");
  const [kind, setKind] = useState<ActivityKind>("training");
  const [time, setTime] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 10);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  });
  const [durationMin, setDurationMin] = useState(45);
  const [repeatDaily, setRepeatDaily] = useState(false);
  const [error, setError] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    const name = title.trim();
    if (!name) {
      setError("Name the session.");
      return;
    }
    if (!time) {
      setError("Pick a launch time.");
      return;
    }
    addAlarm({
      title: name,
      kind,
      time,
      date: todayISO(),
      repeatDaily,
      durationMin,
    });
    onDone();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5 overflow-y-auto px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4">
      <div>
        <Drawer.Title className="font-display text-[28px] uppercase tracking-[0.14em] text-fg">
          New alarm
        </Drawer.Title>
        <Drawer.Description className="mt-1 text-sm text-muted">
          Lock a time and activity onto today's grid.
        </Drawer.Description>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Activity</span>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Session name"
          aria-label="Activity name"
        />
      </label>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {ACTIVITY_PRESETS.map((p) => (
          <button
            key={p.title}
            type="button"
            onClick={() => {
              setTitle(p.title);
              setKind(p.kind);
              setDurationMin(p.durationMin);
            }}
            className={cn(
              "h-10 shrink-0 rounded-full px-3 text-sm font-medium",
              "shadow-[inset_0_0_0_1px_var(--color-border)]",
              title === p.title ? "bg-accent text-accent-fg" : "bg-elevated text-muted",
            )}
          >
            {p.title}
          </button>
        ))}
      </div>

      <fieldset>
        <legend className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted">
          Type
        </legend>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {ACTIVITY_KINDS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={cn(
                "h-11 rounded-[10px] text-sm font-medium capitalize",
                kind === k ? "bg-navy text-fg" : "bg-elevated text-muted shadow-[inset_0_0_0_1px_var(--color-border)]",
              )}
            >
              {KIND_LABEL[k]}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Time</span>
          <Input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            aria-label="Alarm time"
            className="font-hud text-[22px]"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Duration</span>
          <Input
            type="number"
            min={5}
            max={240}
            step={5}
            value={durationMin}
            onChange={(e) => setDurationMin(Number(e.target.value) || 0)}
            aria-label="Duration in minutes"
            className="font-hud text-[22px]"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        {DURATION_PRESETS.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDurationMin(d)}
            className={cn(
              "h-9 rounded-full px-3 text-sm",
              durationMin === d ? "bg-sun text-sun-fg" : "bg-elevated text-muted",
            )}
          >
            {d}m
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setRepeatDaily((v) => !v)}
        className={cn(
          "flex h-12 items-center justify-between rounded-[12px] px-4 text-sm",
          "shadow-[inset_0_0_0_1px_var(--color-border)] bg-elevated",
        )}
        aria-pressed={repeatDaily}
      >
        <span>Repeat daily</span>
        <span
          className={cn(
            "relative h-6 w-11 rounded-full transition-[background-color] duration-150",
            repeatDaily ? "bg-ok" : "bg-border",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 size-5 rounded-full bg-fg transition-[left] duration-150",
              repeatDaily ? "left-[22px]" : "left-0.5",
            )}
          />
        </span>
      </button>

      {error ? <p className="text-sm text-accent">{error}</p> : null}

      <Button type="submit" size="lg" className="w-full">
        Lock alarm
      </Button>
    </form>
  );
}

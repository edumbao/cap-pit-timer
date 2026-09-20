import { useEffect, useState } from "react";
import { Clock, Flag, Plus, Timer } from "lucide-react";
import { Toaster } from "sonner";
import { unlockAudio, requestNotifyPermission } from "@/lib/audio";
import { useClockStore } from "@/lib/store";
import { buildDaySlots, nextUpcoming } from "@/lib/time";
import type { TabId } from "@/lib/types";
import { useNow } from "@/lib/use-now";
import { cn } from "@/lib/utils";
import { AlarmOverlay } from "./AlarmOverlay";
import { AlarmWatcher } from "./AlarmWatcher";
import { CapMark } from "./CapMark";
import { CreateAlarm } from "./CreateAlarm";
import { HistoryView } from "./HistoryView";
import { Hud } from "./Hud";
import { Schedule } from "./Schedule";
import { TimerView } from "./TimerView";
import { TrackBackdrop } from "./TrackBackdrop";
import { Button } from "./ui/button";

export function AppShell() {
  const ensureSeed = useClockStore((s) => s.ensureSeed);
  const tab = useClockStore((s) => s.tab);
  const setTab = useClockStore((s) => s.setTab);
  const alarms = useClockStore((s) => s.alarms);
  const session = useClockStore((s) => s.session);
  const ringing = useClockStore((s) => s.ringing);
  const markNotifyReady = useClockStore((s) => s.markNotifyReady);
  const [sheet, setSheet] = useState(false);
  const nowMs = useNow(250);
  const now = new Date(nowMs);

  useEffect(() => {
    const unsub = useClockStore.persist.onFinishHydration(() => {
      useClockStore.getState().ensureSeed();
    });
    try {
      useClockStore.persist.rehydrate();
    } catch {
      useClockStore.getState().ensureSeed();
    }
    return unsub;
  }, [ensureSeed]);

  useEffect(() => {
    const arm = () => {
      void unlockAudio();
      void requestNotifyPermission();
      markNotifyReady();
    };
    window.addEventListener("pointerdown", arm, { once: true });
    return () => window.removeEventListener("pointerdown", arm);
  }, [markNotifyReady]);

  const slots = buildDaySlots(alarms, now, ringing?.alarmId ?? null, session?.alarmId ?? null);
  const next = nextUpcoming(slots);

  return (
    <div className="relative mx-auto min-h-svh w-full max-w-lg md:max-w-6xl">
      <TrackBackdrop />
      <AlarmWatcher />
      <Toaster theme="dark" position="top-center" />
      <AlarmOverlay />
      <CreateAlarm open={sheet} onOpenChange={setSheet} />

      <header className="relative px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="livery-stripe h-1.5 rounded-full" />
        <div className="mt-3 flex items-center justify-between gap-3">
          <CapMark />
          <p className="hidden max-w-[16rem] text-right text-[11px] font-medium uppercase leading-snug tracking-[0.16em] text-muted sm:block">
            Calisthenics Association of the Philippines
          </p>
          <p className="max-w-[9.5rem] text-right text-[11px] font-medium uppercase leading-snug tracking-[0.16em] text-muted sm:hidden">
            Calisthenics PH
          </p>
        </div>
      </header>

      <main className="relative px-4 pb-28 pt-4">
        {tab === "today" ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-start md:gap-6">
            <div className="flex flex-col gap-4 md:sticky md:top-4">
            <Hud now={now} next={next} />
            {session?.running ? (
              <button
                type="button"
                onClick={() => setTab("timer")}
                className="flex items-center justify-between rounded-[16px] bg-accent px-4 py-3 text-left text-accent-fg"
              >
                <span>
                  <span className="block text-[11px] uppercase tracking-[0.2em] opacity-80">
                    Live lap
                  </span>
                  <span className="font-display text-[22px] leading-none">{session.title}</span>
                </span>
                <Timer className="size-5" />
              </button>
            ) : null}
            </div>
            <div className="flex flex-col gap-4">
            <div className="flex items-end justify-between">
              <h2 className="font-display text-[28px] uppercase tracking-[0.12em] leading-none">
                Today's grid
              </h2>
              <span className="text-xs uppercase tracking-[0.16em] text-muted">
                {slots.length} slots
              </span>
            </div>
            <Schedule slots={slots} />
            </div>
          </div>
        ) : tab === "timer" ? (
          <TimerView nowMs={nowMs} slots={slots} />
        ) : (
          <HistoryView />
        )}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/95 px-3 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto grid max-w-lg grid-cols-4 gap-1">
          <NavBtn id="today" tab={tab} onClick={setTab} icon={Flag} label="Today" />
          <NavBtn id="timer" tab={tab} onClick={setTab} icon={Timer} label="Timer" live={!!session?.running} />
          <NavBtn id="log" tab={tab} onClick={setTab} icon={Clock} label="Log" />
          <Button
            variant="primary"
            size="sm"
            className="h-12"
            onClick={() => setSheet(true)}
            aria-label="Create alarm"
          >
            <Plus className="size-4" />
            New
          </Button>
        </div>
      </nav>
    </div>
  );
}

function NavBtn({
  id,
  tab,
  onClick,
  icon: Icon,
  label,
  live,
}: {
  id: TabId;
  tab: TabId;
  onClick: (id: TabId) => void;
  icon: typeof Flag;
  label: string;
  live?: boolean;
}) {
  const active = tab === id;
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className={cn(
        "relative flex h-12 flex-col items-center justify-center rounded-[10px] text-[11px] font-medium uppercase tracking-[0.14em]",
        active ? "bg-elevated text-fg" : "text-muted",
      )}
    >
      <Icon className="mb-0.5 size-4" />
      {label}
      {live ? (
        <span className="absolute right-2 top-1.5 size-1.5 rounded-full bg-accent" />
      ) : null}
    </button>
  );
}

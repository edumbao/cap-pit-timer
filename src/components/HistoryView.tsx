import { format } from "date-fns";
import type { HistoryItem } from "@/lib/types";
import { KIND_LABEL } from "@/lib/types";
import { useClockStore } from "@/lib/store";
import { formatShortDuration, todayISO } from "@/lib/time";
import { Badge } from "./ui/badge";
import { kindTone } from "./Hud";

export function HistoryView() {
  const history = useClockStore((s) => s.history);
  const today = todayISO();
  const todayMs = history
    .filter((h) => format(h.completedAt, "yyyy-MM-dd") === today)
    .reduce((sum, h) => sum + h.durationMs, 0);

  const groups = groupByDate(history);

  return (
    <section className="mx-auto flex w-full max-w-lg flex-col gap-4">
      <header>
        <h2 className="font-display text-[32px] uppercase tracking-[0.12em] leading-none">
          Activity log
        </h2>
        <p className="mt-1 text-sm text-muted">Finished sessions stay on the board.</p>
      </header>

      <div className="grid grid-cols-2 gap-2">
        <Stat label="Today" value={formatShortDuration(todayMs)} />
        <Stat label="Laps" value={String(history.length)} />
      </div>

      {history.length === 0 ? (
        <div className="rounded-[18px] bg-surface px-4 py-8 text-center shadow-[0_0_0_1px_rgba(244,246,248,0.08)]">
          <p className="font-display text-[22px] tracking-[0.12em]">No laps logged yet</p>
          <p className="mt-1 text-sm text-muted">Finish a session to write it here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map(([date, items]) => (
            <div key={date}>
              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted">
                {labelDate(date, today)}
              </p>
              <ul className="flex flex-col gap-2">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 overflow-hidden rounded-[16px] bg-surface px-4 py-3 shadow-[0_0_0_1px_rgba(244,246,248,0.08)]"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-display text-[22px] leading-none">
                        {item.title}
                      </p>
                      <p className="mt-1.5 text-xs uppercase tracking-[0.16em] text-muted">
                        {format(item.completedAt, "HH:mm")} · {KIND_LABEL[item.kind]}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <p className="font-hud text-[22px] leading-none tabular-nums">
                        {formatShortDuration(item.durationMs)}
                      </p>
                      <Badge tone={kindTone(item.kind)}>P1</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] bg-surface px-4 py-3 shadow-[0_0_0_1px_rgba(244,246,248,0.08)]">
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted">{label}</p>
      <p className="mt-1 font-hud text-[32px] leading-none tabular-nums">{value}</p>
    </div>
  );
}

function groupByDate(history: HistoryItem[]): [string, HistoryItem[]][] {
  const map = new Map<string, typeof history>();
  for (const item of history) {
    const key = format(item.completedAt, "yyyy-MM-dd");
    const list = map.get(key);
    if (list) list.push(item);
    else map.set(key, [item]);
  }
  return Array.from(map.entries());
}

function labelDate(date: string, today: string) {
  if (date === today) return "Today";
  return format(new Date(`${date}T12:00:00`), "EEE d MMM");
}

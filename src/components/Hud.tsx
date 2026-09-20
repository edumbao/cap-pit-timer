import { KIND_LABEL, type DaySlot } from "@/lib/types";
import { formatClock, formatHud } from "@/lib/time";
import { Badge } from "./ui/badge";

function Tach({ progress }: { progress: number }) {
  const p = Math.max(0, Math.min(1, progress));
  const start = (-210 * Math.PI) / 180;
  const sweep = (240 * Math.PI) / 180;
  const r = 86;
  const cx = 100;
  const cy = 108;
  const arc = (t: number) => {
    const a = start + sweep * t;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };
  const s = arc(0);
  const e = arc(p);
  const large = p > 0.5 ? 1 : 0;
  const ticks = Array.from({ length: 13 }, (_, i) => {
    const t = i / 12;
    const a = start + sweep * t;
    const inner = i % 3 === 0 ? 70 : 76;
    return {
      x1: cx + inner * Math.cos(a),
      y1: cy + inner * Math.sin(a),
      x2: cx + 90 * Math.cos(a),
      y2: cy + 90 * Math.sin(a),
      major: i % 3 === 0,
    };
  });

  return (
    <svg viewBox="0 0 200 150" className="h-[148px] w-full" aria-hidden="true">
      <path
        d={`M ${arc(0).x} ${arc(0).y} A ${r} ${r} 0 1 1 ${arc(1).x} ${arc(1).y}`}
        fill="none"
        stroke="rgba(244,246,248,0.08)"
        strokeWidth="10"
        strokeLinecap="round"
      />
      {p > 0.002 ? (
        <path
          d={`M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="10"
          strokeLinecap="round"
        />
      ) : null}
      {ticks.map((t, i) => (
        <line
          key={i}
          x1={t.x1}
          y1={t.y1}
          x2={t.x2}
          y2={t.y2}
          stroke={t.major ? "rgba(244,246,248,0.45)" : "rgba(244,246,248,0.16)"}
          strokeWidth={t.major ? 2 : 1}
        />
      ))}
    </svg>
  );
}

export function Hud({
  now,
  next,
}: {
  now: Date;
  next: DaySlot | undefined;
}) {
  const remaining = next ? next.at.getTime() - now.getTime() : 0;
  const windowMs = 2 * 60 * 60 * 1000;
  const progress = next ? 1 - Math.max(0, Math.min(1, remaining / windowMs)) : 0;

  return (
    <section className="relative overflow-hidden rounded-[26px] bg-surface px-4 pb-4 pt-3 shadow-[0_0_0_1px_rgba(244,246,248,0.08)]">
      <div className="flex items-center justify-between">
        <p className="font-display text-[15px] uppercase tracking-[0.22em] text-muted">
          Next launch
        </p>
        <p className="font-hud text-[22px] leading-none text-muted tabular-nums">
          {formatClock(now)}
        </p>
      </div>

      <div className="relative -mt-1">
        <Tach progress={next ? progress : 0} />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end pb-1">
          <p
            className="hud-glow font-hud text-[56px] leading-none text-fg tabular-nums"
            aria-live="polite"
          >
            {next ? formatHud(remaining) : "--:--"}
          </p>
        </div>
      </div>

      {next ? (
        <div className="mt-1 flex items-center justify-between gap-3 rounded-[12px] bg-elevated px-3 py-2.5">
          <div className="min-w-0">
            <p className="truncate font-display text-[22px] leading-none tracking-wide text-fg">
              {next.alarm.title}
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">
              {next.alarm.time} · {next.alarm.durationMin} min
            </p>
          </div>
          <Badge tone={kindTone(next.alarm.kind)}>{KIND_LABEL[next.alarm.kind]}</Badge>
        </div>
      ) : (
        <p className="mt-1 rounded-[12px] bg-elevated px-3 py-3 text-sm text-muted">
          Grid is clear. Set an alarm to lock the next launch.
        </p>
      )}
    </section>
  );
}

export function kindTone(kind: DaySlot["alarm"]["kind"]) {
  switch (kind) {
    case "training":
      return "red" as const;
    case "event":
      return "navy" as const;
    case "game":
      return "sun" as const;
    case "skill":
      return "mute" as const;
    case "recovery":
      return "ok" as const;
  }
}

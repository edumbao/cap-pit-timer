export function PhilippineSun({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="10" fill="currentColor" />
      {Array.from({ length: 8 }, (_, i) => (
        <polygon
          key={i}
          fill="currentColor"
          transform={`rotate(${i * 45} 32 32)`}
          points="32,4 35.2,18 32,16.2 28.8,18"
        />
      ))}
    </svg>
  );
}

export function CapMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <span className="relative grid size-10 place-items-center rounded-[10px] bg-navy text-sun shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-sun)_35%,transparent)]">
        <PhilippineSun className="size-7" />
      </span>
      <div className="min-w-0 leading-none">
        <p className="font-display text-[22px] tracking-[0.18em] text-fg">CAP</p>
        {!compact ? (
          <p className="mt-0.5 truncate text-[11px] font-medium uppercase tracking-[0.22em] text-muted">
            Pit Clock
          </p>
        ) : null}
      </div>
    </div>
  );
}

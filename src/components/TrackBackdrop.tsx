export function TrackBackdrop() {
  return (
    <svg
      className="pointer-events-none absolute inset-x-0 top-0 h-[340px] w-full opacity-50"
      viewBox="0 0 390 340"
      preserveAspectRatio="xMidYMin slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0038a8" stopOpacity="0.35" />
          <stop offset="55%" stopColor="#07080c" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#07080c" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="390" height="340" fill="url(#fade)" />
      {Array.from({ length: 10 }, (_, i) => {
        const y = 48 + i * i * 2.4;
        const spread = 18 + i * 18;
        return (
          <line
            key={`h-${i}`}
            x1={195 - spread}
            y1={y}
            x2={195 + spread}
            y2={y}
            stroke="rgba(244,246,248,0.08)"
            strokeWidth="1"
          />
        );
      })}
      <polygon
        points="195,44 8,340 42,340 195,70"
        fill="none"
        stroke="rgba(206,17,38,0.45)"
        strokeWidth="3"
      />
      <polygon
        points="195,44 382,340 348,340 195,70"
        fill="none"
        stroke="rgba(244,246,248,0.55)"
        strokeWidth="3"
      />
      <polygon
        points="195,52 195,340"
        fill="none"
        stroke="rgba(252,209,22,0.28)"
        strokeWidth="1.5"
        strokeDasharray="6 10"
      />
    </svg>
  );
}

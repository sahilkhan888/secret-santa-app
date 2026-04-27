// Decorative falling snow — fixed-position, pointer-events disabled, sits behind content.
// Counts and timings tuned to feel atmospheric, not noisy.

const FLAKES = Array.from({ length: 22 }, (_, i) => {
  // deterministic pseudo-random distribution so server/client SSR match
  const seed = (i * 97 + 31) % 100;
  const left = (i * 7 + 3) % 100;
  const size = 5 + ((seed * 13) % 9);                 // 5–13 px
  const fallDuration = 14 + ((seed * 7) % 14);        // 14–28 s
  const swayDuration = 4 + ((seed * 3) % 5);          // 4–9 s
  const fallDelay = (i * 1.3) % 16;                   // staggered start
  const opacity = 0.25 + ((seed * 5) % 50) / 100;     // 0.25–0.75 of base color
  return { i, left, size, fallDuration, swayDuration, fallDelay, opacity };
});

export function Snowfall() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {FLAKES.map((f) => (
        <span
          key={f.i}
          className="snowflake"
          style={{
            left: `${f.left}%`,
            opacity: f.opacity,
            animationDuration: `${f.fallDuration}s, ${f.swayDuration}s`,
            animationDelay: `-${f.fallDelay}s, -${f.fallDelay / 2}s`,
          }}
        >
          <Flake size={f.size} />
        </span>
      ))}
    </div>
  );
}

function Flake({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* 6-point star skeleton */}
      <line x1="8" y1="1" x2="8" y2="15" />
      <line x1="1.93" y1="4.5" x2="14.07" y2="11.5" />
      <line x1="1.93" y1="11.5" x2="14.07" y2="4.5" />
      {/* small crossbars on each arm — keeps it readable at tiny sizes */}
      <line x1="6" y1="3" x2="10" y2="3" />
      <line x1="6" y1="13" x2="10" y2="13" />
      <line x1="3" y1="5" x2="4" y2="6.5" />
      <line x1="13" y1="11" x2="12" y2="9.5" />
      <line x1="3" y1="11" x2="4" y2="9.5" />
      <line x1="13" y1="5" x2="12" y2="6.5" />
    </svg>
  );
}

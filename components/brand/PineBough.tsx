import { cn } from '@/lib/utils';

type Corner = 'tl' | 'tr' | 'bl' | 'br';

interface PineBoughProps {
  corner: Corner;
  className?: string;
}

// A small horizontal pine spray with two gold berries — designed to sit in
// a card corner like a Christmas-card flourish. Rotated per corner so the
// branch always grows inward.
export function PineBough({ corner, className }: PineBoughProps) {
  const rotation =
    corner === 'tl'
      ? ''
      : corner === 'tr'
        ? '-scale-x-100'
        : corner === 'br'
          ? 'rotate-180'
          : '-scale-y-100';

  return (
    <svg
      viewBox="0 0 96 40"
      width="80"
      height="34"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn('text-forest/35', rotation, className)}
    >
      {/* main curving stem */}
      <path d="M 4 30 Q 24 22 48 18 T 92 12" />

      {/* pine-needle clusters along the stem */}
      <g>
        <path d="M 14 26 L 9 19" />
        <path d="M 14 26 L 14 18" />
        <path d="M 14 26 L 19 19" />
      </g>
      <g>
        <path d="M 26 22 L 21 14" />
        <path d="M 26 22 L 26 12" />
        <path d="M 26 22 L 31 14" />
      </g>
      <g>
        <path d="M 42 18 L 37 9" />
        <path d="M 42 18 L 42 7" />
        <path d="M 42 18 L 47 9" />
      </g>
      <g>
        <path d="M 60 15 L 55 7" />
        <path d="M 60 15 L 60 5" />
        <path d="M 60 15 L 65 7" />
      </g>
      <g>
        <path d="M 76 13 L 71 6" />
        <path d="M 76 13 L 76 4" />
        <path d="M 76 13 L 81 6" />
      </g>

      {/* gold berries — twinkling */}
      <circle cx="22" cy="27" r="1.7" fill="#D4A574" stroke="none" className="twinkle" />
      <circle cx="50" cy="22" r="1.7" fill="#D4A574" stroke="none" className="twinkle twinkle-delay-2" />
    </svg>
  );
}

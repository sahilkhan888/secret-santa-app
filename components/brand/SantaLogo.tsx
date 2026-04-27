import { cn } from '@/lib/utils';

interface SantaLogoProps {
  className?: string;
}

export function SantaLogo({ className }: SantaLogoProps) {
  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <Sprig />
      <span className="font-display text-[22px] tracking-tight text-forest">Santa</span>
    </div>
  );
}

function Sprig() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="text-forest/80"
    >
      {/* central stem */}
      <path d="M11 3.5 V 18.5" />
      {/* needle pairs */}
      <path d="M11 7.5 L 6 5.5" />
      <path d="M11 7.5 L 16 5.5" />
      <path d="M11 11 L 5.5 9.5" />
      <path d="M11 11 L 16.5 9.5" />
      <path d="M11 14.5 L 6.5 13.5" />
      <path d="M11 14.5 L 15.5 13.5" />
      {/* tiny gold berry — twinkles */}
      <circle cx="11" cy="18.5" r="1" fill="#D4A574" stroke="none" className="twinkle" />
    </svg>
  );
}

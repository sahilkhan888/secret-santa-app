import Link from 'next/link';
import { SantaLogo } from '@/components/brand/SantaLogo';
import { isDemoMode } from '@/lib/env';

export default function Home() {
  return (
    <main className="relative mx-auto flex min-h-[100dvh] w-full max-w-[520px] flex-col items-center justify-between px-6 pt-10 pb-12">
      <header className="w-full">
        <SantaLogo />
      </header>

      <section className="stagger-in flex w-full flex-col items-center text-center">
        <p className="kicker">Est. 2026 — Entri Holiday</p>

        <h1 className="mt-6 font-display text-[44px] leading-[1.05] tracking-tight text-forest sm:text-[52px]">
          A quiet
          <br />
          <span className="italic text-forest/90">Secret Santa</span>
          <br />
          for the team.
        </h1>

        <Flourish className="mt-7" />

        <p className="mt-7 max-w-[34ch] text-[15px] leading-relaxed text-forest/70">
          Join with a link from your organiser. Share a budget, a few hints, and we&rsquo;ll
          quietly take care of the rest.
        </p>

        {isDemoMode && (
          <Link
            href="/join/holiday-2026"
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-forest px-7 py-3.5 text-sm font-medium tracking-tight text-cream shadow-[0_1px_0_rgba(212,165,116,0.55)_inset,0_10px_28px_-14px_rgba(15,61,46,0.7)] transition-all duration-200 hover:bg-forest/95 active:scale-[0.985]"
          >
            Try the demo event
            <span aria-hidden className="translate-y-[-1px] text-gold">→</span>
          </Link>
        )}
      </section>

      <footer className="kicker pt-6 text-forest/40">
        {isDemoMode ? 'In-memory demo · no Supabase required' : 'Reveal · Dec'}
      </footer>
    </main>
  );
}

function Flourish({ className }: { className?: string }) {
  // Festive separator: garland · twinkling star trio · garland.
  return (
    <div className={`flex w-full max-w-[240px] items-center gap-3 ${className ?? ''}`}>
      <span className="garland flex-1" />
      <div className="flex items-center gap-2 text-gold">
        <Star size={8} className="twinkle twinkle-delay-1 opacity-70" />
        <Star size={14} className="twinkle" />
        <Star size={8} className="twinkle twinkle-delay-2 opacity-70" />
      </div>
      <span className="garland flex-1" />
    </div>
  );
}

function Star({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" aria-hidden className={className}>
      <path
        d="M7 1 L 8.2 5.4 L 13 5.8 L 9.3 8.6 L 10.6 13 L 7 10.5 L 3.4 13 L 4.7 8.6 L 1 5.8 L 5.8 5.4 Z"
        fill="currentColor"
      />
    </svg>
  );
}

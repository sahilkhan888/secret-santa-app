import Link from 'next/link';
import { SantaLogo } from '@/components/brand/SantaLogo';
import { isDemoMode } from '@/lib/env';

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col items-center justify-center px-6 py-16 text-center">
      <SantaLogo />
      <h1 className="mt-10 font-display text-4xl leading-tight text-forest">
        A quiet Secret Santa for the team.
      </h1>
      <p className="mt-4 text-sm text-forest/70">
        Join an event with a link from your organiser.
      </p>

      {isDemoMode && (
        <Link
          href="/join/holiday-2026"
          className="mt-10 inline-flex items-center gap-2 rounded-full bg-forest px-5 py-3 text-sm font-medium text-cream transition hover:bg-forest/90"
        >
          Try the demo event
          <span aria-hidden>→</span>
        </Link>
      )}

      {isDemoMode && (
        <p className="mt-3 text-xs text-forest/50">
          Demo mode — in-memory store, no real Supabase required.
        </p>
      )}
    </main>
  );
}

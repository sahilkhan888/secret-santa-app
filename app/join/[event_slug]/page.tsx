import { format } from 'date-fns';
import { notFound } from 'next/navigation';
import { SantaLogo } from '@/components/brand/SantaLogo';
import { getDemoEventBySlug } from '@/lib/demo/store';
import { isDemoMode } from '@/lib/env';
import { createAdminClient } from '@/lib/supabase/admin';
import type { EventRow } from '@/lib/types';
import { JoinForm } from './JoinForm';

interface PageProps {
  params: { event_slug: string };
  searchParams: { signin?: string };
}

export default async function JoinPage({ params, searchParams }: PageProps) {
  const event = await loadEvent(params.event_slug);
  if (!event) notFound();

  const now = new Date();
  const opens = new Date(event.registration_opens_at);
  const closes = new Date(event.registration_closes_at);
  const isOpen = event.status === 'open' && now >= opens && now <= closes;
  const signinPrompt = searchParams.signin === '1';

  return (
    <main className="mx-auto w-full max-w-[520px] px-6 pt-10 pb-16">
      <header>
        <SantaLogo />
      </header>

      <section className="mt-12">
        <p className="kicker">
          {event.status === 'open' ? 'Registration · Open' : 'Registration · Closed'}
        </p>
        <h1 className="mt-3 font-display text-[40px] leading-[1.05] tracking-tight text-forest">
          {event.name}
        </h1>
        <p className="mt-3 text-sm text-forest/70">
          Reveal opens on{' '}
          <span className="font-medium text-forest">
            {format(new Date(event.reveal_at), "EEEE, d LLLL")}
          </span>
          .
        </p>
        <div className="mt-7 garland" />
      </section>

      {signinPrompt && (
        <div className="mt-7 rounded-2xl border border-gold/40 bg-white/70 px-5 py-4 text-sm text-forest/80 shadow-[0_1px_0_rgba(255,255,255,0.6)_inset]">
          To view your dashboard, re-enter your email below and we&rsquo;ll send a fresh sign-in
          link.
        </div>
      )}

      {isDemoMode && (
        <div className="mt-7 rounded-2xl border border-forest/10 bg-white/50 px-5 py-4 text-xs leading-relaxed text-forest/65">
          <span className="kicker mb-1.5 block text-forest/55">Demo mode</span>
          No real email is sent. After you submit, the welcome email (with a sign-in link) is
          printed to the dev-server console and saved to <code className="rounded bg-forest/[0.05] px-1 py-0.5 font-mono text-[11px]">tmp/last-email.html</code>.
        </div>
      )}

      <section className="mt-9">
        {isOpen ? (
          <JoinForm eventSlug={event.slug} eventName={event.name} />
        ) : (
          <ClosedState closesAt={event.registration_closes_at} status={event.status} />
        )}
      </section>
    </main>
  );
}

async function loadEvent(slug: string): Promise<EventRow | null> {
  if (isDemoMode) return getDemoEventBySlug(slug);

  const supabase = createAdminClient();
  const { data } = await supabase
    .from('events')
    .select('id, name, slug, status, reveal_at, registration_opens_at, registration_closes_at, gifting_day, created_by, created_at')
    .eq('slug', slug)
    .maybeSingle();
  return (data as EventRow | null) ?? null;
}

function ClosedState({ closesAt, status }: { closesAt: string; status: string }) {
  const message =
    status === 'draft'
      ? 'Registration hasn’t opened yet.'
      : `Registration closed on ${format(new Date(closesAt), "EEEE, d LLLL")}.`;
  return (
    <div className="rounded-2xl border border-forest/10 bg-white/70 p-8 text-center text-sm text-forest/70">
      <p>{message}</p>
    </div>
  );
}

import { format, formatDistanceToNowStrict } from 'date-fns';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { DEMO_COOKIE } from '@/app/auth/demo-login/route';
import { SantaLogo } from '@/components/brand/SantaLogo';
import { getDemoEventBySlug, getDemoParticipant } from '@/lib/demo/store';
import { isDemoMode } from '@/lib/env';
import { createClient } from '@/lib/supabase/server';
import type { EventRow, ParticipantRow } from '@/lib/types';

interface PageProps {
  params: { event_slug: string };
}

export default async function DashboardPage({ params }: PageProps) {
  const email = await resolveEmail();
  if (!email) redirect(`/join/${params.event_slug}?signin=1`);

  const event = await loadEvent(params.event_slug);
  if (!event) {
    return (
      <EmptyFrame>
        <p>We can&rsquo;t find that event.</p>
      </EmptyFrame>
    );
  }

  const participant = await loadParticipant(event.id, email);
  if (!participant) {
    return (
      <EmptyFrame>
        <p>We couldn&rsquo;t find your registration for {event.name}.</p>
        <Link
          href={`/join/${event.slug}`}
          className="mt-4 inline-block text-sm font-medium text-forest underline underline-offset-4"
        >
          Join the event
        </Link>
      </EmptyFrame>
    );
  }

  const revealAt = new Date(event.reveal_at);
  const untilReveal = formatDistanceToNowStrict(revealAt);

  return (
    <main className="mx-auto w-full max-w-[480px] px-6 py-12">
      <SantaLogo />
      <h1 className="mt-10 font-display text-3xl leading-tight text-forest">
        Hi, {participant.name.split(' ')[0]}.
      </h1>

      <section className="mt-8 rounded-2xl border border-gold/50 bg-white/80 p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-forest/60">{event.name}</p>
        <p className="mt-3 font-display text-xl text-forest">
          Reveal opens on {format(revealAt, "EEEE, d LLLL")}.
        </p>
        <p className="mt-1 text-sm text-forest/70">In {untilReveal}.</p>
        <p className="mt-4 text-sm text-forest/70">
          You&rsquo;ll find out who you&rsquo;re gifting then. Until then, sit tight.
        </p>
      </section>

      <section className="mt-5 rounded-2xl border border-forest/10 bg-white/60 p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-forest/60">Your profile</p>
        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
          <dt className="text-forest/60">Team</dt>
          <dd className="text-forest">{participant.team}</dd>
          <dt className="text-forest/60">Budget</dt>
          <dd className="text-forest">₹{participant.budget_amount.toLocaleString('en-IN')}</dd>
          <dt className="text-forest/60">Shirt size</dt>
          <dd className="text-forest">{formatShirtSize(participant.shirt_size)}</dd>
        </dl>
        {(participant.wishlist_likes || participant.wishlist_dislikes) && (
          <div className="mt-4 space-y-3 border-t border-forest/10 pt-4 text-sm">
            {participant.wishlist_likes && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-forest/60">Likes</p>
                <p className="mt-1 text-forest/80">{participant.wishlist_likes}</p>
              </div>
            )}
            {participant.wishlist_dislikes && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-forest/60">
                  Would rather not
                </p>
                <p className="mt-1 text-forest/80">{participant.wishlist_dislikes}</p>
              </div>
            )}
          </div>
        )}
      </section>

      <footer className="mt-8 flex items-center justify-between text-xs text-forest/50">
        <span>{participant.email}</span>
        <form action="/auth/signout" method="post">
          <button type="submit" className="underline underline-offset-4">
            Not you? Sign out
          </button>
        </form>
      </footer>
    </main>
  );
}

async function resolveEmail(): Promise<string | null> {
  if (isDemoMode) {
    return cookies().get(DEMO_COOKIE)?.value ?? null;
  }
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.email ?? null;
}

async function loadEvent(slug: string): Promise<EventRow | null> {
  if (isDemoMode) return getDemoEventBySlug(slug);
  const supabase = createClient();
  const { data } = await supabase
    .from('events')
    .select('id, name, slug, status, reveal_at, registration_opens_at, registration_closes_at, gifting_day, created_by, created_at')
    .eq('slug', slug)
    .maybeSingle();
  return (data as EventRow | null) ?? null;
}

async function loadParticipant(
  eventId: string,
  email: string,
): Promise<ParticipantRow | null> {
  if (isDemoMode) return getDemoParticipant(eventId, email);
  const supabase = createClient();
  const { data } = await supabase
    .from('participants')
    .select(
      'id, event_id, name, team, email, budget_amount, hot_drink, shirt_size, wishlist_likes, wishlist_dislikes, joined_at, is_active',
    )
    .eq('event_id', eventId)
    .eq('email', email)
    .maybeSingle();
  return (data as ParticipantRow | null) ?? null;
}

function formatShirtSize(size: ParticipantRow['shirt_size']): string {
  if (size === 'none') return 'Prefer not to say';
  return size.toUpperCase();
}

function EmptyFrame({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-[480px] px-6 py-16 text-center">
      <SantaLogo />
      <div className="mt-10 text-sm text-forest/70">{children}</div>
    </main>
  );
}

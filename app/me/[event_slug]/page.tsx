import { format, formatDistanceToNowStrict } from 'date-fns';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { DEMO_COOKIE } from '@/app/auth/demo-login/route';
import { PineBough } from '@/components/brand/PineBough';
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
          className="mt-4 inline-block text-sm font-medium text-forest underline decoration-gold underline-offset-4"
        >
          Join the event
        </Link>
      </EmptyFrame>
    );
  }

  const revealAt = new Date(event.reveal_at);
  const untilReveal = formatDistanceToNowStrict(revealAt);
  const firstName = participant.name.split(' ')[0];

  return (
    <main className="mx-auto w-full max-w-[520px] px-6 pt-10 pb-12">
      <header>
        <SantaLogo />
      </header>

      <section className="stagger-in mt-12">
        <p className="kicker">Your dashboard</p>
        <h1 className="mt-3 font-display text-[40px] leading-[1.05] tracking-tight text-forest">
          Hi, <span className="italic">{firstName}</span>.
        </h1>

        <article className="relative overflow-hidden rounded-2xl border border-gold/40 bg-white/80 p-7 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_20px_40px_-28px_rgba(15,61,46,0.2)]">
          <PineBough corner="tl" className="absolute -top-1 -left-1" />
          <PineBough corner="br" className="absolute -bottom-1 -right-1" />
          <div className="relative">
            <p className="kicker text-forest/55">{event.name}</p>
            <p className="mt-4 font-display text-[22px] leading-[1.15] text-forest">
              Reveal opens on
            </p>
            <p className="mt-1 font-display text-[28px] leading-[1.05] tracking-tight text-forest">
              <span className="italic">{format(revealAt, 'EEEE')}</span>
              {format(revealAt, ', d LLLL')}.
            </p>
            <div className="my-5 garland" />
            <p className="text-sm leading-relaxed text-forest/70">
              <span className="font-medium text-forest">In {untilReveal}</span> — you&rsquo;ll find
              out who you&rsquo;re gifting then. Until then, sit tight.
            </p>
          </div>
        </article>

        <article className="mt-5 rounded-2xl border border-forest/10 bg-white/65 p-7">
          <p className="kicker text-forest/55">Your profile</p>
          <dl className="mt-5 space-y-3 text-sm">
            <ProfileRow label="Team" value={participant.team} />
            <ProfileRow
              label="Budget"
              value={`₹${participant.budget_amount.toLocaleString('en-IN')}`}
            />
            <ProfileRow label="Shirt size" value={formatShirtSize(participant.shirt_size)} />
          </dl>
          {(participant.wishlist_likes || participant.wishlist_dislikes) && (
            <div className="mt-6 space-y-4 border-t border-forest/[0.07] pt-5">
              {participant.wishlist_likes && (
                <div>
                  <p className="kicker text-forest/55">Likes</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-forest/85">
                    {participant.wishlist_likes}
                  </p>
                </div>
              )}
              {participant.wishlist_dislikes && (
                <div>
                  <p className="kicker text-forest/55">Would rather not</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-forest/85">
                    {participant.wishlist_dislikes}
                  </p>
                </div>
              )}
            </div>
          )}
        </article>
      </section>

      <footer className="mt-10 flex items-center justify-between text-xs text-forest/45">
        <span>{participant.email}</span>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="underline decoration-gold/60 underline-offset-4 transition hover:text-forest"
          >
            Not you? Sign out
          </button>
        </form>
      </footer>
    </main>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-forest/55">{label}</dt>
      <dd className="text-right text-forest">{value}</dd>
    </div>
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
    <main className="mx-auto w-full max-w-[520px] px-6 pt-16 text-center">
      <SantaLogo className="mx-auto" />
      <div className="mt-12 text-sm text-forest/70">{children}</div>
    </main>
  );
}

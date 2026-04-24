'use server';

import { format } from 'date-fns';
import { z } from 'zod';
import {
  getDemoEventBySlug,
  upsertDemoParticipant,
} from '@/lib/demo/store';
import { env, isDemoMode } from '@/lib/env';
import { sendJoinConfirmation } from '@/lib/resend';
import { createAdminClient } from '@/lib/supabase/admin';

const JoinSchema = z.object({
  name: z.string().trim().min(1, 'Required').max(120),
  team: z.string().trim().min(1, 'Required').max(80),
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  budget_amount: z.coerce
    .number({ invalid_type_error: 'Enter a number' })
    .int('Whole rupees only')
    .min(500, '₹500 minimum'),
  wishlist_likes: z.string().trim().max(2000).default(''),
  wishlist_dislikes: z.string().trim().max(2000).default(''),
  shirt_size: z.enum(['xs', 's', 'm', 'l', 'xl', 'xxl', 'none']).optional().default('none'),
  hot_drink: z.enum(['coffee', 'tea', 'neither']).optional().default('neither'),
});

export type JoinFieldErrors = Partial<Record<keyof z.infer<typeof JoinSchema>, string>>;

export type JoinState =
  | { status: 'idle' }
  | { status: 'error'; message?: string; fieldErrors?: JoinFieldErrors }
  | { status: 'success'; email: string };

export async function joinEventAction(
  eventSlug: string,
  _prevState: JoinState,
  formData: FormData,
): Promise<JoinState> {
  const parsed = JoinSchema.safeParse({
    name: formData.get('name'),
    team: formData.get('team'),
    email: formData.get('email'),
    budget_amount: formData.get('budget_amount'),
    wishlist_likes: formData.get('wishlist_likes') ?? '',
    wishlist_dislikes: formData.get('wishlist_dislikes') ?? '',
    shirt_size: formData.get('shirt_size') || undefined,
    hot_drink: formData.get('hot_drink') ?? 'neither',
  });

  if (!parsed.success) {
    const fieldErrors: JoinFieldErrors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof JoinFieldErrors;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: 'error', fieldErrors };
  }

  const data = parsed.data;

  if (isDemoMode) {
    return handleDemo(eventSlug, data);
  }
  return handleSupabase(eventSlug, data);
}

type JoinData = z.infer<typeof JoinSchema>;

async function handleDemo(eventSlug: string, data: JoinData): Promise<JoinState> {
  const event = getDemoEventBySlug(eventSlug);
  if (!event) return { status: 'error', message: 'Event not found.' };

  const now = new Date();
  if (
    event.status !== 'open' ||
    now < new Date(event.registration_opens_at) ||
    now > new Date(event.registration_closes_at)
  ) {
    return { status: 'error', message: 'Registration for this event is closed.' };
  }

  upsertDemoParticipant({
    event_id: event.id,
    name: data.name,
    team: data.team,
    email: data.email,
    budget_amount: data.budget_amount,
    wishlist_likes: data.wishlist_likes,
    wishlist_dislikes: data.wishlist_dislikes,
    hot_drink: data.hot_drink,
    shirt_size: data.shirt_size,
  });

  const magicLinkUrl = `${env.NEXT_PUBLIC_SITE_URL}/auth/demo-login?email=${encodeURIComponent(
    data.email,
  )}&next=${encodeURIComponent(`/me/${event.slug}`)}`;

  await sendJoinConfirmation({
    to: data.email,
    name: data.name,
    eventName: event.name,
    magicLinkUrl,
    revealAtFormatted: format(new Date(event.reveal_at), 'EEEE, d LLLL yyyy'),
  });

  return { status: 'success', email: data.email };
}

async function handleSupabase(eventSlug: string, data: JoinData): Promise<JoinState> {
  const supabase = createAdminClient();

  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('id, name, slug, reveal_at, status, registration_opens_at, registration_closes_at')
    .eq('slug', eventSlug)
    .maybeSingle();

  if (eventError) {
    return { status: 'error', message: `Couldn't look up that event: ${eventError.message}` };
  }
  if (!event) return { status: 'error', message: 'Event not found.' };

  const now = new Date();
  const opens = new Date(event.registration_opens_at);
  const closes = new Date(event.registration_closes_at);
  if (event.status !== 'open' || now < opens || now > closes) {
    return { status: 'error', message: 'Registration for this event is closed.' };
  }

  const { error: insertError } = await supabase.from('participants').insert({
    event_id: event.id,
    name: data.name,
    team: data.team,
    email: data.email,
    budget_amount: data.budget_amount,
    wishlist_likes: data.wishlist_likes,
    wishlist_dislikes: data.wishlist_dislikes,
    hot_drink: data.hot_drink,
    shirt_size: data.shirt_size,
  });

  // Unique-violation on (event_id, email) means they've already joined — we
  // still resend the magic link below, so treat it as success.
  if (insertError && insertError.code !== '23505') {
    return { status: 'error', message: `Couldn't save your entry: ${insertError.message}` };
  }

  const redirectTo = `${env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/me/${encodeURIComponent(event.slug)}`;
  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: data.email,
    options: { redirectTo },
  });
  if (linkError || !linkData?.properties?.action_link) {
    return {
      status: 'error',
      message: `Couldn't generate your sign-in link: ${linkError?.message ?? 'unknown error'}`,
    };
  }

  try {
    await sendJoinConfirmation({
      to: data.email,
      name: data.name,
      eventName: event.name,
      magicLinkUrl: linkData.properties.action_link,
      revealAtFormatted: format(new Date(event.reveal_at), 'EEEE, d LLLL yyyy'),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'email send failed';
    return { status: 'error', message: `Couldn't send your email: ${message}` };
  }

  return { status: 'success', email: data.email };
}

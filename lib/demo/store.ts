// In-memory store for demo mode. Persists across requests within a single dev-server
// process; resets on restart. Seeded with one open event + participants from seed.sql
// so you can test the join → dashboard flow without Supabase.

import { randomUUID } from 'node:crypto';
import type { EventRow, HotDrink, ParticipantRow, ShirtSize } from '@/lib/types';

const DEMO_EVENT_ID = '00000000-0000-0000-0000-000000000001';

function isoDaysFromNow(days: number): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

function dateDaysFromNow(days: number): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

const demoEvent: EventRow = {
  id: DEMO_EVENT_ID,
  name: 'Santa Demo 2026',
  slug: 'holiday-2026',
  registration_opens_at: isoDaysFromNow(-2),
  registration_closes_at: isoDaysFromNow(14),
  reveal_at: isoDaysFromNow(30),
  gifting_day: dateDaysFromNow(32),
  status: 'open',
  created_by: null,
  created_at: isoDaysFromNow(-2),
};

// Stash the map on globalThis so hot reloads don't wipe it.
const g = globalThis as unknown as { __santaDemoParticipants?: Map<string, ParticipantRow> };
const participants: Map<string, ParticipantRow> =
  g.__santaDemoParticipants ?? (g.__santaDemoParticipants = new Map());

function key(eventId: string, email: string) {
  return `${eventId}:${email.toLowerCase()}`;
}

export function getDemoEventBySlug(slug: string): EventRow | null {
  return demoEvent.slug === slug ? demoEvent : null;
}

export function listDemoEvents(): EventRow[] {
  return [demoEvent];
}

export interface UpsertDemoParticipantInput {
  event_id: string;
  name: string;
  team: string;
  email: string;
  budget_amount: number;
  wishlist_likes: string;
  wishlist_dislikes: string;
  hot_drink: HotDrink;
  shirt_size: ShirtSize;
}

export interface UpsertDemoParticipantResult {
  participant: ParticipantRow;
  wasExisting: boolean;
}

export function upsertDemoParticipant(
  input: UpsertDemoParticipantInput,
): UpsertDemoParticipantResult {
  const existing = participants.get(key(input.event_id, input.email));
  if (existing) {
    const updated: ParticipantRow = {
      ...existing,
      name: input.name,
      team: input.team,
      budget_amount: input.budget_amount,
      wishlist_likes: input.wishlist_likes,
      wishlist_dislikes: input.wishlist_dislikes,
      hot_drink: input.hot_drink,
      shirt_size: input.shirt_size,
    };
    participants.set(key(input.event_id, input.email), updated);
    return { participant: updated, wasExisting: true };
  }
  const row: ParticipantRow = {
    id: randomUUID(),
    event_id: input.event_id,
    name: input.name,
    team: input.team,
    email: input.email.toLowerCase(),
    budget_amount: input.budget_amount,
    wishlist_likes: input.wishlist_likes,
    wishlist_dislikes: input.wishlist_dislikes,
    hot_drink: input.hot_drink,
    shirt_size: input.shirt_size,
    joined_at: new Date().toISOString(),
    is_active: true,
  };
  participants.set(key(input.event_id, input.email), row);
  return { participant: row, wasExisting: false };
}

export function getDemoParticipant(eventId: string, email: string): ParticipantRow | null {
  return participants.get(key(eventId, email)) ?? null;
}

export function listDemoParticipants(eventId: string): ParticipantRow[] {
  return Array.from(participants.values()).filter((p) => p.event_id === eventId);
}

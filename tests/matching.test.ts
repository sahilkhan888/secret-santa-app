import { describe, it, expect } from 'vitest';
import { runDraw, type Participant, type Match } from '@/lib/matching';

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function make(
  id: string,
  team: string,
  budget: number,
  name: string = id,
): Participant {
  return { id, name, team, budget };
}

function assertValidCycle(matches: Match[], participants: Participant[]) {
  const santaIds = new Set<string>();
  const gifteeIds = new Set<string>();
  for (const m of matches) {
    expect(m.santaId).not.toBe(m.gifteeId);
    expect(santaIds.has(m.santaId)).toBe(false);
    expect(gifteeIds.has(m.gifteeId)).toBe(false);
    santaIds.add(m.santaId);
    gifteeIds.add(m.gifteeId);
  }
  expect(santaIds.size).toBe(participants.length);
  expect(gifteeIds.size).toBe(participants.length);

  // No 2-cycles: if (a,b) exists then (b,a) must not.
  const edge = new Map<string, string>();
  for (const m of matches) edge.set(m.santaId, m.gifteeId);
  for (const [a, b] of edge) {
    expect(edge.get(b)).not.toBe(a);
  }
}

function matchSetSignature(matches: Match[]): string {
  return matches
    .map((m) => `${m.santaId}->${m.gifteeId}`)
    .sort()
    .join(',');
}

describe('runDraw', () => {
  it('matches 10 varied participants with cross-team rate > 70%', () => {
    const participants: Participant[] = [
      make('01', 'eng', 500),
      make('02', 'eng', 600),
      make('03', 'des', 650),
      make('04', 'des', 700),
      make('05', 'sal', 720),
      make('06', 'sal', 730),
      make('07', 'ops', 740),
      make('08', 'ops', 745),
      make('09', 'ppl', 750),
      make('10', 'ppl', 750),
    ];
    const result = runDraw(participants, { rng: mulberry32(42) });
    if (!result.ok) throw new Error(result.detail);
    expect(result.matches).toHaveLength(10);
    expect(result.buckets).toHaveLength(1);
    assertValidCycle(result.matches, participants);
    expect(result.crossTeamRate).toBeGreaterThan(0.7);
  });

  it('matches 3 same-team participants with cross-team rate 0 and emits warnings', () => {
    const participants: Participant[] = [
      make('01', 'eng', 1000),
      make('02', 'eng', 1000),
      make('03', 'eng', 1000),
    ];
    const result = runDraw(participants, { rng: mulberry32(7) });
    if (!result.ok) throw new Error(result.detail);
    expect(result.matches).toHaveLength(3);
    expect(result.crossTeamRate).toBe(0);
    expect(result.warnings.length).toBeGreaterThan(0);
    assertValidCycle(result.matches, participants);
  });

  it('returns TOO_FEW_PARTICIPANTS for 2 participants', () => {
    const result = runDraw([make('01', 'eng', 1000), make('02', 'des', 1000)]);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe('TOO_FEW_PARTICIPANTS');
  });

  it('creates two internally-consistent buckets for 7 at ₹500 + 3 at ₹2000', () => {
    const participants: Participant[] = [
      ...Array.from({ length: 7 }, (_, i) =>
        make(`lo${i}`, i % 2 === 0 ? 'eng' : 'des', 500),
      ),
      ...Array.from({ length: 3 }, (_, i) =>
        make(`hi${i}`, ['eng', 'des', 'sal'][i], 2000),
      ),
    ];
    const result = runDraw(participants, { rng: mulberry32(99) });
    if (!result.ok) throw new Error(result.detail);
    expect(result.buckets).toHaveLength(2);
    expect(result.buckets[0].participants).toHaveLength(7);
    expect(result.buckets[1].participants).toHaveLength(3);

    const byId = new Map(participants.map((p) => [p.id, p]));
    for (const m of result.matches) {
      const santa = byId.get(m.santaId)!;
      const giftee = byId.get(m.gifteeId)!;
      expect(santa.budget).toBeGreaterThanOrEqual(m.bucketMin);
      expect(santa.budget).toBeLessThanOrEqual(m.bucketMax);
      expect(giftee.budget).toBeGreaterThanOrEqual(m.bucketMin);
      expect(giftee.budget).toBeLessThanOrEqual(m.bucketMax);
    }
    assertValidCycle(result.matches, participants);
  });

  it('puts everyone in a single bucket when all budgets are equal', () => {
    const participants: Participant[] = Array.from({ length: 6 }, (_, i) =>
      make(String(i), ['eng', 'des', 'sal'][i % 3], 1000),
    );
    const result = runDraw(participants, { rng: mulberry32(3) });
    if (!result.ok) throw new Error(result.detail);
    expect(result.buckets).toHaveLength(1);
    expect(result.matches).toHaveLength(6);
    assertValidCycle(result.matches, participants);
  });

  it('produces different valid matches across unseeded runs (non-idempotent)', () => {
    const participants: Participant[] = Array.from({ length: 10 }, (_, i) =>
      make(String(i), ['eng', 'des', 'sal', 'ops', 'ppl'][i % 5], 1000),
    );
    const signatures = new Set<string>();
    for (let i = 0; i < 5; i++) {
      const result = runDraw(participants);
      if (!result.ok) throw new Error(result.detail);
      assertValidCycle(result.matches, participants);
      signatures.add(matchSetSignature(result.matches));
    }
    expect(signatures.size).toBeGreaterThanOrEqual(2);
  });

  it('produces identical matches across runs with the same seeded RNG', () => {
    const participants: Participant[] = Array.from({ length: 8 }, (_, i) =>
      make(String(i), ['eng', 'des', 'sal', 'ops'][i % 4], 1000),
    );
    const a = runDraw(participants, { rng: mulberry32(1234) });
    const b = runDraw(participants, { rng: mulberry32(1234) });
    if (!a.ok || !b.ok) throw new Error('unexpected failure');
    expect(matchSetSignature(a.matches)).toBe(matchSetSignature(b.matches));
  });

  it('merges undersized buckets into a single bucket for 2×₹400 + 5×₹1000 + 2×₹2500', () => {
    const participants: Participant[] = [
      make('a1', 'eng', 400),
      make('a2', 'des', 400),
      make('b1', 'eng', 1000),
      make('b2', 'des', 1000),
      make('b3', 'sal', 1000),
      make('b4', 'ops', 1000),
      make('b5', 'ppl', 1000),
      make('c1', 'eng', 2500),
      make('c2', 'des', 2500),
    ];
    const result = runDraw(participants, { rng: mulberry32(55) });
    if (!result.ok) throw new Error(result.detail);
    expect(result.buckets).toHaveLength(1);
    expect(result.buckets[0].participants).toHaveLength(9);
    expect(result.buckets[0].min).toBe(400);
    expect(result.buckets[0].max).toBe(2500);
    assertValidCycle(result.matches, participants);
  });
});

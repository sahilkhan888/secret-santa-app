export interface Participant {
  id: string;
  name: string;
  team: string;
  budget: number;
}

export interface Match {
  santaId: string;
  gifteeId: string;
  bucketMin: number;
  bucketMax: number;
}

export interface Bucket {
  min: number;
  max: number;
  participants: Participant[];
}

export type DrawError =
  | 'TOO_FEW_PARTICIPANTS'
  | 'BUCKETING_FAILED'
  | 'CYCLE_CONSTRUCTION_FAILED';

export type DrawResult =
  | {
      ok: true;
      matches: Match[];
      buckets: Bucket[];
      crossTeamRate: number;
      warnings: string[];
    }
  | { ok: false; error: DrawError; detail: string };

export interface RunDrawOptions {
  rng?: () => number;
  maxAttempts?: number;
  crossTeamTarget?: number;
}

const DEFAULT_MAX_ATTEMPTS = 100;
const DEFAULT_CROSS_TEAM_TARGET = 0.7;
const BUCKET_RATIO = 1.5;

export function runDraw(
  participants: Participant[],
  opts: RunDrawOptions = {},
): DrawResult {
  const rng = opts.rng ?? Math.random;
  const maxAttempts = opts.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const crossTeamTarget = opts.crossTeamTarget ?? DEFAULT_CROSS_TEAM_TARGET;

  if (participants.length < 3) {
    return {
      ok: false,
      error: 'TOO_FEW_PARTICIPANTS',
      detail: `Need at least 3 participants to run a draw; got ${participants.length}.`,
    };
  }

  const sorted = [...participants].sort((a, b) => {
    if (a.budget !== b.budget) return a.budget - b.budget;
    if (a.id < b.id) return -1;
    if (a.id > b.id) return 1;
    return 0;
  });

  const buckets = greedyBucket(sorted);
  const mergeResult = mergeUndersizedBuckets(buckets);
  if (!mergeResult.ok) return mergeResult;
  const merged = mergeResult.buckets;

  const matches: Match[] = [];
  const warnings: string[] = [];

  for (const bucket of merged) {
    const cycleResult = buildWeightedCycle(bucket, rng, maxAttempts, crossTeamTarget);
    if (!cycleResult.ok) return cycleResult;
    if (cycleResult.rate < crossTeamTarget) {
      warnings.push(
        `Bucket ₹${bucket.min}-${bucket.max}: cross-team rate ${(cycleResult.rate * 100).toFixed(0)}% below target ${(crossTeamTarget * 100).toFixed(0)}%.`,
      );
    }
    for (const edge of cycleResult.edges) {
      matches.push({
        santaId: edge.santa.id,
        gifteeId: edge.giftee.id,
        bucketMin: bucket.min,
        bucketMax: bucket.max,
      });
    }
  }

  const byId = new Map(participants.map((p) => [p.id, p]));
  const crossCount = matches.reduce((acc, m) => {
    const santa = byId.get(m.santaId)!;
    const giftee = byId.get(m.gifteeId)!;
    return acc + (santa.team !== giftee.team ? 1 : 0);
  }, 0);

  return {
    ok: true,
    matches,
    buckets: merged,
    crossTeamRate: matches.length > 0 ? crossCount / matches.length : 0,
    warnings,
  };
}

function greedyBucket(sortedParticipants: Participant[]): Bucket[] {
  const buckets: Bucket[] = [];
  let current: Bucket = {
    min: sortedParticipants[0].budget,
    max: sortedParticipants[0].budget,
    participants: [sortedParticipants[0]],
  };
  for (let i = 1; i < sortedParticipants.length; i++) {
    const p = sortedParticipants[i];
    if (p.budget > BUCKET_RATIO * current.min) {
      buckets.push(current);
      current = { min: p.budget, max: p.budget, participants: [p] };
    } else {
      current.participants.push(p);
      if (p.budget > current.max) current.max = p.budget;
    }
  }
  buckets.push(current);
  return buckets;
}

type MergeResult =
  | { ok: true; buckets: Bucket[] }
  | { ok: false; error: DrawError; detail: string };

function mergeUndersizedBuckets(initial: Bucket[]): MergeResult {
  const buckets = initial.map((b) => ({ ...b, participants: [...b.participants] }));

  while (true) {
    const i = buckets.findIndex((b) => b.participants.length < 3);
    if (i === -1) break;
    if (buckets.length === 1) {
      return {
        ok: false,
        error: 'BUCKETING_FAILED',
        detail: `Only ${buckets[0].participants.length} active participants total — can't form a draw.`,
      };
    }

    const leftIdx = i > 0 ? i - 1 : -1;
    const rightIdx = i < buckets.length - 1 ? i + 1 : -1;
    const postMergeRatio = (j: number) => {
      const lo = Math.min(i, j);
      const hi = Math.max(i, j);
      return buckets[hi].max / buckets[lo].min;
    };
    const leftRatio = leftIdx >= 0 ? postMergeRatio(leftIdx) : Infinity;
    const rightRatio = rightIdx >= 0 ? postMergeRatio(rightIdx) : Infinity;

    let mergeWith: number;
    if (leftRatio < rightRatio) {
      mergeWith = leftIdx;
    } else if (rightRatio < leftRatio) {
      mergeWith = rightIdx;
    } else {
      // Tie on ratio — prefer smaller neighbor, then left.
      const leftSize = leftIdx >= 0 ? buckets[leftIdx].participants.length : Infinity;
      const rightSize = rightIdx >= 0 ? buckets[rightIdx].participants.length : Infinity;
      if (leftSize <= rightSize && leftIdx >= 0) mergeWith = leftIdx;
      else mergeWith = rightIdx;
    }

    const lo = Math.min(i, mergeWith);
    const hi = Math.max(i, mergeWith);
    const mergedBucket: Bucket = {
      min: Math.min(buckets[lo].min, buckets[hi].min),
      max: Math.max(buckets[lo].max, buckets[hi].max),
      participants: [...buckets[lo].participants, ...buckets[hi].participants],
    };
    buckets.splice(lo, 2, mergedBucket);
  }

  return { ok: true, buckets };
}

interface Edge {
  santa: Participant;
  giftee: Participant;
}

type CycleResult =
  | { ok: true; edges: Edge[]; rate: number }
  | { ok: false; error: DrawError; detail: string };

function buildWeightedCycle(
  bucket: Bucket,
  rng: () => number,
  maxAttempts: number,
  crossTeamTarget: number,
): CycleResult {
  const n = bucket.participants.length;
  if (n < 3) {
    return {
      ok: false,
      error: 'CYCLE_CONSTRUCTION_FAILED',
      detail: `Bucket ₹${bucket.min}-${bucket.max} has ${n} participants after merging.`,
    };
  }

  let bestEdges: Edge[] | null = null;
  let bestRate = -1;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const perm = fisherYates(bucket.participants, rng);
    const edges: Edge[] = perm.map((santa, idx) => ({
      santa,
      giftee: perm[(idx + 1) % n],
    }));
    const crossCount = edges.reduce(
      (acc, e) => acc + (e.santa.team !== e.giftee.team ? 1 : 0),
      0,
    );
    const rate = crossCount / edges.length;
    if (rate > bestRate) {
      bestEdges = edges;
      bestRate = rate;
    }
    if (rate >= crossTeamTarget) break;
  }

  if (!bestEdges) {
    return {
      ok: false,
      error: 'CYCLE_CONSTRUCTION_FAILED',
      detail: `No cycle found for bucket ₹${bucket.min}-${bucket.max}.`,
    };
  }

  return { ok: true, edges: bestEdges, rate: bestRate };
}

function fisherYates<T>(arr: readonly T[], rng: () => number): T[] {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

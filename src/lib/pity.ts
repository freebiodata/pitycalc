/**
 * PityHub core pity math.
 *
 * Every formula and constant here is documented (with sources and snapshot date)
 * on /methodology/. Summary of the model:
 *
 * - Base 5★ rate: 0.6% per wish (character & standard banners), 0.7% (weapon banner).
 * - Soft pity: from wish 74 (character/standard) the rate grows by ~6 percentage
 *   points per wish; from wish ~63 (weapon) by ~7 pp per wish. Community-measured.
 * - Hard pity: wish 90 (character/standard) and wish 80 (weapon) always give a 5★.
 * - Character banner 50/50: a 5★ is the featured one with 50%; a loss guarantees
 *   the next 5★. Since v5.0, "Capturing Radiance" can rescue a losing 50/50 after
 *   a previous loss - modeled as a 10% rescue on an "armed" 50/50, matching the
 *   official consolidated featured probability of 55%.
 * - Weapon banner (v5.0+ Epitomized Path): a 5★ is your selected weapon with
 *   37.5% (75% featured pair × 50% your pick); otherwise you gain 1 fate point
 *   and the next 5★ is guaranteed to be your selection.
 * - Standard banner: no featured layer, the target is "any 5★".
 */

export type BannerKind = 'character' | 'weapon' | 'standard';

export interface BannerModel {
  kind: BannerKind;
  label: string;
  shortLabel: string;
  /** Base 5★ probability per wish before soft pity. */
  baseRate: number;
  /** 1-based wish number at which the soft-pity ramp begins. */
  softPityStart: number;
  /** Probability added per wish once soft pity starts. */
  softPityStep: number;
  /** 1-based wish number that guarantees a 5★. */
  hardPity: number;
  /** Official "consolidated probability" shown in-game, used for verification. */
  consolidated: number;
}

export const BANNERS: Record<BannerKind, BannerModel> = {
  character: {
    kind: 'character',
    label: 'Character Event Wish',
    shortLabel: 'Character banner',
    baseRate: 0.006,
    softPityStart: 74,
    softPityStep: 0.06,
    hardPity: 90,
    consolidated: 0.016,
  },
  weapon: {
    kind: 'weapon',
    label: 'Event Wish - Weapon (Epitomized Invocation)',
    shortLabel: 'Weapon banner',
    baseRate: 0.007,
    softPityStart: 63,
    softPityStep: 0.07,
    hardPity: 80,
    consolidated: 0.0185,
  },
  standard: {
    kind: 'standard',
    label: 'Standard Wish (Wanderlust Invocation)',
    shortLabel: 'Standard banner',
    baseRate: 0.006,
    softPityStart: 74,
    softPityStep: 0.06,
    hardPity: 90,
    consolidated: 0.016,
  },
};

/**
 * Probability that the wish at position `wishNumber` (1-based within the current
 * pity cycle) yields a 5★.
 */
export function rateAtWish(banner: BannerKind, wishNumber: number): number {
  const b = BANNERS[banner];
  if (wishNumber >= b.hardPity) return 1;
  if (wishNumber >= b.softPityStart) {
    return Math.min(1, b.baseRate + b.softPityStep * (wishNumber - b.softPityStart + 1));
  }
  return b.baseRate;
}

/** Clamp a user-entered pity counter to a legal value for the banner. */
export function clampPity(banner: BannerKind, pity: number): number {
  const max = BANNERS[banner].hardPity - 1;
  const p = Number.isFinite(pity) ? Math.floor(pity) : 0;
  return Math.max(0, Math.min(max, p));
}

/* ------------------------------------------------------------------ *
 * Plain 5★ probability (no 50/50 layer - "any 5★ within N wishes").
 * ------------------------------------------------------------------ */

/** Cumulative P(at least one 5★ within n wishes) for n = 0..maxN. */
export function fiveStarCurve(banner: BannerKind, pity: number, maxN: number): number[] {
  const b = BANNERS[banner];
  let p = clampPity(banner, pity);
  let survive = 1;
  const out: number[] = [0];
  for (let n = 1; n <= maxN; n++) {
    survive *= 1 - rateAtWish(banner, p + 1);
    if (survive <= 1e-15) {
      survive = 0;
      out.push(1);
      for (let rest = n + 1; rest <= maxN; rest++) out.push(1);
      return out;
    }
    out.push(1 - survive);
    p = (p + 1) % b.hardPity;
  }
  return out;
}

/** P(at least one 5★ within `wishes` pulls, given current pity counter). */
export function fiveStarProb(banner: BannerKind, pity: number, wishes: number): number {
  const n = Math.max(0, Math.floor(wishes));
  return fiveStarCurve(banner, pity, n)[n] ?? 1;
}

/** First n such that P(5★ within n) ≥ target (e.g. 0.5 = median). */
export function wishesForFiveStarConfidence(
  banner: BannerKind,
  pity: number,
  target: number,
): number {
  const curve = fiveStarCurve(banner, pity, BANNERS[banner].hardPity);
  for (let n = 0; n < curve.length; n++) {
    if (curve[n] >= target - 1e-12) return n;
  }
  return BANNERS[banner].hardPity;
}

/** Expected (mean) number of wishes until a 5★, given current pity. */
export function meanWishesToFiveStar(banner: BannerKind, pity: number): number {
  const b = BANNERS[banner];
  let p = clampPity(banner, pity);
  let survive = 1;
  let mean = 0;
  for (let n = 0; n < b.hardPity; n++) {
    mean += survive;
    survive *= 1 - rateAtWish(banner, p + 1);
    p = (p + 1) % b.hardPity;
    if (survive <= 1e-15) break;
  }
  return mean;
}

/* ------------------------------------------------------------------ *
 * Target 5★ probability (50/50 + Capturing Radiance / fate points).
 * ------------------------------------------------------------------ */

export type CharState = 'fresh' | 'armed' | 'guaranteed';

/** Community-measured rescue chance on a losing, Radiance-armed 50/50. */
export const RADIANCE_RESCUE = 0.1;

export interface TargetParams {
  banner: BannerKind;
  /** Current pity counter (wishes since last 5★). */
  pity: number;
  /** Character banner: 50/50 situation. */
  state: CharState;
  /** Weapon banner: current fate points under Epitomized Path. */
  fatePoints: 0 | 1;
  /** Weapon banner: use the v5.0+ Epitomized Path (1 fate point) guarantee. */
  epitomized: boolean;
  /** Character banner: apply the v5.0+ Capturing Radiance model. */
  radiance: boolean;
}

export function defaultParams(banner: BannerKind = 'character'): TargetParams {
  return {
    banner,
    pity: 0,
    state: 'fresh',
    fatePoints: 0,
    epitomized: true,
    radiance: true,
  };
}

/** Number of phases in the DP state machine for the banner. */
function phaseCount(p: TargetParams): number {
  if (p.banner === 'character') return 3; // fresh | armed | guaranteed
  if (p.banner === 'weapon') return p.epitomized ? 2 : 1; // fate 0 | fate 1
  return 1; // standard: any 5★ is the target
}

function startPhase(p: TargetParams): number {
  if (p.banner === 'character') {
    return p.state === 'fresh' ? 0 : p.state === 'armed' ? 1 : 2;
  }
  if (p.banner === 'weapon') {
    if (!p.epitomized) return 0;
    return p.fatePoints === 1 ? 1 : 0;
  }
  return 0;
}

/** P(this 5★ is the target | phase). */
function phaseWin(p: TargetParams, phase: number): number {
  if (p.banner === 'character') {
    if (phase === 2) return 1; // guaranteed
    if (phase === 1) {
      // Armed 50/50: 50% natural win + rescue of losses when Radiance is on.
      const rescue = p.radiance ? RADIANCE_RESCUE : 0;
      return 0.5 + 0.5 * rescue;
    }
    return 0.5;
  }
  if (p.banner === 'weapon') {
    if (phase === 1) return 1; // fate point: guaranteed selected weapon
    return 0.75 * 0.5; // 75% featured pair × 50% your pick
  }
  return 1;
}

/** Phase after a losing 5★ (pity resets to 0 alongside this). */
function phaseOnLoss(p: TargetParams, phase: number): number {
  if (p.banner === 'character') return 2; // loss → guaranteed next 5★
  if (p.banner === 'weapon') return p.epitomized ? 1 : 0; // gain a fate point
  return 0;
}

interface DPResult {
  /** Cumulative P(target within n wishes), n = 0..maxN. */
  curve: number[];
  /** Phase distribution left after maxN wishes (for tests/debug). */
  residual: Float64Array;
}

function runDP(p: TargetParams, maxN: number): DPResult {
  const b = BANNERS[p.banner];
  const phases = phaseCount(p);
  const start = clampPity(p.banner, p.pity);
  let dist = new Float64Array(b.hardPity * phases);
  dist[start * phases + startPhase(p)] = 1;

  let absorbed = 0;
  const curve: number[] = [0];
  for (let n = 1; n <= maxN; n++) {
    const next = new Float64Array(dist.length);
    for (let pityIdx = 0; pityIdx < b.hardPity; pityIdx++) {
      const r = rateAtWish(p.banner, pityIdx + 1);
      const no5 = 1 - r;
      for (let ph = 0; ph < phases; ph++) {
        const m = dist[pityIdx * phases + ph];
        if (m === 0) continue;
        if (no5 > 0) next[(pityIdx + 1) * phases + ph] += m * no5;
        const win = phaseWin(p, ph);
        if (win >= 1) {
          absorbed += m * r;
        } else {
          absorbed += m * r * win;
          // Losing mass: pity resets to 0 and the phase becomes the post-loss phase.
          const lossPhase = phaseOnLoss(p, ph);
          next[lossPhase] += m * r * (1 - win);
        }
      }
    }
    // NOTE: loss mass lands at pity 0 with the post-loss phase.
    dist = next;
    if (absorbed >= 1 - 1e-15) {
      absorbed = 1;
      curve.push(1);
      for (let rest = n + 1; rest <= maxN; rest++) curve.push(1);
      return { curve, residual: new Float64Array(dist.length) };
    }
    curve.push(absorbed);
  }
  return { curve, residual: dist };
}

/**
 * P(obtain the target 5★ within `wishes` pulls), computed exactly with a
 * forward DP over (pity counter × guarantee/fate state).
 */
export function featuredProb(p: TargetParams, wishes: number): number {
  const n = Math.max(0, Math.floor(wishes));
  return runDP(p, n).curve[n] ?? 1;
}

/** Cumulative target-probability curve for n = 0..maxN. */
export function featuredCurve(p: TargetParams, maxN: number): number[] {
  return runDP(p, Math.max(0, Math.floor(maxN))).curve;
}

/** Smallest N such that P(target within N) ≥ confidence. */
export function wishesForConfidence(p: TargetParams, confidence: number): number {
  const worst = worstCaseWishes(p);
  const curve = featuredCurve(p, worst);
  for (let n = 0; n < curve.length; n++) {
    if (curve[n] >= confidence - 1e-12) return n;
  }
  return worst;
}

/** Absolute worst case (hard-pity math, ignoring soft pity). */
export function worstCaseWishes(p: TargetParams): number {
  const b = BANNERS[p.banner];
  const toFirst = b.hardPity - clampPity(p.banner, p.pity);
  if (p.banner === 'character') {
    return p.state === 'guaranteed' ? toFirst : toFirst + b.hardPity;
  }
  if (p.banner === 'weapon') {
    if (!p.epitomized) return Infinity; // never guaranteed without fate points
    return p.fatePoints === 1 ? toFirst : toFirst + b.hardPity;
  }
  return toFirst;
}

/** Expected (mean) wishes until the target, E[T] = Σ P(T > n). */
export function meanWishesToTarget(p: TargetParams): number {
  const worst = worstCaseWishes(p);
  if (!Number.isFinite(worst)) return meanWishesToFiveStar(p.banner, p.pity) / (0.75 * 0.5);
  const curve = featuredCurve(p, worst);
  let mean = 0;
  for (let n = 0; n < curve.length; n++) mean += 1 - curve[n];
  return mean;
}

/* ------------------------------------------------------------------ *
 * Monte Carlo simulator (documented rates, seedable).
 * ------------------------------------------------------------------ */

export interface SimEvent {
  /** 1-based wish index within the simulated budget. */
  wish: number;
  /** 5★: was it the target? */
  target: boolean;
  /** Character: Capturing Radiance rescued a losing 50/50. */
  radiance?: boolean;
  /** Character: this 5★ resolved a guarantee. */
  viaGuarantee?: boolean;
  /** Weapon: miss type on a non-target 5★. */
  missKind?: 'other-featured' | 'standard';
  /** Weapon: this 5★ was guaranteed by a fate point. */
  viaFatePoint?: boolean;
  /** Pity counter this 5★ arrived at. */
  pityAt: number;
}

export interface SimResult {
  events: SimEvent[];
  gotTarget: boolean;
  targetAtWish: number | null;
  fiveStars: number;
  fourStars: number;
  radianceTriggers: number;
  /** Rarity per pull: 3 | 4 | 5 (5★ entries are the events above). */
  rarities: number[];
  endPity: number;
}

/** Deterministic, fast PRNG (mulberry32). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FOUR_STAR_BASE = 0.051; // documented base rate; guaranteed every 10th

export function simulate(p: TargetParams, budget: number, rand: () => number): SimResult {
  const b = BANNERS[p.banner];
  let pityIdx = clampPity(p.banner, p.pity);
  let fourPity = 0;
  let phase = startPhase(p);
  let gotTarget = false;
  let targetAtWish: number | null = null;
  let radianceTriggers = 0;
  const events: SimEvent[] = [];
  const rarities: number[] = [];
  let fourStars = 0;

  for (let w = 1; w <= budget; w++) {
    const r5 = rateAtWish(p.banner, pityIdx + 1);
    const r4 = FOUR_STAR_BASE + (fourPity >= 9 ? 1 - FOUR_STAR_BASE : 0);
    const u = rand();
    if (u < r5) {
      rarities.push(5);
      const ev: SimEvent = { wish: w, target: false, pityAt: pityIdx + 1 };
      if (p.banner === 'character') {
        if (phase === 2) {
          ev.target = true;
          ev.viaGuarantee = true;
          phase = 1; // after a guarantee the next 50/50 is Radiance-armed
        } else {
          const naturalWin = rand() < 0.5;
          if (naturalWin) {
            ev.target = true;
            phase = 0;
          } else if (p.radiance && phase === 1 && rand() < RADIANCE_RESCUE) {
            ev.target = true;
            ev.radiance = true;
            radianceTriggers++;
            phase = 0;
          } else {
            phase = 2;
          }
        }
      } else if (p.banner === 'weapon') {
        if (phase === 1) {
          ev.target = true;
          ev.viaFatePoint = true;
          phase = 0;
        } else {
          const win = rand() < 0.375;
          if (win) {
            ev.target = true;
          } else {
            ev.missKind = rand() < 0.375 / 0.625 ? 'other-featured' : 'standard';
            if (p.epitomized) phase = 1;
          }
        }
      } else {
        ev.target = true; // standard: any 5★
      }
      if (ev.target && !gotTarget) {
        gotTarget = true;
        targetAtWish = w;
      }
      events.push(ev);
      pityIdx = 0;
      fourPity = 0;
    } else if (u < r5 + r4) {
      // 4★ (approximate documented model: base 5.1%, pity 10; a 5★ outranks it).
      rarities.push(4);
      fourStars++;
      fourPity = 0;
      pityIdx++;
    } else {
      rarities.push(3);
      fourPity++;
      pityIdx++;
    }
  }
  return {
    events,
    gotTarget,
    targetAtWish,
    fiveStars: events.length,
    fourStars,
    radianceTriggers,
    rarities,
    endPity: pityIdx,
  };
}

export interface BatchResult {
  runs: number;
  budget: number;
  gotTarget: number;
  /** P(target within budget) - should match featuredProb(). */
  empiricalProb: number;
  /** Among runs that got the target: wish index of the first target. */
  firstTargetSamples: number[];
  meanFirstTarget: number;
  medianFirstTarget: number;
  p90FirstTarget: number;
}

export function simulateBatch(
  p: TargetParams,
  budget: number,
  runs: number,
  seed = 123456789,
): BatchResult {
  const rand = mulberry32(seed);
  let got = 0;
  const firsts: number[] = [];
  for (let i = 0; i < runs; i++) {
    const res = simulate(p, budget, rand);
    if (res.gotTarget) {
      got++;
      firsts.push(res.targetAtWish ?? budget);
    }
  }
  firsts.sort((a, b) => a - b);
  const q = (arr: number[], f: number) =>
    arr.length === 0 ? NaN : arr[Math.min(arr.length - 1, Math.floor(f * (arr.length - 1)))];
  return {
    runs,
    budget,
    gotTarget: got,
    empiricalProb: got / runs,
    firstTargetSamples: firsts,
    meanFirstTarget: firsts.reduce((a, b) => a + b, 0) / Math.max(1, firsts.length),
    medianFirstTarget: q(firsts, 0.5),
    p90FirstTarget: q(firsts, 0.9),
  };
}

/* ------------------------------------------------------------------ *
 * Formatting helpers (shared by pages and client scripts).
 * ------------------------------------------------------------------ */

export function fmtPct(x: number, digits = 1): string {
  if (!Number.isFinite(x)) return '-';
  return `${(x * 100).toFixed(digits)}%`;
}

export function fmtInt(x: number): string {
  return Math.round(x).toLocaleString('en-US');
}

/** Human label for the target of a calculation. */
export function targetLabel(p: TargetParams): string {
  if (p.banner === 'character') return 'the featured 5★ character';
  if (p.banner === 'weapon') return 'your selected 5★ weapon';
  return 'any 5★';
}

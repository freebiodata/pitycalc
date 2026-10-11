import { describe, expect, it } from 'vitest';
import {
  BANNERS,
  clampPity,
  featuredCurve,
  featuredProb,
  fiveStarProb,
  meanWishesToFiveStar,
  meanWishesToTarget,
  mulberry32,
  rateAtWish,
  simulateBatch,
  wishesForConfidence,
  wishesForFiveStarConfidence,
  worstCaseWishes,
  type TargetParams,
} from '../src/lib/pity';

const freshChar = (over: Partial<TargetParams> = {}): TargetParams => ({
  banner: 'character',
  pity: 0,
  state: 'fresh',
  fatePoints: 0,
  epitomized: true,
  radiance: true,
  ...over,
});

describe('rate model', () => {
  it('uses the documented base and soft-pity ramp (character banner)', () => {
    expect(rateAtWish('character', 1)).toBeCloseTo(0.006, 12);
    expect(rateAtWish('character', 73)).toBeCloseTo(0.006, 12);
    expect(rateAtWish('character', 74)).toBeCloseTo(0.066, 12); // soft pity begins
    expect(rateAtWish('character', 75)).toBeCloseTo(0.126, 12);
    expect(rateAtWish('character', 90)).toBe(1); // hard pity
  });

  it('uses the documented base and soft-pity ramp (weapon banner)', () => {
    expect(rateAtWish('weapon', 1)).toBeCloseTo(0.007, 12);
    expect(rateAtWish('weapon', 62)).toBeCloseTo(0.007, 12);
    expect(rateAtWish('weapon', 63)).toBeCloseTo(0.077, 12);
    expect(rateAtWish('weapon', 80)).toBe(1); // hard pity
  });

  it('clamps pity into legal range', () => {
    expect(clampPity('character', -5)).toBe(0);
    expect(clampPity('character', 999)).toBe(89);
    expect(clampPity('weapon', 999)).toBe(79);
  });
});

describe('5★ probability (community-verified numbers)', () => {
  it('hard pity: 90 wishes from pity 0 = 100% (character)', () => {
    expect(fiveStarProb('character', 0, 90)).toBeCloseTo(1, 12);
    expect(fiveStarProb('weapon', 0, 80)).toBeCloseTo(1, 12);
  });

  it('62 wishes ≈ 31%, NOT 50% - 62.5 is the *mean* (consolidated 1.6%), the median is ~76', () => {
    // The often-misquoted "50% at 62 wishes" confuses average with median.
    const p62 = fiveStarProb('character', 0, 62);
    expect(p62).toBeGreaterThan(0.30);
    expect(p62).toBeLessThan(0.33);

    const mean = meanWishesToFiveStar('character', 0);
    expect(mean).toBeGreaterThan(61.5);
    expect(mean).toBeLessThan(63.5); // official consolidated 1.6% → 62.5 mean
    expect(1 / mean).toBeCloseTo(BANNERS.character.consolidated, 3);

    const median = wishesForFiveStarConfidence('character', 0, 0.5);
    expect(median).toBeGreaterThanOrEqual(75);
    expect(median).toBeLessThanOrEqual(78);
  });

  it('weapon banner mean reproduces the official 1.85% consolidated rate', () => {
    const mean = meanWishesToFiveStar('weapon', 0);
    expect(1 / mean).toBeCloseTo(BANNERS.weapon.consolidated, 2); // ~1.88% modeled
    expect(mean).toBeGreaterThan(52);
    expect(mean).toBeLessThan(55);
  });

  it('90% of 5★s arrive by wish 80 (community-verified)', () => {
    const n90 = wishesForFiveStarConfidence('character', 0, 0.9);
    expect(n90).toBeGreaterThanOrEqual(78);
    expect(n90).toBeLessThanOrEqual(81);
  });

  it('respects the current pity counter', () => {
    // One wish from pity 73 → the next wish is #74 → soft-pity rate 6.6%.
    expect(fiveStarProb('character', 73, 1)).toBeCloseTo(0.066, 12);
    expect(fiveStarProb('character', 89, 1)).toBe(1);
  });
});

describe('target (featured) probability', () => {
  it('worst case: fresh 50/50 is guaranteed within 180; guaranteed within 90', () => {
    expect(featuredProb(freshChar(), 180)).toBeCloseTo(1, 12);
    expect(featuredProb(freshChar({ state: 'guaranteed' }), 90)).toBeCloseTo(1, 12);
    expect(worstCaseWishes(freshChar())).toBe(180);
    expect(worstCaseWishes(freshChar({ state: 'guaranteed' }))).toBe(90);
  });

  it('without Radiance, one 90-wish batch ≈ 59% for the featured character', () => {
    // P = 0.5·P(5★) + 0.5·P(two 5★s by 90); P(5★ by 90)=1 → 0.5 + 0.5·(~0.19).
    const p = featuredProb(freshChar({ radiance: false }), 90);
    expect(p).toBeGreaterThan(0.55);
    expect(p).toBeLessThan(0.62);
  });

  it('Radiance helps only from an armed 50/50 (loss → guarantee → new 50/50)', () => {
    // From 'fresh' the first target path never revisits an armed 50/50:
    // lose → guaranteed → absorbed. So Radiance cannot change the number.
    const freshOff = featuredProb(freshChar({ radiance: false }), 120);
    const freshOn = featuredProb(freshChar({ radiance: true }), 120);
    expect(freshOn).toBeCloseTo(freshOff, 12);

    // From 'armed' (lost the last 50/50, took the guarantee, on a 50/50 again)
    // the first 50/50 wins at 55% instead of 50%.
    const armedOff = featuredProb(freshChar({ state: 'armed', radiance: false }), 120);
    const armedOn = featuredProb(freshChar({ state: 'armed', radiance: true }), 120);
    expect(armedOn).toBeGreaterThan(armedOff);
    expect(armedOn - armedOff).toBeGreaterThan(0.01);
    expect(armedOn - armedOff).toBeLessThan(0.06);
  });

  it('standard banner equals plain 5★ probability', () => {
    const std: TargetParams = {
      banner: 'standard',
      pity: 10,
      state: 'fresh',
      fatePoints: 0,
      epitomized: false,
      radiance: false,
    };
    expect(featuredProb(std, 60)).toBeCloseTo(fiveStarProb('standard', 10, 60), 10);
  });

  it('weapon: selected weapon guaranteed within 160 with 1 fate point (v5.0+)', () => {
    expect(featuredProb(freshChar({ banner: 'weapon' }), 160)).toBeCloseTo(1, 12);
    expect(worstCaseWishes(freshChar({ banner: 'weapon' }))).toBe(160);
    // With a fate point already banked: within 80.
    expect(featuredProb(freshChar({ banner: 'weapon', fatePoints: 1 }), 80)).toBeCloseTo(1, 12);
  });

  it('weapon: 37.5% per 5★ without fate points (v1.0–4.x behaviour)', () => {
    const noEp = freshChar({ banner: 'weapon', epitomized: false });
    expect(featuredProb(noEp, 80)).not.toBe(1);
    // 1 - (1-0.375·f)… sanity: must be ≤ P(one 5★ within 80) = 1.
    expect(featuredProb(noEp, 80)).toBeGreaterThan(0.375);
    expect(worstCaseWishes(noEp)).toBe(Infinity);
  });

  it('wishes-for-90% falls between median and worst case', () => {
    const n90 = wishesForConfidence(freshChar(), 0.9);
    const n50 = wishesForConfidence(freshChar(), 0.5);
    expect(n50).toBeGreaterThan(70);
    expect(n50).toBeLessThan(95);
    expect(n90).toBeGreaterThan(n50);
    expect(n90).toBeLessThanOrEqual(180);
    // eslint-disable-next-line no-console
    console.log('[key numbers] featured char fresh: p50 =', n50, 'p90 =', n90,
      'mean =', meanWishesToTarget(freshChar()).toFixed(1));
  });
});

describe('Monte Carlo agrees with the exact DP', () => {
  it('character fresh, budget 80: empirical ≈ exact', () => {
    const exact = featuredProb(freshChar(), 80);
    const batch = simulateBatch(freshChar(), 80, 20000, 424242);
    expect(Math.abs(batch.empiricalProb - exact)).toBeLessThan(0.015);
    // eslint-disable-next-line no-console
    console.log('[key numbers] DP(80 fresh) =', exact.toFixed(4),
      'MC =', batch.empiricalProb.toFixed(4));
  });

  it('weapon with Epitomized Path, budget 120: empirical ≈ exact', () => {
    const p = freshChar({ banner: 'weapon' });
    const exact = featuredProb(p, 120);
    const batch = simulateBatch(p, 120, 20000, 777);
    expect(Math.abs(batch.empiricalProb - exact)).toBeLessThan(0.015);
  });

  it('curve is monotonic and reaches 1 at worst case', () => {
    const curve = featuredCurve(freshChar(), 200);
    for (let i = 1; i < curve.length; i++) {
      expect(curve[i]).toBeGreaterThanOrEqual(curve[i - 1] - 1e-12);
    }
    expect(curve[180]).toBeCloseTo(1, 12);
  });

  it('mulberry32 is deterministic', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    expect(a()).toBe(b());
    expect(a()).toBe(b());
  });
});

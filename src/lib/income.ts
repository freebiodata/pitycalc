/**
 * Savings-planner income data.
 *
 * CONVENTION (documented on /methodology/ and next to the inputs):
 * - A "patch" is one numbered version, ~42 days (6 weeks), containing two
 *   banner halves.
 * - "Recurring income" = dailies, Spiral of Abyss, Imaginarium Theater,
 *   events, maintenance mail and livestream codes. It excludes one-time
 *   rewards (exploration, quests, achievements) that vary hugely per patch.
 * - 160 primogems = 1 wish. Welkin adds 90/day + 300 Genesis on purchase.
 *   Paid Battle Pass (Gnostic Hymn) adds 680 primogems + 8 Intertwined Fates.
 * - Stardust exchange adds 5 Intertwined Fates per month (optional toggle).
 * - All preset values are estimates for planning, not guarantees - patch
 *   income varies. Snapshot: October 2026.
 */

export const PRIMOGEMS_PER_WISH = 160;
export const PATCH_DAYS_DEFAULT = 42;
export const STARDUST_FATES_PER_MONTH = 5;
export const MONTHS_PER_PATCH = 7 / 6; // 42-day patch ≈ 1.4 months

export interface IncomePreset {
  id: string;
  label: string;
  /** Estimated wishes per 42-day patch. */
  wishes: number;
  blurb: string;
}

export const INCOME_PRESETS: IncomePreset[] = [
  {
    id: 'f2p',
    label: 'F2P - recurring only',
    wishes: 45,
    blurb:
      'Dailies, Abyss, Imaginarium Theater, events, mail & livestream codes. No one-time exploration.',
  },
  {
    id: 'f2p-full',
    label: 'F2P - everything',
    wishes: 75,
    blurb:
      'Recurring income plus an average patch\u2019s one-time rewards: exploration, quests, new-area chests.',
  },
  {
    id: 'welkin',
    label: 'Welkin Moon',
    wishes: 70,
    blurb: 'Recurring income + Welkin Moon (90 primogems/day + 300 Genesis on purchase).',
  },
  {
    id: 'welkin-bp',
    label: 'Welkin + Battle Pass',
    wishes: 83,
    blurb: 'Adds Gnostic Hymn: 680 primogems + 8 Intertwined Fates per patch.',
  },
];

/** Patches of saving still required. */
export function patchesNeeded(needed: number, have: number, perPatch: number): number {
  const shortfall = Math.max(0, needed - have);
  if (shortfall <= 0) return 0;
  if (perPatch <= 0) return Infinity;
  return Math.ceil(shortfall / perPatch);
}

/** Total wishes you'll hold after `patches` patches at `perPatch`, with stardust. */
export function projectedWishes(
  have: number,
  perPatch: number,
  patches: number,
  stardustPerMonth = 0,
): number {
  return have + perPatch * patches + stardustPerMonth * MONTHS_PER_PATCH * patches;
}

/** Calendar days until the goal is met. */
export function daysNeeded(needed: number, have: number, perPatch: number, patchDays: number): number {
  return patchesNeeded(needed, have, perPatch) * patchDays;
}

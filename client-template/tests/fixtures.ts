/**
 * Shared test fixtures — a small but fully valid 5×4, 5-line game config
 * plus jurisdiction policies. Test-only; the real game specializes
 * config/*.json against the JSON Schemas.
 */

import type { GameConfig, JurisdictionPolicy } from '../src/core/types.js';

const H1_HEAVY = ['H1', 'H1', 'H1', 'H1', 'H1', 'H1', 'H1', 'H1'];

/** Base strip used on every reel (length 24, one SCATTER each). */
function baseStrip(): string[] {
  return [
    'H1', 'L1', 'H2', 'L2', 'L1', 'WILD', 'L2', 'H2',
    'L1', 'SCATTER', 'L2', 'H1', 'L1', 'H2', 'L2', 'L1',
    'H1', 'L2', 'WILD', 'L1', 'H2', 'L2', 'L1', 'H2',
  ];
}

export function makeConfig(overrides: Partial<GameConfig> = {}): GameConfig {
  return {
    projectSlug: 'template-example',
    gameVersion: '1.0.0',
    mathVersion: '1.0.0',
    currency: 'EUR',
    columns: 5,
    rows: 4,
    lines: [
      [0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1],
      [2, 2, 2, 2, 2],
      [3, 3, 3, 3, 3],
      [0, 1, 2, 1, 0],
    ],
    minBetMinor: 10,
    maxBetMinor: 10000,
    maxWinXBet: 5000,
    rtpTarget: 0.96,
    symbols: [
      { id: 'WILD', kind: 'wild' },
      { id: 'SCATTER', kind: 'scatter' },
      { id: 'H1', kind: 'premium' },
      { id: 'H2', kind: 'premium' },
      { id: 'L1', kind: 'low' },
      { id: 'L2', kind: 'low' },
    ],
    paytable: [
      { symbolId: 'H1', count: 3, payX100: 250 },
      { symbolId: 'H1', count: 4, payX100: 1000 },
      { symbolId: 'H1', count: 5, payX100: 5000 },
      { symbolId: 'H2', count: 3, payX100: 150 },
      { symbolId: 'H2', count: 4, payX100: 500 },
      { symbolId: 'H2', count: 5, payX100: 2000 },
      { symbolId: 'L1', count: 3, payX100: 50 },
      { symbolId: 'L1', count: 4, payX100: 100 },
      { symbolId: 'L1', count: 5, payX100: 400 },
      { symbolId: 'L2', count: 3, payX100: 30 },
      { symbolId: 'L2', count: 4, payX100: 80 },
      { symbolId: 'L2', count: 5, payX100: 300 },
      { symbolId: 'WILD', count: 3, payX100: 250 },
      { symbolId: 'WILD', count: 4, payX100: 1000 },
      { symbolId: 'WILD', count: 5, payX100: 5000 },
    ],
    reelSets: [
      {
        id: 'base',
        context: 'base',
        strips: [baseStrip(), baseStrip(), baseStrip(), baseStrip(), baseStrip()],
      },
    ],
    scatterTiers: [
      { tierId: 'feature', scatters: 3, roundsAwarded: 6, multiplier: 2, retriggerCap: 2 },
      { tierId: 'super_feature', scatters: 4, roundsAwarded: 10, multiplier: 3, retriggerCap: 2 },
      { tierId: 'ultimate_feature', scatters: 5, roundsAwarded: 12, multiplier: 5, retriggerCap: 1 },
    ],
    cascades: { enabled: true, maxSteps: 6 },
    ...overrides,
  };
}

/**
 * Config where EVERY reel position is H1 → every line pays 50x per spin, so
 * with a tiny cap (maxWinXBet 1) the max-win path triggers immediately.
 */
export function makeGuaranteedWinConfig(maxWinXBet = 1): GameConfig {
  return makeConfig({
    maxWinXBet,
    reelSets: [
      {
        id: 'base',
        context: 'base',
        strips: [[...H1_HEAVY], [...H1_HEAVY], [...H1_HEAVY], [...H1_HEAVY], [...H1_HEAVY]],
      },
    ],
    cascades: { enabled: false, maxSteps: 6 },
  });
}

export const PERMISSIVE_POLICY: JurisdictionPolicy = {
  jurisdictionId: 'TEST-PERMISSIVE',
  autoplayAllowed: true,
  autoplayMaxRounds: 100,
  quickSpinAllowed: true,
  turboSpinAllowed: true,
  slamStopAllowed: true,
  bonusBuyAllowed: true,
  minRoundDurationMs: 0,
  rtpDisplayRequired: false,
  realityCheckIntervalMs: null,
};

export const MIN_DURATION_POLICY: JurisdictionPolicy = {
  ...PERMISSIVE_POLICY,
  jurisdictionId: 'TEST-MIN-DURATION',
  minRoundDurationMs: 30_000,
};

/**
 * winPresentation — tier thresholds (CONVENTIONS §4.3 defaults), the LDW rule
 * (§9.5: win < stake never celebrated above `small`), and the floor-accurate
 * skippable count-up. Pure module: no browser, no pixi.
 */

import { describe, expect, test } from 'bun:test';
import {
  celebrationEventForTier,
  DEFAULT_WIN_TIER_THRESHOLDS,
  isLdw,
  resolveWinTier,
  WinCountUp,
  winTierThresholdsFromConfig,
  type WinTierContext,
} from '../src/presentation/winPresentation.js';
import { easings } from '../src/presentation/motionPlayer.js';

const BET = 100; // 1.00 in minor units

function ctx(totalWinMinor: number, capped = false, betMinor = BET): WinTierContext {
  return { totalWinMinor, betMinor, capped };
}

describe('resolveWinTier — default thresholds (win/totalBet)', () => {
  test('zero win → none', () => {
    expect(resolveWinTier(ctx(0))).toBe('none');
  });

  test('below 5x → small', () => {
    expect(resolveWinTier(ctx(BET))).toBe('small'); // exactly 1x
    expect(resolveWinTier(ctx(499))).toBe('small'); // 4.99x
  });

  test('boundaries are inclusive: 5x/15x/40x/80x', () => {
    expect(resolveWinTier(ctx(500))).toBe('medium');
    expect(resolveWinTier(ctx(1499))).toBe('medium');
    expect(resolveWinTier(ctx(1500))).toBe('big');
    expect(resolveWinTier(ctx(3999))).toBe('big');
    expect(resolveWinTier(ctx(4000))).toBe('mega');
    expect(resolveWinTier(ctx(7999))).toBe('mega');
    expect(resolveWinTier(ctx(8000))).toBe('epic');
  });

  test('max tier comes ONLY from the manifest capped flag', () => {
    expect(resolveWinTier(ctx(500_000))).toBe('epic'); // huge but uncapped
    expect(resolveWinTier(ctx(500_000, true))).toBe('max');
  });

  test('exact integer comparison holds for odd bet sizes', () => {
    // bet 33: 5x = 165 exactly; 164 must stay medium-1
    expect(resolveWinTier(ctx(165, false, 33))).toBe('medium');
    expect(resolveWinTier(ctx(164, false, 33))).toBe('small');
  });

  test('bet of zero is rejected', () => {
    expect(() => resolveWinTier(ctx(100, false, 0))).toThrow(RangeError);
  });
});

describe('LDW rule (§9.5)', () => {
  test('0 < win < stake is an LDW', () => {
    expect(isLdw(99, BET)).toBe(true);
    expect(isLdw(100, BET)).toBe(false);
    expect(isLdw(0, BET)).toBe(false);
  });

  test('LDW is never celebrated above small — even with absurd thresholds', () => {
    // Custom thresholds put `medium` at 0.5x: a 0.99x LDW must STILL be small.
    const thresholds = { mediumX100: 50, bigX100: 60, megaX100: 70, epicX100: 80 };
    expect(resolveWinTier(ctx(99), thresholds)).toBe('small');
    // …while a genuine ≥ 1x win may use the custom thresholds.
    expect(resolveWinTier(ctx(100), thresholds)).toBe('epic');
  });

  test('LDW celebration event is the plain count-up, never anim.win.big', () => {
    const tier = resolveWinTier(ctx(42)); // 0.42x LDW
    expect(tier).toBe('small');
    expect(celebrationEventForTier(tier)).toBe('anim.win.countup');
  });
});

describe('celebrationEventForTier', () => {
  test('maps every tier to a §4.3 event id (or null)', () => {
    expect(celebrationEventForTier('none')).toBeNull();
    expect(celebrationEventForTier('small')).toBe('anim.win.countup');
    expect(celebrationEventForTier('medium')).toBe('anim.win.countup');
    expect(celebrationEventForTier('big')).toBe('anim.win.big');
    expect(celebrationEventForTier('mega')).toBe('anim.win.big');
    expect(celebrationEventForTier('epic')).toBe('anim.win.big');
    expect(celebrationEventForTier('max')).toBe('anim.maxwin.reached');
  });
});

describe('winTierThresholdsFromConfig', () => {
  test('missing / malformed → defaults', () => {
    expect(winTierThresholdsFromConfig(undefined)).toEqual(DEFAULT_WIN_TIER_THRESHOLDS);
    expect(winTierThresholdsFromConfig('nope')).toEqual(DEFAULT_WIN_TIER_THRESHOLDS);
    expect(winTierThresholdsFromConfig({ mediumX100: -5 })).toEqual(DEFAULT_WIN_TIER_THRESHOLDS);
  });

  test('valid overrides are honored', () => {
    const raw = { mediumX100: 300, bigX100: 1000, megaX100: 3000, epicX100: 9000 };
    expect(winTierThresholdsFromConfig(raw)).toEqual(raw);
  });

  test('misordered thresholds fall back wholesale', () => {
    const raw = { mediumX100: 5000, bigX100: 1000, megaX100: 3000, epicX100: 9000 };
    expect(winTierThresholdsFromConfig(raw)).toEqual(DEFAULT_WIN_TIER_THRESHOLDS);
  });
});

describe('WinCountUp', () => {
  test('rolls up monotonically, never exceeding the total', () => {
    const countUp = new WinCountUp({ totalWinMinor: 12345, durationMs: 1000, easing: easings.linear });
    let previous = 0;
    for (let i = 0; i < 10; i++) {
      countUp.advance(50);
      const value = countUp.valueMinor;
      expect(Number.isSafeInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(previous);
      expect(value).toBeLessThanOrEqual(12345);
      previous = value;
    }
    expect(countUp.done).toBe(false);
    expect(previous).toBeLessThan(12345); // halfway — still counting
  });

  test('completion lands on the EXACT settled amount', () => {
    const countUp = new WinCountUp({ totalWinMinor: 9_999_999, durationMs: 700 });
    countUp.advance(699);
    countUp.advance(1);
    expect(countUp.done).toBe(true);
    expect(countUp.valueMinor).toBe(9_999_999);
  });

  test('skip jumps straight to the exact final value', () => {
    const countUp = new WinCountUp({ totalWinMinor: 555, durationMs: 5000 });
    countUp.advance(100);
    expect(countUp.valueMinor).toBeLessThan(555);
    expect(countUp.skip()).toBe(true);
    expect(countUp.done).toBe(true);
    expect(countUp.valueMinor).toBe(555);
  });

  test('skippable: false refuses the skip and keeps counting', () => {
    const countUp = new WinCountUp({ totalWinMinor: 555, durationMs: 5000, skippable: false });
    countUp.advance(100);
    const before = countUp.valueMinor;
    expect(countUp.skip()).toBe(false);
    expect(countUp.done).toBe(false);
    expect(countUp.valueMinor).toBe(before);
  });

  test('zero duration is instantly done at the final value', () => {
    const countUp = new WinCountUp({ totalWinMinor: 777, durationMs: 0 });
    expect(countUp.done).toBe(true);
    expect(countUp.valueMinor).toBe(777);
  });

  test('rejects non-integer totals and negative deltas', () => {
    expect(() => new WinCountUp({ totalWinMinor: 1.5, durationMs: 100 })).toThrow(RangeError);
    const countUp = new WinCountUp({ totalWinMinor: 100, durationMs: 100 });
    expect(() => countUp.advance(-1)).toThrow(RangeError);
  });
});

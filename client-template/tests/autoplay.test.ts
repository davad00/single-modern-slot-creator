import { describe, expect, test } from 'bun:test';
import { AutoplayController, type AutoplayConfig } from '../src/core/autoplay.js';
import type { OutcomeManifest, TierId } from '../src/core/types.js';
import { MOST_RESTRICTIVE_POLICY } from '../src/core/types.js';
import { PERMISSIVE_POLICY } from './fixtures.js';

const BET = 100;

/** Minimal manifest stub — autoplay only reads totalWinMinor/capped/feature. */
function manifestStub(totalWinMinor: number, opts: { capped?: boolean; tier?: TierId } = {}): OutcomeManifest {
  return {
    totalWinMinor,
    capped: opts.capped ?? false,
    feature: opts.tier
      ? {
          tierId: opts.tier,
          triggerScatterCount: 3,
          initialRoundsAwarded: 6,
          roundsAwarded: 6,
          roundsPlayed: 6,
          retriggerCount: 0,
          retriggerCap: 2,
          multiplier: 2,
          winMinor: totalWinMinor,
        }
      : null,
  } as OutcomeManifest;
}

function startedController(config: Partial<AutoplayConfig> = {}): AutoplayController {
  const controller = new AutoplayController(PERMISSIVE_POLICY);
  controller.start({ rounds: 10, ...config });
  return controller;
}

/** Runs one full round through the controller and returns the stop reason. */
function playRound(controller: AutoplayController, manifest: OutcomeManifest, balanceAfterMinor = 100_000) {
  controller.beginRound(BET);
  return controller.completeRound({ manifest, balanceAfterMinor });
}

describe('start validation (finite counts, jurisdiction gate)', () => {
  test('rejects when jurisdiction forbids autoplay (most restrictive default)', () => {
    const controller = new AutoplayController(MOST_RESTRICTIVE_POLICY);
    expect(() => controller.start({ rounds: 10 })).toThrow(/not permitted/);
  });

  test('rejects infinite/zero/negative/fractional round counts', () => {
    const controller = new AutoplayController(PERMISSIVE_POLICY);
    for (const rounds of [Number.POSITIVE_INFINITY, 0, -5, 2.5, Number.NaN]) {
      expect(() => controller.start({ rounds })).toThrow(RangeError);
    }
  });

  test('rejects counts above the jurisdiction cap', () => {
    const controller = new AutoplayController(PERMISSIVE_POLICY);
    expect(() => controller.start({ rounds: PERMISSIVE_POLICY.autoplayMaxRounds + 1 })).toThrow(RangeError);
  });
});

describe('stop conditions', () => {
  test('completed: stops after exactly the requested finite count', () => {
    const controller = startedController({ rounds: 3 });
    expect(playRound(controller, manifestStub(0))).toBeNull();
    expect(playRound(controller, manifestStub(0))).toBeNull();
    expect(playRound(controller, manifestStub(0))).toBe('completed');
    expect(controller.getState().active).toBe(false);
    expect(controller.getState().roundsCompleted).toBe(3);
  });

  test.each([
    ['feature', 'feature_triggered'],
    ['super_feature', 'super_feature_triggered'],
    ['ultimate_feature', 'ultimate_feature_triggered'],
  ] as const)('%s trigger stops autoplay', (tier, reason) => {
    const controller = startedController();
    expect(playRound(controller, manifestStub(500, { tier }))).toBe(reason);
    expect(controller.getState().stopReason).toBe(reason);
  });

  test('win threshold (single-round win)', () => {
    const controller = startedController({ winThresholdMinor: 1000 });
    expect(playRound(controller, manifestStub(999))).toBeNull();
    expect(playRound(controller, manifestStub(1000))).toBe('win_threshold');
  });

  test('loss threshold (cumulative bets − wins)', () => {
    const controller = startedController({ lossLimitMinor: 250 });
    expect(playRound(controller, manifestStub(0))).toBeNull(); // loss 100
    expect(playRound(controller, manifestStub(0))).toBeNull(); // loss 200
    expect(playRound(controller, manifestStub(0))).toBe('loss_threshold'); // loss 300 ≥ 250
  });

  test('profit threshold (cumulative wins − bets)', () => {
    const controller = startedController({ profitThresholdMinor: 300 });
    expect(playRound(controller, manifestStub(250))).toBeNull(); // profit 150
    expect(playRound(controller, manifestStub(350))).toBe('profit_threshold'); // profit 400 ≥ 300
  });

  test('balance floor', () => {
    const controller = startedController({ balanceFloorMinor: 500 });
    expect(playRound(controller, manifestStub(0), 600)).toBeNull();
    expect(playRound(controller, manifestStub(0), 499)).toBe('balance_floor');
  });

  test('insufficient balance blocks the next spin', () => {
    const controller = startedController();
    expect(controller.shouldSpin(BET, 99)).toBe(false);
    expect(controller.getState().stopReason).toBe('insufficient_balance');
  });

  test('max win stops autoplay', () => {
    const controller = startedController();
    expect(playRound(controller, manifestStub(500_000, { capped: true }))).toBe('max_win');
  });

  test('network error, game error, RG interruption, reality check, bet change', () => {
    const cases = [
      ['notifyNetworkError', 'network_error'],
      ['notifyGameError', 'game_error'],
      ['notifyRgInterruption', 'rg_interruption'],
      ['notifyRealityCheck', 'reality_check'],
      ['notifyBetChanged', 'bet_changed'],
    ] as const;
    for (const [method, reason] of cases) {
      const controller = startedController();
      controller[method]();
      expect(controller.getState().active).toBe(false);
      expect(controller.getState().stopReason).toBe(reason);
      expect(controller.shouldSpin(BET, 100_000)).toBe(false);
    }
  });

  test('user stop is immediate', () => {
    const controller = startedController();
    controller.stop();
    expect(controller.getState().active).toBe(false);
    expect(controller.getState().stopReason).toBe('user_stop');
  });

  test('interruption mid-round still settles the round but does not continue', () => {
    const controller = startedController();
    controller.beginRound(BET);
    controller.notifyRgInterruption(); // e.g. RG popup while reels spin
    expect(controller.completeRound({ manifest: manifestStub(0), balanceAfterMinor: 1000 })).toBe('rg_interruption');
    expect(controller.shouldSpin(BET, 100_000)).toBe(false);
  });

  test('feature stop precedence over thresholds, max win over feature', () => {
    const c1 = startedController({ winThresholdMinor: 1 });
    expect(playRound(c1, manifestStub(5000, { tier: 'feature' }))).toBe('feature_triggered');
    const c2 = startedController();
    expect(playRound(c2, manifestStub(500_000, { capped: true, tier: 'ultimate_feature' }))).toBe('max_win');
  });
});

describe('round-flow safety', () => {
  test('no overlapping rounds: beginRound while in flight throws', () => {
    const controller = startedController();
    controller.beginRound(BET);
    expect(() => controller.beginRound(BET)).toThrow(/overlapping/);
  });

  test('completeRound without beginRound throws', () => {
    const controller = startedController();
    expect(() => controller.completeRound({ manifest: manifestStub(0), balanceAfterMinor: 0 })).toThrow(
      /without beginRound/,
    );
  });

  test('shouldSpin is false while a round is in flight (no wager queue)', () => {
    const controller = startedController();
    expect(controller.shouldSpin(BET, 100_000)).toBe(true);
    controller.beginRound(BET);
    expect(controller.shouldSpin(BET, 100_000)).toBe(false);
  });

  test('restart requires a fresh start() and resets counters', () => {
    const controller = startedController({ rounds: 1 });
    playRound(controller, manifestStub(0));
    expect(() => controller.beginRound(BET)).toThrow(/not active/);
    controller.start({ rounds: 2 });
    const state = controller.getState();
    expect(state.roundsCompleted).toBe(0);
    expect(state.roundsRemaining).toBe(2);
    expect(state.stopReason).toBeNull();
  });
});

describe('HUD state exposure', () => {
  test('exposes progress and cumulative figures', () => {
    const controller = startedController({ rounds: 5 });
    playRound(controller, manifestStub(40));
    playRound(controller, manifestStub(0));
    const state = controller.getState();
    expect(state).toEqual({
      active: true,
      roundInFlight: false,
      roundsRequested: 5,
      roundsCompleted: 2,
      roundsRemaining: 3,
      cumulativeBetMinor: 200,
      cumulativeWinMinor: 40,
      stopReason: null,
    });
  });
});

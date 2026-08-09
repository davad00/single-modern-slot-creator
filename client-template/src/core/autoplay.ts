/**
 * Autoplay controller — finite counts only, full stop-condition set.
 *
 * Responsible-gaming rules (prompt §7 Autoplay + CONVENTIONS §9.6):
 *   - finite round count, jurisdiction-capped; no infinite autoplay default
 *   - no unbounded queue of pending wagers; NO overlapping rounds
 *   - stops on: feature/super/ultimate trigger, win threshold, loss threshold,
 *     profit threshold, balance floor, insufficient balance, network error,
 *     game error, RG interruption, reality check, bet change, max win,
 *     user stop, completion
 *
 * Pure logic: the round loop calls beginRound()/completeRound(); the HUD reads
 * getState(). No timers, no DOM.
 */

import type { JurisdictionPolicy, OutcomeManifest } from './types.js';
import { assertMinor, assertPositiveInt } from './money.js';

export type AutoplayStopReason =
  | 'completed'
  | 'user_stop'
  | 'feature_triggered'
  | 'super_feature_triggered'
  | 'ultimate_feature_triggered'
  | 'win_threshold'
  | 'loss_threshold'
  | 'profit_threshold'
  | 'balance_floor'
  | 'insufficient_balance'
  | 'network_error'
  | 'game_error'
  | 'rg_interruption'
  | 'reality_check'
  | 'bet_changed'
  | 'max_win';

export interface AutoplayConfig {
  /** Finite round count. Infinity/NaN/0 are rejected. */
  rounds: number;
  /** Stop when a single round's win reaches this (minor units). */
  winThresholdMinor?: number;
  /** Stop when cumulative session loss (bets − wins) reaches this. */
  lossLimitMinor?: number;
  /** Stop when cumulative session profit (wins − bets) reaches this. */
  profitThresholdMinor?: number;
  /** Stop when balance after a round falls below this floor. */
  balanceFloorMinor?: number;
  /** Stop on any feature trigger. Default true (most restrictive). */
  stopOnFeature?: boolean;
}

export interface AutoplayRoundResult {
  manifest: OutcomeManifest;
  balanceAfterMinor: number;
}

/** HUD-facing snapshot. */
export interface AutoplayState {
  active: boolean;
  roundInFlight: boolean;
  roundsRequested: number;
  roundsCompleted: number;
  roundsRemaining: number;
  cumulativeBetMinor: number;
  cumulativeWinMinor: number;
  stopReason: AutoplayStopReason | null;
}

const TIER_STOP_REASON = {
  feature: 'feature_triggered',
  super_feature: 'super_feature_triggered',
  ultimate_feature: 'ultimate_feature_triggered',
} as const;

export class AutoplayController {
  private active = false;
  private roundInFlight = false;
  private roundsRequested = 0;
  private roundsCompleted = 0;
  private cumulativeBetMinor = 0;
  private cumulativeWinMinor = 0;
  private stopReason: AutoplayStopReason | null = null;
  private config: Required<Pick<AutoplayConfig, 'rounds' | 'stopOnFeature'>> & AutoplayConfig = {
    rounds: 0,
    stopOnFeature: true,
  };

  constructor(private readonly policy: JurisdictionPolicy) {}

  /**
   * Arm autoplay. Throws when the jurisdiction forbids it, the count is not a
   * finite positive integer, or it exceeds the jurisdiction cap.
   */
  start(config: AutoplayConfig): void {
    if (!this.policy.autoplayAllowed || this.policy.autoplayMaxRounds <= 0) {
      throw new Error(`autoplay is not permitted in jurisdiction "${this.policy.jurisdictionId}"`);
    }
    assertPositiveInt(config.rounds, 'autoplay rounds'); // rejects Infinity/NaN/0
    if (config.rounds > this.policy.autoplayMaxRounds) {
      throw new RangeError(
        `autoplay rounds ${config.rounds} exceeds jurisdiction cap ${this.policy.autoplayMaxRounds}`,
      );
    }
    for (const key of ['winThresholdMinor', 'lossLimitMinor', 'profitThresholdMinor', 'balanceFloorMinor'] as const) {
      const v = config[key];
      if (v !== undefined) assertMinor(v, key);
    }
    if (this.active) throw new Error('autoplay already active');
    this.config = { stopOnFeature: true, ...config };
    this.active = true;
    this.roundInFlight = false;
    this.roundsRequested = config.rounds;
    this.roundsCompleted = 0;
    this.cumulativeBetMinor = 0;
    this.cumulativeWinMinor = 0;
    this.stopReason = null;
  }

  /** Immediate stop (user pressed stop, or a controller noticed a condition). */
  stop(reason: AutoplayStopReason = 'user_stop'): void {
    if (!this.active) return;
    this.active = false;
    this.stopReason = reason;
  }

  /** True when the loop may place the next wager. */
  shouldSpin(betMinor: number, balanceMinor: number): boolean {
    if (!this.active || this.roundInFlight) return false;
    if (this.roundsCompleted >= this.roundsRequested) {
      this.stop('completed');
      return false;
    }
    if (balanceMinor < betMinor) {
      this.stop('insufficient_balance');
      return false;
    }
    return true;
  }

  /**
   * Mark a wager as placed. Enforces "no overlapping rounds": throws when a
   * round is already in flight.
   */
  beginRound(betMinor: number): void {
    assertMinor(betMinor, 'betMinor');
    if (!this.active) throw new Error('autoplay not active');
    if (this.roundInFlight) throw new Error('round already in flight — overlapping autoplay rounds are forbidden');
    this.roundInFlight = true;
    this.cumulativeBetMinor += betMinor;
  }

  /**
   * Feed the settled round back. Evaluates every stop condition in a fixed
   * precedence order and returns the reason autoplay stopped, or null when it
   * continues. (Deterministic: same inputs ⇒ same decision.)
   */
  completeRound(result: AutoplayRoundResult): AutoplayStopReason | null {
    if (!this.roundInFlight) throw new Error('completeRound without beginRound');
    this.roundInFlight = false;
    this.roundsCompleted += 1;
    this.cumulativeWinMinor += result.manifest.totalWinMinor;

    if (!this.active) return this.stopReason; // stopped mid-round (user/RG/error)

    const c = this.config;
    const decide = (): AutoplayStopReason | null => {
      if (result.manifest.capped) return 'max_win';
      if (c.stopOnFeature && result.manifest.feature) return TIER_STOP_REASON[result.manifest.feature.tierId];
      if (c.winThresholdMinor !== undefined && result.manifest.totalWinMinor >= c.winThresholdMinor)
        return 'win_threshold';
      const loss = this.cumulativeBetMinor - this.cumulativeWinMinor;
      if (c.lossLimitMinor !== undefined && loss >= c.lossLimitMinor) return 'loss_threshold';
      const profit = this.cumulativeWinMinor - this.cumulativeBetMinor;
      if (c.profitThresholdMinor !== undefined && profit >= c.profitThresholdMinor) return 'profit_threshold';
      if (c.balanceFloorMinor !== undefined && result.balanceAfterMinor < c.balanceFloorMinor) return 'balance_floor';
      if (this.roundsCompleted >= this.roundsRequested) return 'completed';
      return null;
    };

    const reason = decide();
    if (reason !== null) this.stop(reason);
    return reason;
  }

  // External interruptions — all stop autoplay immediately.
  notifyNetworkError(): void {
    this.stop('network_error');
  }
  notifyGameError(): void {
    this.stop('game_error');
  }
  notifyRgInterruption(): void {
    this.stop('rg_interruption');
  }
  notifyRealityCheck(): void {
    this.stop('reality_check');
  }
  notifyBetChanged(): void {
    this.stop('bet_changed');
  }

  /** HUD snapshot (clear active-state display requirement). */
  getState(): AutoplayState {
    return {
      active: this.active,
      roundInFlight: this.roundInFlight,
      roundsRequested: this.roundsRequested,
      roundsCompleted: this.roundsCompleted,
      roundsRemaining: this.active ? this.roundsRequested - this.roundsCompleted : 0,
      cumulativeBetMinor: this.cumulativeBetMinor,
      cumulativeWinMinor: this.cumulativeWinMinor,
      stopReason: this.stopReason,
    };
  }
}

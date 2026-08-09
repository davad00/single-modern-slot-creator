/**
 * Win presentation — tier resolution + count-up.
 *
 * PURE presentation logic (no PixiJS/DOM): the settled amounts come from the
 * committed OutcomeManifest and are NEVER recomputed here (§9.2). This module
 * only decides how loudly to celebrate and how the display number rolls up.
 *
 * Tier thresholds (CONVENTIONS §4.3, win/totalBet):
 *   small < 5x, medium ≥ 5x, big ≥ 15x, mega ≥ 40x, epic ≥ 80x,
 *   max = maximumWinXBet reached (manifest.capped).
 * Thresholds are configurable via spin-presentation.json; stored here as
 * integer hundredths of a bet so tier resolution is exact integer math.
 *
 * LDW rule (§9.5): a win below the stake is a Loss Disguised as a Win and is
 * NEVER celebrated above the `small` tier — regardless of configured
 * thresholds.
 */

import { assertMinor } from '../core/money.js';
import { easings, type EasingFn } from './motionPlayer.js';

// ---------------------------------------------------------------------------
// Tier resolution
// ---------------------------------------------------------------------------

export const WIN_TIERS = ['none', 'small', 'medium', 'big', 'mega', 'epic', 'max'] as const;

export type WinTier = (typeof WIN_TIERS)[number];

/** x-bet thresholds as integer hundredths of a bet (5x → 500). */
export interface WinTierThresholds {
  mediumX100: number;
  bigX100: number;
  megaX100: number;
  epicX100: number;
}

export const DEFAULT_WIN_TIER_THRESHOLDS: WinTierThresholds = {
  mediumX100: 500,
  bigX100: 1500,
  megaX100: 4000,
  epicX100: 8000,
};

/**
 * Tolerant reader for the `winTiers` block of spin-presentation.json.
 * Missing/malformed fields fall back to the CONVENTIONS defaults, and the
 * ordering medium ≤ big ≤ mega ≤ epic is enforced (misordered configs fall
 * back wholesale rather than misclassifying wins).
 */
export function winTierThresholdsFromConfig(raw: unknown): WinTierThresholds {
  const defaults = DEFAULT_WIN_TIER_THRESHOLDS;
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return { ...defaults };
  const obj = raw as Record<string, unknown>;
  const read = (key: keyof WinTierThresholds): number => {
    const v = obj[key];
    return typeof v === 'number' && Number.isSafeInteger(v) && v > 0 ? v : defaults[key];
  };
  const t: WinTierThresholds = {
    mediumX100: read('mediumX100'),
    bigX100: read('bigX100'),
    megaX100: read('megaX100'),
    epicX100: read('epicX100'),
  };
  if (!(t.mediumX100 <= t.bigX100 && t.bigX100 <= t.megaX100 && t.megaX100 <= t.epicX100)) {
    return { ...defaults };
  }
  return t;
}

export interface WinTierContext {
  /** Authoritative settled win (manifest.totalWinMinor) — display data only. */
  totalWinMinor: number;
  /** Total bet for the round (manifest.betMinor). */
  betMinor: number;
  /** True iff the round hit the max-win cap (manifest.capped). */
  capped: boolean;
}

/** True when the win is a Loss Disguised as a Win (0 < win < stake). */
export function isLdw(totalWinMinor: number, betMinor: number): boolean {
  return totalWinMinor > 0 && totalWinMinor < betMinor;
}

/**
 * Resolve the celebration tier. Exact integer comparison:
 * win/bet ≥ threshold ⇔ 100·winMinor ≥ thresholdX100·betMinor (BigInt-safe).
 */
export function resolveWinTier(
  ctx: WinTierContext,
  thresholds: WinTierThresholds = DEFAULT_WIN_TIER_THRESHOLDS,
): WinTier {
  assertMinor(ctx.totalWinMinor, 'totalWinMinor');
  assertMinor(ctx.betMinor, 'betMinor');
  if (ctx.betMinor === 0) throw new RangeError('betMinor must be > 0');

  if (ctx.totalWinMinor === 0) return 'none';
  if (ctx.capped) return 'max';
  // LDW rule (§9.5): win < stake is never celebrated above `small`,
  // no matter what the configured thresholds say.
  if (ctx.totalWinMinor < ctx.betMinor) return 'small';

  const win100 = 100n * BigInt(ctx.totalWinMinor);
  const bet = BigInt(ctx.betMinor);
  const atLeast = (thresholdX100: number): boolean => win100 >= BigInt(thresholdX100) * bet;

  if (atLeast(thresholds.epicX100)) return 'epic';
  if (atLeast(thresholds.megaX100)) return 'mega';
  if (atLeast(thresholds.bigX100)) return 'big';
  if (atLeast(thresholds.mediumX100)) return 'medium';
  return 'small';
}

/** Animation event id (§4.3) that celebrates a given tier. */
export function celebrationEventForTier(tier: WinTier): string | null {
  switch (tier) {
    case 'none':
      return null;
    case 'small':
    case 'medium':
      return 'anim.win.countup';
    case 'big':
    case 'mega':
    case 'epic':
      return 'anim.win.big';
    case 'max':
      return 'anim.maxwin.reached';
  }
}

// ---------------------------------------------------------------------------
// Count-up
// ---------------------------------------------------------------------------

export interface WinCountUpOptions {
  /** Final value — the authoritative settled amount, minor units. */
  totalWinMinor: number;
  /** Roll-up duration, ms (0 ⇒ instantly done at the final value). */
  durationMs: number;
  /** Display easing. Default easeOutCubic. */
  easing?: EasingFn;
  /** Whether skip() is honored. Default true. */
  skippable?: boolean;
}

/**
 * Deterministic display count-up. Driven by advance(dtMs) from the frame
 * clock. Guarantees:
 *   - value is a non-negative integer ≤ totalWinMinor at all times
 *   - value is monotonically non-decreasing
 *   - once done (elapsed ≥ duration, or skipped), value === totalWinMinor
 *     EXACTLY — the floor-accurate final value, never a float artifact.
 */
export class WinCountUp {
  private readonly totalMinor: number;
  private readonly durationMs: number;
  private readonly easing: EasingFn;
  readonly skippable: boolean;
  private elapsedMs = 0;
  private shown = 0;
  private skipped = false;

  constructor(options: WinCountUpOptions) {
    assertMinor(options.totalWinMinor, 'totalWinMinor');
    if (!Number.isFinite(options.durationMs) || options.durationMs < 0) {
      throw new RangeError('durationMs must be ≥ 0');
    }
    this.totalMinor = options.totalWinMinor;
    this.durationMs = options.durationMs;
    this.easing = options.easing ?? easings.easeOutCubic;
    this.skippable = options.skippable ?? true;
  }

  advance(dtMs: number): void {
    if (!Number.isFinite(dtMs) || dtMs < 0) throw new RangeError('advance(dt): dt must be ≥ 0');
    if (this.done) return;
    this.elapsedMs += dtMs;
    this.shown = Math.max(this.shown, this.interpolated());
  }

  /** Jump straight to the final value. Honors `skippable`; returns success. */
  skip(): boolean {
    if (!this.skippable) return false;
    this.skipped = true;
    return true;
  }

  get done(): boolean {
    return this.skipped || this.elapsedMs >= this.durationMs;
  }

  /** Current display value, integer minor units. Exact final once done. */
  get valueMinor(): number {
    if (this.done) return this.totalMinor;
    return this.shown;
  }

  private interpolated(): number {
    if (this.durationMs <= 0 || this.elapsedMs >= this.durationMs) return this.totalMinor;
    const p = this.easing(this.elapsedMs / this.durationMs);
    const clamped = p <= 0 ? 0 : p >= 1 ? 1 : p;
    // Display interpolation may use floats (this is presentation only —
    // settlement never reads this class); floor + clamp keeps it an integer
    // that can never exceed the authoritative total.
    return Math.min(this.totalMinor, Math.floor(this.totalMinor * clamped));
  }
}

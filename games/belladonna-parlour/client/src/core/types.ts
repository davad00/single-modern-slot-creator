/**
 * Core domain types — CONVENTIONS §4, §5, §7.
 *
 * Pure type declarations: zero DOM / PixiJS / Bun dependency.
 * The OutcomeManifest is the server-authoritative round contract: the client is
 * a PURE RENDERER of the manifest. Skipping / quick / turbo NEVER change any
 * value inside it (design rule §9.2).
 */

// ---------------------------------------------------------------------------
// Feature tiers — CONVENTIONS §4.1. Internal ids are NEVER renamed; public
// labels are themed per game.
// ---------------------------------------------------------------------------

export type TierId = 'feature' | 'super_feature' | 'ultimate_feature';

export const TIER_IDS: readonly TierId[] = ['feature', 'super_feature', 'ultimate_feature'];

// ---------------------------------------------------------------------------
// Spin presentation modes — presentation ONLY, never math (§9.2).
// ---------------------------------------------------------------------------

export type SpinMode = 'normal' | 'quick' | 'turbo';

export const SPIN_MODES: readonly SpinMode[] = ['normal', 'quick', 'turbo'];

// ---------------------------------------------------------------------------
// Outcome manifest — CONVENTIONS §7.
// ---------------------------------------------------------------------------

export type StepType =
  | 'initial_result'
  | 'cascade'
  | 'respin'
  | 'feature_round'
  | 'feature_trigger'
  | 'feature_retrigger'
  | 'feature_upgrade'
  | 'jackpot_award'
  | 'max_win_termination'
  | 'settlement';

export const STEP_TYPES: readonly StepType[] = [
  'initial_result',
  'cascade',
  'respin',
  'feature_round',
  'feature_trigger',
  'feature_retrigger',
  'feature_upgrade',
  'jackpot_award',
  'max_win_termination',
  'settlement',
];

/** Grid position as [columnIndex, rowIndex] (grid itself is columns-major). */
export type GridPosition = readonly [number, number];

/** One evaluated win inside a step. All money in integer minor units. */
export interface Win {
  /** Payline index for line games; omitted for ways/cluster/scatter wins. */
  lineId?: number;
  /** Paying symbol id (§4.2 pattern). */
  symbolId: string;
  /** Number of matched symbols. */
  count: number;
  /** Pay as integer hundredths of a bet (2.5x → 250). */
  payX100: number;
  /**
   * Settled amount: winMinor(betMinor, payX100, step.multiplier).
   * Redundant with the formula on purpose — validation cross-checks it.
   */
  winMinor: number;
  /** Winning cell positions, [col, row], columns-major grid coordinates. */
  positions: GridPosition[];
}

/** One ordered presentation/settlement step of a round. */
export interface Step {
  /** `step-<n>`, n starting at 1, strictly sequential. */
  stepId: string;
  type: StepType;
  /** Columns-major grid of symbol ids: grid[column][row]. */
  grid: string[][];
  wins: Win[];
  /** Scatters visible on this step's grid (counting rule per game config). */
  scatterCount: number;
  /** Integer win multiplier active for this step (≥ 1). */
  multiplier: number;
  /** Presentation hint event ids (§4.3), e.g. `anim.reel.stop`. */
  events: string[];
}

/** Feature summary block attached to manifests that triggered a bonus. */
export interface FeatureBlock {
  tierId: TierId;
  /** Scatter count that triggered the feature (3 / 4 / 5+). */
  triggerScatterCount: number;
  /** Rounds awarded at feature entry, before any retriggers (wire `initialRounds`). */
  initialRoundsAwarded: number;
  /** Total rounds awarded including retriggers. */
  roundsAwarded: number;
  roundsPlayed: number;
  retriggerCount: number;
  retriggerCap: number;
  /** Integer multiplier applied to feature-round wins (tier-distinct). */
  multiplier: number;
  /** Total won inside the feature, minor units. */
  winMinor: number;
}

/**
 * Server-authoritative outcome manifest. Round = ordered steps[].
 * Recovery = re-fetch committed manifest + resumePointer (a stepId) and seek
 * presentation there instantly — never re-request, never re-settle.
 */
export interface OutcomeManifest {
  manifestVersion: string;
  /** `rnd_<...>` per CONVENTIONS §10. */
  roundId: string;
  gameVersion: string;
  mathVersion: string;
  /** Wager for the round, integer minor units. */
  betMinor: number;
  /** ISO-4217 code. */
  currency: string;
  /** Authoritative total win, minor units. Equals cap when `capped`. */
  totalWinMinor: number;
  /** Balance after settlement when the server provides it. */
  balanceAfterMinor?: number;
  /** betMinor * maxWinXBet — the enforced liability bound (§9.4). */
  maxWinCapMinor: number;
  /** True iff the round terminated via a `max_win_termination` step. */
  capped: boolean;
  steps: Step[];
  feature: FeatureBlock | null;
  /** Present on recovery fetches: stepId to resume presentation at. */
  resumePointer?: string;
  /**
   * Detached JWS / HMAC over the manifest bytes minus this field.
   * Dev provider emits a clearly fake placeholder; production verification is
   * the RGS adapter's responsibility (see rgsAdapter.ts).
   */
  signature?: string;
}

// ---------------------------------------------------------------------------
// Game config subset needed by the deterministic core.
// The full config files are schema-validated (schemas/*.schema.json);
// configLoader.ts performs lightweight structural validation into these types.
// ---------------------------------------------------------------------------

export type SymbolKind = 'wild' | 'scatter' | 'premium' | 'low' | 'special';

export interface SymbolConfig {
  /** §4.2 pattern `^[A-Z][A-Z0-9_]{0,15}$` (WILD, SCATTER, H1.., L1..). */
  id: string;
  kind: SymbolKind;
}

export interface PaytableEntry {
  symbolId: string;
  count: number;
  /** Integer hundredths of a bet. */
  payX100: number;
}

export type ReelContext = 'base' | TierId;

export interface ReelSetConfig {
  id: string;
  context: ReelContext;
  /** One strip per column: strips[column] = symbol ids in strip order. */
  strips: string[][];
}

export interface ScatterTierConfig {
  tierId: TierId;
  /** Scatter count that maps to this tier (3, 4, 5 — 5 means 5+). */
  scatters: number;
  roundsAwarded: number;
  /** Integer feature multiplier — must be tier-distinct (§9.3). */
  multiplier: number;
  /** Hard retrigger cap (no infinite loops, §9.4). */
  retriggerCap: number;
}

export interface CascadeConfig {
  enabled: boolean;
  /** Hard cascade cap with proven termination (§9.4). */
  maxSteps: number;
}

/** Subset of config/game-config.json the core needs. */
export interface GameConfig {
  projectSlug: string;
  gameVersion: string;
  mathVersion: string;
  currency: string;
  columns: number;
  rows: number;
  /** Paylines: lines[i][column] = row index. */
  lines: number[][];
  minBetMinor: number;
  maxBetMinor: number;
  maxWinXBet: number;
  /** Fraction, e.g. 0.96. */
  rtpTarget: number;
  symbols: SymbolConfig[];
  paytable: PaytableEntry[];
  reelSets: ReelSetConfig[];
  scatterTiers: ScatterTierConfig[];
  cascades: CascadeConfig;
}

// ---------------------------------------------------------------------------
// Jurisdiction policy — §9.6. UNKNOWN jurisdiction ⇒ most restrictive default.
// ---------------------------------------------------------------------------

export interface JurisdictionPolicy {
  jurisdictionId: string;
  autoplayAllowed: boolean;
  /** 0 when autoplay disallowed. Finite counts only — never Infinity. */
  autoplayMaxRounds: number;
  quickSpinAllowed: boolean;
  turboSpinAllowed: boolean;
  /** Slam stop = player may stop reels early after outcome commit. */
  slamStopAllowed: boolean;
  bonusBuyAllowed: boolean;
  /** Presentation floor per round, ms (0 = none). Presentation only. */
  minRoundDurationMs: number;
  rtpDisplayRequired: boolean;
  /** ms between reality checks; null = none mandated. */
  realityCheckIntervalMs: number | null;
}

/** Default when jurisdiction is unknown: the most restrictive gate set. */
export const MOST_RESTRICTIVE_POLICY: JurisdictionPolicy = {
  jurisdictionId: 'UNKNOWN',
  autoplayAllowed: false,
  autoplayMaxRounds: 0,
  quickSpinAllowed: false,
  turboSpinAllowed: false,
  slamStopAllowed: false,
  bonusBuyAllowed: false,
  minRoundDurationMs: 3000,
  rtpDisplayRequired: true,
  realityCheckIntervalMs: 3_600_000,
};

// ---------------------------------------------------------------------------
// Shared id patterns (§4.2, §10).
// ---------------------------------------------------------------------------

export const SYMBOL_ID_PATTERN = /^[A-Z][A-Z0-9_]{0,15}$/;
export const ROUND_ID_PATTERN = /^rnd_[A-Za-z0-9_-]{6,}$/;
export const STEP_ID_PATTERN = /^step-[1-9][0-9]*$/;

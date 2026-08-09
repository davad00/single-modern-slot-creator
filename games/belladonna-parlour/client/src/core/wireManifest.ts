/**
 * Wire-format serialization of the outcome manifest —
 * `schemas/outcome-manifest.schema.json` (the server-authoritative contract).
 *
 * The internal `OutcomeManifest` (types.ts) is the dev/runtime shape: it
 * carries derived convenience fields the schema forbids (`Win.count`,
 * `maxWinCapMinor`) and integer step multipliers. `toWireManifest` maps it to
 * the exact schema shape:
 *
 *   - `multiplier` (integer, ≥1)      → `multiplier100` (x100 fixed point)
 *   - `Win.count` is dropped           (schema: additionalProperties false)
 *   - base-round steps stay in `steps`; `feature_round` / `feature_retrigger`
 *     steps move under `feature.steps` — stepIds keep their manifest-global,
 *     strictly ascending numbering (schema §steps description)
 *   - `feature: null`                  → `{ triggered: false }`
 *   - `capped`                         → `maximumWinReached` / `feature.maxWinReached`
 *
 * Identity fields the core does not own (`gameId`, `mathProfileId`,
 * `configHash`) are supplied via `WireManifestMeta`; `wireMetaFromConfig`
 * derives dev defaults from a `GameConfig`.
 */

import type { GameConfig, OutcomeManifest, Step, StepType, TierId, Win } from './types.js';

// -- wire types (mirror the JSON Schema; keep in sync with the schema file) --

export interface WireWin {
  symbolId: string;
  positions: number[][];
  payX100: number;
  winMinor: number;
  lineId?: number;
}

export interface WireStep {
  stepId: string;
  type: StepType;
  grid: string[][];
  wins: WireWin[];
  scatterCount: number;
  /** Win multiplier, x100 fixed point (100 = 1x). */
  multiplier100: number;
  events: string[];
}

export interface WireFeature {
  triggered: boolean;
  tier?: TierId;
  initialRounds?: number;
  remainingRounds?: number;
  steps?: WireStep[];
  retriggers?: number;
  maxWinReached?: boolean;
}

export interface WireOutcomeManifest {
  schemaVersion: string;
  roundId: string;
  gameId: string;
  gameVersion: string;
  mathVersion: string;
  mathProfileId: string;
  configHash: string;
  currency: string;
  wagerMinor: number;
  initialGrid: string[][];
  steps: WireStep[];
  feature: WireFeature;
  totalWinMinor: number;
  maximumWinReached: boolean;
  balanceAfterMinor?: number;
  roundComplete: boolean;
  resumePointer?: string;
  signature: string;
}

/** Identity fields owned by the game package / server, not the core. */
export interface WireManifestMeta {
  gameId: string;
  mathProfileId: string;
  /** `sha256:<64 hex>` over the canonical config concatenation (CONVENTIONS §5). */
  configHash: string;
}

/**
 * Clearly-fake dev placeholder: the template has no `config/*.json` bundle to
 * hash yet. Real games stamp the sha256 of the canonical config concatenation
 * (CONVENTIONS §5); production manifests come from the RGS with the real hash.
 */
export const DEV_PLACEHOLDER_CONFIG_HASH = `sha256:${'0'.repeat(64)}`;

/** Dev-default meta derived from a GameConfig (e.g. rtpTarget 0.96 → `rtp-96`). */
export function wireMetaFromConfig(config: GameConfig, configHash = DEV_PLACEHOLDER_CONFIG_HASH): WireManifestMeta {
  return {
    gameId: config.projectSlug,
    mathProfileId: `rtp-${Math.round(config.rtpTarget * 100)}`,
    configHash,
  };
}

const FEATURE_STEP_TYPES: ReadonlySet<StepType> = new Set(['feature_round', 'feature_retrigger']);

function toWireWin(win: Win): WireWin {
  const wire: WireWin = {
    symbolId: win.symbolId,
    positions: win.positions.map(([col, row]) => [col, row]),
    payX100: win.payX100,
    winMinor: win.winMinor,
  };
  if (win.lineId !== undefined) wire.lineId = win.lineId;
  return wire;
}

function toWireStep(step: Step): WireStep {
  return {
    stepId: step.stepId,
    type: step.type,
    grid: step.grid.map((column) => [...column]),
    wins: step.wins.map(toWireWin),
    scatterCount: step.scatterCount,
    multiplier100: step.multiplier * 100,
    events: [...step.events],
  };
}

/**
 * Map an internal (validated) manifest to the exact wire shape of
 * `schemas/outcome-manifest.schema.json`. Pure; never mutates the input.
 */
export function toWireManifest(manifest: OutcomeManifest, meta: WireManifestMeta): WireOutcomeManifest {
  const baseSteps = manifest.steps.filter((s) => !FEATURE_STEP_TYPES.has(s.type));
  const featureSteps = manifest.steps.filter((s) => FEATURE_STEP_TYPES.has(s.type));
  if (featureSteps.length > 0 && manifest.feature === null) {
    throw new Error('manifest has feature steps but no feature block');
  }
  const initialGrid = manifest.steps[0]?.grid;
  if (!initialGrid) throw new Error('manifest has no steps');

  const feature: WireFeature = manifest.feature
    ? {
        triggered: true,
        tier: manifest.feature.tierId,
        initialRounds: manifest.feature.initialRoundsAwarded,
        // Committed manifests describe finished rounds; >0 only in transitional
        // recovery payloads, which the dev provider never produces.
        remainingRounds: 0,
        steps: featureSteps.map(toWireStep),
        retriggers: manifest.feature.retriggerCount,
        // The provider only enters a feature when the cap is not yet reached
        // and nothing after the feature adds wins, so a capped manifest with a
        // feature block means the cap was hit during the feature.
        maxWinReached: manifest.capped,
      }
    : { triggered: false };

  const wire: WireOutcomeManifest = {
    schemaVersion: manifest.manifestVersion,
    roundId: manifest.roundId,
    gameId: meta.gameId,
    gameVersion: manifest.gameVersion,
    mathVersion: manifest.mathVersion,
    mathProfileId: meta.mathProfileId,
    configHash: meta.configHash,
    currency: manifest.currency,
    wagerMinor: manifest.betMinor,
    initialGrid: initialGrid.map((column) => [...column]),
    steps: baseSteps.map(toWireStep),
    feature,
    totalWinMinor: manifest.totalWinMinor,
    maximumWinReached: manifest.capped,
    roundComplete: true,
    signature: manifest.signature ?? 'dev-unsigned',
  };
  if (manifest.balanceAfterMinor !== undefined) wire.balanceAfterMinor = manifest.balanceAfterMinor;
  if (manifest.resumePointer !== undefined) wire.resumePointer = manifest.resumePointer;
  return wire;
}

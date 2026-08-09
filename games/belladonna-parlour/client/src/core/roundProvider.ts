/**
 * RoundProvider contract + shared manifest validation.
 *
 * Every provider (dev provider, production RGS adapter) returns the SAME
 * server-authoritative OutcomeManifest shape, and every manifest — regardless
 * of source — passes through `assertValidManifest` before the client presents
 * it. The client never trusts, recomputes, or alters settlement values; it
 * only checks internal consistency and refuses malformed rounds.
 */

import type { OutcomeManifest, Step, TierId } from './types.js';
import { ROUND_ID_PATTERN, STEP_ID_PATTERN, STEP_TYPES, SYMBOL_ID_PATTERN, TIER_IDS } from './types.js';
import { winMinor } from './money.js';

export interface RequestRoundOptions {
  /**
   * Client-generated idempotency key: resending the same key MUST NOT place a
   * second wager. Providers echo it into their transport layer.
   */
  idempotencyKey?: string;
  /** Bonus-buy purchase of a tier (jurisdiction-gated by the caller). */
  bonusBuyTier?: TierId;
}

export interface ResumeResult {
  manifest: OutcomeManifest;
  /** stepId to seek presentation to (never re-settles). */
  resumePointer: string;
}

export interface RoundProvider {
  /** Place a wager and receive the committed outcome manifest. */
  requestRound(betMinor: number, opts?: RequestRoundOptions): Promise<OutcomeManifest>;
  /**
   * Ask for an interrupted committed round. Null when there is nothing to
   * recover. The returned manifest was already settled server-side.
   */
  resume(): Promise<ResumeResult | null>;
}

// ---------------------------------------------------------------------------
// Shared manifest validation (structural, ordering, totals, cap)
// ---------------------------------------------------------------------------

export interface ManifestIssue {
  path: string;
  message: string;
}

export class ManifestValidationError extends Error {
  constructor(readonly issues: ManifestIssue[]) {
    super(`invalid outcome manifest:\n${issues.map((i) => `  ${i.path}: ${i.message}`).join('\n')}`);
    this.name = 'ManifestValidationError';
  }
}

function isMinor(v: unknown): v is number {
  return typeof v === 'number' && Number.isSafeInteger(v) && v >= 0;
}

/** Sum of all win.winMinor across all steps (BigInt-safe accumulation). */
export function stepsWinTotalMinor(manifest: OutcomeManifest): number {
  let total = 0n;
  for (const step of manifest.steps) {
    for (const win of step.wins) total += BigInt(win.winMinor);
  }
  if (total > BigInt(Number.MAX_SAFE_INTEGER)) throw new RangeError('steps win total overflows safe integer');
  return Number(total);
}

function validateStep(step: Step, index: number, manifest: OutcomeManifest, issues: ManifestIssue[]): void {
  const p = `steps[${index}]`;
  if (step.stepId !== `step-${index + 1}` || !STEP_ID_PATTERN.test(step.stepId)) {
    issues.push({ path: `${p}.stepId`, message: `must be "step-${index + 1}", got "${step.stepId}"` });
  }
  if (!STEP_TYPES.includes(step.type)) {
    issues.push({ path: `${p}.type`, message: `unknown step type "${step.type}"` });
  }
  if (index === 0 && step.type !== 'initial_result') {
    issues.push({ path: `${p}.type`, message: 'first step must be initial_result' });
  }
  // grid: columns-major, rectangular, valid symbol ids
  if (!Array.isArray(step.grid) || step.grid.length === 0) {
    issues.push({ path: `${p}.grid`, message: 'grid must be a non-empty columns-major array' });
  } else {
    const rows = step.grid[0]?.length ?? 0;
    step.grid.forEach((column, c) => {
      if (!Array.isArray(column) || column.length !== rows || rows === 0) {
        issues.push({ path: `${p}.grid[${c}]`, message: 'columns must be non-empty and equal length' });
        return;
      }
      column.forEach((symbolId, r) => {
        if (!SYMBOL_ID_PATTERN.test(symbolId)) {
          issues.push({ path: `${p}.grid[${c}][${r}]`, message: `invalid symbol id "${symbolId}"` });
        }
      });
    });
  }
  if (!Number.isSafeInteger(step.scatterCount) || step.scatterCount < 0) {
    issues.push({ path: `${p}.scatterCount`, message: 'must be a non-negative integer' });
  }
  if (!Number.isSafeInteger(step.multiplier) || step.multiplier < 1) {
    issues.push({ path: `${p}.multiplier`, message: 'must be an integer ≥ 1' });
  }
  step.wins.forEach((win, w) => {
    const wp = `${p}.wins[${w}]`;
    if (!isMinor(win.winMinor)) {
      issues.push({ path: `${wp}.winMinor`, message: 'must be a non-negative safe integer' });
      return;
    }
    if (!isMinor(win.payX100)) {
      issues.push({ path: `${wp}.payX100`, message: 'must be a non-negative safe integer' });
      return;
    }
    // Cross-check against the canonical floor rule (CONVENTIONS §5).
    // Only when betMinor itself is well-formed — its own issue is reported separately.
    if (!isMinor(manifest.betMinor)) return;
    const expected = winMinor(manifest.betMinor, win.payX100, Math.max(1, step.multiplier));
    if (win.winMinor !== expected) {
      issues.push({
        path: `${wp}.winMinor`,
        message: `${win.winMinor} violates floor rule; expected ${expected} (bet ${manifest.betMinor}, payX100 ${win.payX100}, mult ${step.multiplier})`,
      });
    }
  });
}

/**
 * Structural + consistency validation. Returns all issues found (empty array
 * = valid). Checks: ids, step ordering, grid shape, per-win floor rule,
 * totals vs sum of step wins, max-win cap, terminal-step ordering, feature
 * block consistency.
 */
export function validateManifest(manifest: OutcomeManifest): ManifestIssue[] {
  const issues: ManifestIssue[] = [];

  if (!ROUND_ID_PATTERN.test(manifest.roundId)) {
    issues.push({ path: 'roundId', message: `must match ${ROUND_ID_PATTERN}, got "${manifest.roundId}"` });
  }
  if (!isMinor(manifest.betMinor) || manifest.betMinor === 0) {
    issues.push({ path: 'betMinor', message: 'must be a positive safe integer' });
  }
  if (!isMinor(manifest.totalWinMinor)) {
    issues.push({ path: 'totalWinMinor', message: 'must be a non-negative safe integer' });
  }
  if (!isMinor(manifest.maxWinCapMinor) || manifest.maxWinCapMinor === 0) {
    issues.push({ path: 'maxWinCapMinor', message: 'must be a positive safe integer' });
  }
  if (!Array.isArray(manifest.steps) || manifest.steps.length === 0) {
    issues.push({ path: 'steps', message: 'must be a non-empty ordered array' });
    return issues; // nothing further to check
  }

  manifest.steps.forEach((step, i) => validateStep(step, i, manifest, issues));

  // Terminal ordering: settlement (if present) is unique and last;
  // max_win_termination (if present) is unique and only settlement may follow.
  const settlementIdx = manifest.steps.map((s, i) => (s.type === 'settlement' ? i : -1)).filter((i) => i >= 0);
  if (settlementIdx.length > 1) {
    issues.push({ path: 'steps', message: 'multiple settlement steps' });
  } else if (settlementIdx.length === 1 && settlementIdx[0] !== manifest.steps.length - 1) {
    issues.push({ path: 'steps', message: 'settlement step must be last' });
  }
  const maxWinIdx = manifest.steps.map((s, i) => (s.type === 'max_win_termination' ? i : -1)).filter((i) => i >= 0);
  if (maxWinIdx.length > 1) {
    issues.push({ path: 'steps', message: 'multiple max_win_termination steps' });
  } else if (maxWinIdx.length === 1) {
    const after = manifest.steps.slice(maxWinIdx[0]! + 1);
    if (after.some((s) => s.type !== 'settlement')) {
      issues.push({ path: 'steps', message: 'only settlement may follow max_win_termination' });
    }
  }

  // Totals + cap (CONVENTIONS §7, §9.4).
  if (isMinor(manifest.totalWinMinor) && isMinor(manifest.maxWinCapMinor) && manifest.maxWinCapMinor > 0) {
    const sum = stepsWinTotalMinor(manifest);
    if (manifest.totalWinMinor > manifest.maxWinCapMinor) {
      issues.push({
        path: 'totalWinMinor',
        message: `${manifest.totalWinMinor} exceeds maxWinCapMinor ${manifest.maxWinCapMinor}`,
      });
    }
    if (manifest.capped) {
      if (maxWinIdx.length === 0) {
        issues.push({ path: 'capped', message: 'capped manifest must contain a max_win_termination step' });
      }
      if (manifest.totalWinMinor !== manifest.maxWinCapMinor) {
        issues.push({
          path: 'totalWinMinor',
          message: `capped round must settle exactly at cap (${manifest.maxWinCapMinor}), got ${manifest.totalWinMinor}`,
        });
      }
      if (sum < manifest.maxWinCapMinor) {
        issues.push({
          path: 'steps',
          message: `capped round but step wins sum ${sum} is below cap ${manifest.maxWinCapMinor}`,
        });
      }
    } else {
      if (maxWinIdx.length > 0) {
        issues.push({ path: 'capped', message: 'manifest has max_win_termination step but capped=false' });
      }
      if (sum !== manifest.totalWinMinor) {
        issues.push({
          path: 'totalWinMinor',
          message: `totalWinMinor ${manifest.totalWinMinor} != sum of step wins ${sum}`,
        });
      }
    }
  }

  // Feature block consistency.
  const triggerSteps = manifest.steps.filter((s) => s.type === 'feature_trigger');
  if (manifest.feature) {
    if (!TIER_IDS.includes(manifest.feature.tierId)) {
      issues.push({ path: 'feature.tierId', message: `unknown tier "${manifest.feature.tierId}"` });
    }
    if (triggerSteps.length === 0) {
      issues.push({ path: 'feature', message: 'feature block present but no feature_trigger step' });
    }
    if (manifest.feature.retriggerCount > manifest.feature.retriggerCap) {
      issues.push({ path: 'feature.retriggerCount', message: 'exceeds retriggerCap' });
    }
  } else if (triggerSteps.length > 0) {
    issues.push({ path: 'feature', message: 'feature_trigger step present but feature block is null' });
  }

  if (manifest.resumePointer !== undefined && !manifest.steps.some((s) => s.stepId === manifest.resumePointer)) {
    issues.push({ path: 'resumePointer', message: `"${manifest.resumePointer}" does not match any stepId` });
  }

  return issues;
}

/** Throws ManifestValidationError when the manifest is inconsistent. */
export function assertValidManifest(manifest: OutcomeManifest): void {
  const issues = validateManifest(manifest);
  if (issues.length > 0) throw new ManifestValidationError(issues);
}

/**
 * Recovery — replay a committed round from a resume pointer.
 *
 * Pure function of (manifest, resumePointer): builds the presentation plan
 * starting at that step. It NEVER re-requests the outcome and NEVER
 * re-settles — the manifest was committed server-side; recovery is purely a
 * presentation seek (CONVENTIONS §7).
 */

import type { OutcomeManifest, Step, TierId } from './types.js';
import type { GameState } from './stateMachine.js';
import { assertValidManifest } from './roundProvider.js';

export interface RecoveryPlan {
  roundId: string;
  /** Index into manifest.steps where presentation resumes. */
  resumeStepIndex: number;
  /** Steps still to present (resume step first). */
  remainingSteps: Step[];
  /**
   * Win already presented before the interruption (sum of step wins before
   * the resume step) — lets the HUD show the correct running total instantly.
   */
  presentedWinMinor: number;
  /** Authoritative settled total — copied, never recomputed. */
  totalWinMinor: number;
  /** State the machine should seek to (via recovering → entryState). */
  entryState: GameState;
}

function tierActiveState(tierId: TierId): GameState {
  switch (tierId) {
    case 'feature':
      return 'feature_active';
    case 'super_feature':
      return 'super_feature_active';
    case 'ultimate_feature':
      return 'ultimate_feature_active';
  }
}

/** Presentation state that corresponds to presenting a given step. */
export function stateForStep(step: Step, manifest: OutcomeManifest): GameState {
  switch (step.type) {
    case 'initial_result':
      return 'presenting_initial_result';
    case 'cascade':
    case 'respin':
      return 'presenting_cascades';
    case 'feature_trigger':
      return 'feature_pending';
    case 'feature_round':
    case 'feature_upgrade':
      return manifest.feature ? tierActiveState(manifest.feature.tierId) : 'presenting_wins';
    case 'feature_retrigger':
      return 'feature_retrigger';
    case 'jackpot_award':
      return manifest.feature ? tierActiveState(manifest.feature.tierId) : 'presenting_wins';
    case 'max_win_termination':
      return 'maximum_win';
    case 'settlement':
      return manifest.feature ? 'feature_summary' : 'round_complete';
  }
}

/**
 * Build the recovery plan. Validates the manifest first and throws when the
 * pointer does not name one of its steps.
 */
export function buildRecoveryPlan(manifest: OutcomeManifest, resumePointer: string): RecoveryPlan {
  assertValidManifest(manifest);
  const resumeStepIndex = manifest.steps.findIndex((s) => s.stepId === resumePointer);
  if (resumeStepIndex < 0) {
    throw new RangeError(`resumePointer "${resumePointer}" does not match any step in round ${manifest.roundId}`);
  }
  let presentedWinMinor = 0;
  for (let i = 0; i < resumeStepIndex; i++) {
    for (const win of manifest.steps[i]!.wins) presentedWinMinor += win.winMinor;
  }
  const resumeStep = manifest.steps[resumeStepIndex]!;
  return {
    roundId: manifest.roundId,
    resumeStepIndex,
    remainingSteps: manifest.steps.slice(resumeStepIndex),
    presentedWinMinor,
    totalWinMinor: manifest.totalWinMinor,
    entryState: stateForStep(resumeStep, manifest),
  };
}

/**
 * Full legal presentation state path for a manifest (deduplicated consecutive
 * states), starting after outcome_committed and ending at round_complete.
 * Used by presentation drivers and the mode-equivalence tests: the path is a
 * pure function of the manifest, so every spin mode walks the SAME path.
 */
export function presentationStatePath(manifest: OutcomeManifest): GameState[] {
  const path: GameState[] = [];
  const push = (s: GameState) => {
    if (path[path.length - 1] !== s) path.push(s);
  };
  for (const step of manifest.steps) {
    switch (step.type) {
      case 'initial_result':
        push('presenting_initial_result');
        if (step.wins.length > 0) push('presenting_wins');
        break;
      case 'feature_trigger':
        push('feature_pending');
        if (manifest.feature) {
          switch (manifest.feature.tierId) {
            case 'feature':
              push('feature_entry');
              break;
            case 'super_feature':
              push('super_feature_entry');
              break;
            case 'ultimate_feature':
              push('ultimate_feature_entry');
              break;
          }
        }
        push(manifest.feature ? tierActiveState(manifest.feature.tierId) : 'presenting_wins');
        break;
      case 'feature_retrigger':
        push('feature_retrigger');
        if (manifest.feature) push(tierActiveState(manifest.feature.tierId));
        break;
      case 'settlement':
        if (manifest.feature) push('feature_summary');
        push('round_complete');
        break;
      default:
        push(stateForStep(step, manifest));
        break;
    }
  }
  push('round_complete');
  return path;
}

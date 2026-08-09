/**
 * Spin timing model — PRESENTATION ONLY.
 *
 * A pure function of (manifest, mode, policy) that returns a presentation
 * schedule. It reads the committed OutcomeManifest but NEVER writes to it or
 * influences it: normal/quick/turbo alter durations, stagger, and holds —
 * never RTP, weights, wins, scatter counts, or settlement (§9.2). The
 * equivalence test in tests/equivalence.test.ts enforces this.
 *
 * Timing rules per mode (prompt lines 1302-1358):
 *   normal — full acceleration/travel, standard stop rhythm, full
 *            anticipation, full win/cascade/feature presentation.
 *   quick  — shortened acceleration/travel, reduced stop delay, shortened
 *            ordinary-win and cascade pauses; feature clarity preserved
 *            (feature transitions keep their full duration).
 *   turbo  — minimal travel, near-immediate committed result, reduced
 *            ordinary animations and win holds; important feature events
 *            preserved; jurisdiction minimum round duration still applies.
 */

import type { JurisdictionPolicy, OutcomeManifest, SpinMode, Step } from './types.js';
import type { TimelineEventInput } from './timeline.js';

export interface SpinModeProfile {
  /** Reel acceleration phase, ms. */
  accelMs: number;
  /** Reel travel before the first stop, ms. */
  travelMs: number;
  /** Extra delay per subsequent reel stop, ms. */
  reelStaggerMs: number;
  /** Extra travel added to a reel in scatter anticipation, ms. */
  anticipationExtraMs: number;
  /** Ordinary win count-up hold, ms. */
  winCountupMs: number;
  /** Per cascade step (remove + refill + re-evaluate), ms. */
  cascadeStepMs: number;
  /** Feature enter/retrigger/upgrade transition, ms (clarity preserved). */
  featureTransitionMs: number;
  /** Per feature free round, ms. */
  featureRoundMs: number;
  /** Max-win celebration, ms (important event — never reduced below this). */
  maxWinMs: number;
  /** Settlement / summary hold, ms. */
  summaryMs: number;
}

/**
 * Template FALLBACK profiles. A generated game overrides these from
 * `config/spin-presentation.json` (authored per prompts/animation-vfx.md §2,
 * which also carries the recommended per-mode duration bands, e.g. normal
 * spin-press → settled ≈ 2,400–3,200 ms including deceleration). These
 * defaults are intentionally conservative and NOT the authored numbers.
 */
export const SPIN_MODE_PROFILES: Readonly<Record<SpinMode, SpinModeProfile>> = {
  normal: {
    accelMs: 250,
    travelMs: 900,
    reelStaggerMs: 200,
    anticipationExtraMs: 1500,
    winCountupMs: 1200,
    cascadeStepMs: 700,
    featureTransitionMs: 2400,
    featureRoundMs: 1600,
    maxWinMs: 3000,
    summaryMs: 1500,
  },
  quick: {
    accelMs: 120,
    travelMs: 350,
    reelStaggerMs: 90,
    anticipationExtraMs: 900,
    winCountupMs: 500,
    cascadeStepMs: 350,
    featureTransitionMs: 2400, // preserved feature clarity
    featureRoundMs: 900,
    maxWinMs: 3000, // important event — preserved
    summaryMs: 1200,
  },
  turbo: {
    accelMs: 50,
    travelMs: 120,
    reelStaggerMs: 0,
    anticipationExtraMs: 400,
    winCountupMs: 200,
    cascadeStepMs: 180,
    featureTransitionMs: 2400, // important feature events preserved
    featureRoundMs: 450,
    maxWinMs: 3000, // important event — preserved
    summaryMs: 900,
  },
};

export interface ReelSchedule {
  reelIndex: number;
  startAtMs: number;
  stopAtMs: number;
  anticipation: boolean;
}

export interface StepSchedule {
  stepId: string;
  type: Step['type'];
  startAtMs: number;
  durationMs: number;
  /** Sum of this step's win.winMinor (display data, copied from manifest). */
  stepWinMinor: number;
}

export interface SpinSchedule {
  roundId: string;
  /** Mode actually used after jurisdiction gating. */
  mode: SpinMode;
  reelSchedules: ReelSchedule[];
  stepSchedules: StepSchedule[];
  /** Padding added to honour policy.minRoundDurationMs (0 when none). */
  minDurationPaddingMs: number;
  totalDurationMs: number;
}

/**
 * Jurisdiction gate for requested modes: quick/turbo silently degrade to the
 * fastest ALLOWED mode (turbo → quick → normal). UNKNOWN jurisdictions use
 * MOST_RESTRICTIVE_POLICY and therefore always get normal.
 */
export function resolveSpinMode(requested: SpinMode, policy: JurisdictionPolicy): SpinMode {
  if (requested === 'turbo') {
    if (policy.turboSpinAllowed) return 'turbo';
    return policy.quickSpinAllowed ? 'quick' : 'normal';
  }
  if (requested === 'quick') {
    return policy.quickSpinAllowed ? 'quick' : 'normal';
  }
  return 'normal';
}

/**
 * Scatter anticipation per reel, derived purely from the committed grid:
 * reel i extends its travel when the reels to its LEFT already show ≥ 2
 * scatters (classic anticipation). Pure function of the manifest — identical
 * in every mode (only the extension length differs).
 */
export function anticipationReels(initialGrid: string[][]): boolean[] {
  let scattersSoFar = 0;
  return initialGrid.map((column) => {
    const anticipate = scattersSoFar >= 2;
    scattersSoFar += column.filter((s) => s === 'SCATTER').length;
    return anticipate;
  });
}

function stepDuration(step: Step, profile: SpinModeProfile): number {
  switch (step.type) {
    case 'initial_result':
      return step.wins.length > 0 ? profile.winCountupMs : 0;
    case 'cascade':
    case 'respin':
      return profile.cascadeStepMs + (step.wins.length > 0 ? profile.winCountupMs : 0);
    case 'feature_trigger':
    case 'feature_retrigger':
    case 'feature_upgrade':
      return profile.featureTransitionMs;
    case 'feature_round':
      return profile.featureRoundMs + (step.wins.length > 0 ? profile.winCountupMs : 0);
    case 'jackpot_award':
      return profile.maxWinMs;
    case 'max_win_termination':
      return profile.maxWinMs;
    case 'settlement':
      return profile.summaryMs;
  }
}

/**
 * Build the full presentation schedule for one committed manifest.
 * Pure: (manifest, requestedMode, policy) → schedule. No clocks, no state.
 */
export function buildSpinSchedule(
  manifest: OutcomeManifest,
  requestedMode: SpinMode,
  policy: JurisdictionPolicy,
): SpinSchedule {
  const mode = resolveSpinMode(requestedMode, policy);
  const profile = SPIN_MODE_PROFILES[mode];

  const initialStep = manifest.steps[0];
  if (!initialStep) throw new RangeError('manifest has no steps');

  // --- reel schedule for the initial spin --------------------------------
  const anticipate = anticipationReels(initialStep.grid);
  const reelSchedules: ReelSchedule[] = [];
  let stopAt = 0;
  initialStep.grid.forEach((_, reelIndex) => {
    const extra = anticipate[reelIndex] ? profile.anticipationExtraMs : 0;
    stopAt =
      reelIndex === 0
        ? profile.accelMs + profile.travelMs + extra
        : stopAt + profile.reelStaggerMs + extra;
    reelSchedules.push({ reelIndex, startAtMs: 0, stopAtMs: stopAt, anticipation: anticipate[reelIndex] ?? false });
  });
  const allReelsStoppedAt = stopAt;

  // --- step schedule (sequential, starting when the reels have stopped) ---
  const stepSchedules: StepSchedule[] = [];
  let cursor = allReelsStoppedAt;
  for (const step of manifest.steps) {
    const durationMs = stepDuration(step, profile);
    stepSchedules.push({
      stepId: step.stepId,
      type: step.type,
      startAtMs: cursor,
      durationMs,
      stepWinMinor: step.wins.reduce((sum, w) => sum + w.winMinor, 0),
    });
    cursor += durationMs;
  }

  // --- jurisdiction minimum round duration (presentation floor) ----------
  const minDurationPaddingMs = Math.max(0, policy.minRoundDurationMs - cursor);
  const totalDurationMs = cursor + minDurationPaddingMs;

  return { roundId: manifest.roundId, mode, reelSchedules, stepSchedules, minDurationPaddingMs, totalDurationMs };
}

/**
 * Convert a schedule into timeline events for the deterministic timeline
 * engine. Step events carry marker 'step' (skipTo('next_step') seam), the
 * settlement step carries marker 'summary' (skipTo('summary') seam), and
 * payloads carry display data copied from the manifest.
 */
export function scheduleToTimelineEvents(schedule: SpinSchedule): TimelineEventInput[] {
  const events: TimelineEventInput[] = [];
  for (const reel of schedule.reelSchedules) {
    events.push({
      id: `reel-${reel.reelIndex}`,
      at: reel.startAtMs,
      duration: reel.stopAtMs - reel.startAtMs,
      priority: 10,
      payload: { kind: 'reel', reelIndex: reel.reelIndex, anticipation: reel.anticipation },
    });
  }
  for (const step of schedule.stepSchedules) {
    events.push({
      id: `step:${step.stepId}`,
      at: step.startAtMs,
      duration: step.durationMs,
      priority: 5,
      marker: step.type === 'settlement' ? 'summary' : 'step',
      payload: { kind: 'step', stepId: step.stepId, type: step.type, stepWinMinor: step.stepWinMinor },
    });
  }
  if (schedule.minDurationPaddingMs > 0) {
    events.push({
      id: 'min-round-duration-pad',
      at: schedule.totalDurationMs,
      duration: 0,
      priority: 0,
      payload: { kind: 'pad' },
    });
  }
  return events;
}

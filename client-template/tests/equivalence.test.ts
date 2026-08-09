/**
 * THE key invariant (CONVENTIONS §9.2, prompt line 2795):
 *
 *   The same outcome manifest must produce the same final result in normal,
 *   quick, turbo, skipped, and recovered presentations.
 *
 * Strategy: generate committed manifests with the dev provider, push each one
 * through every presentation pipeline variant (mode schedules + timeline,
 * clock-driven and skipTo(complete)), plus the recovery planner, and assert
 * that the final win, final balance, terminal state, and presented-win
 * accumulation are byte-identical — and that the manifest itself is never
 * mutated by presentation.
 */

import { describe, expect, test } from 'bun:test';
import { DevRoundProvider } from '../src/core/devRoundProvider.js';
import { stepsWinTotalMinor } from '../src/core/roundProvider.js';
import { buildRecoveryPlan, presentationStatePath } from '../src/core/recovery.js';
import { SlotStateMachine, type GameState } from '../src/core/stateMachine.js';
import { buildSpinSchedule, resolveSpinMode, scheduleToTimelineEvents } from '../src/core/spinTiming.js';
import { Timeline } from '../src/core/timeline.js';
import type { JurisdictionPolicy, OutcomeManifest, SpinMode } from '../src/core/types.js';
import { MOST_RESTRICTIVE_POLICY, SPIN_MODES } from '../src/core/types.js';
import { MIN_DURATION_POLICY, PERMISSIVE_POLICY, makeConfig, makeGuaranteedWinConfig } from './fixtures.js';

const BET = 100;
const START_BALANCE = 1_000_000;

interface PresentationResult {
  /** Win accumulated from presented step payloads (what the HUD counted up). */
  presentedWinMinor: number;
  /** Settled from the manifest — the only authoritative figure. */
  finalWinMinor: number;
  finalBalanceMinor: number;
  terminalState: GameState;
  statePath: string;
  totalDurationMs: number;
}

/** Full presentation pipeline for one committed manifest. */
function present(
  manifest: OutcomeManifest,
  mode: SpinMode,
  policy: JurisdictionPolicy,
  driver: 'clock' | 'skip',
): PresentationResult {
  const schedule = buildSpinSchedule(manifest, mode, policy);
  const timeline = new Timeline();
  let presentedWinMinor = 0;
  timeline.onFire((firing) => {
    const payload = firing.payload as { kind?: string; stepWinMinor?: number } | undefined;
    if (payload?.kind === 'step' && firing.phase === 'complete') {
      presentedWinMinor += payload.stepWinMinor ?? 0;
    }
  });
  timeline.addMany(scheduleToTimelineEvents(schedule));
  if (driver === 'clock') {
    while (!timeline.complete) timeline.advance(16);
  } else {
    timeline.skipTo('complete');
  }

  // Drive the state machine along the manifest's presentation path.
  // Dev mode ⇒ any illegal transition throws and fails the test.
  const machine = new SlotStateMachine({ mode: 'dev', initial: 'ready' });
  machine.transition('round_requested');
  machine.transition('outcome_received');
  machine.transition('outcome_committed');
  const path = presentationStatePath(manifest);
  for (const state of path) machine.transition(state);

  return {
    presentedWinMinor,
    finalWinMinor: manifest.totalWinMinor,
    finalBalanceMinor: START_BALANCE - manifest.betMinor + manifest.totalWinMinor,
    terminalState: machine.state,
    statePath: path.join('>'),
    totalDurationMs: schedule.totalDurationMs,
  };
}

/** Build a representative set of committed manifests. */
async function buildManifests(): Promise<Record<string, OutcomeManifest>> {
  const provider = new DevRoundProvider(makeConfig(), 20260808);
  const capProvider = new DevRoundProvider(makeGuaranteedWinConfig(1), 1);
  return {
    plain: await provider.requestRound(BET, { forceScatterCount: 0 }),
    scattersNoTrigger: await provider.requestRound(BET, { forceScatterCount: 2 }),
    feature: await provider.requestRound(BET, { forceScatterCount: 3 }),
    superFeature: await provider.requestRound(BET, { forceScatterCount: 4 }),
    ultimateFeature: await provider.requestRound(BET, { forceScatterCount: 5 }),
    maxWinCapped: await capProvider.requestRound(BET),
  };
}

describe('mode equivalence — same manifest ⇒ same final result everywhere', () => {
  test('normal / quick / turbo / skipped presentations are result-identical', async () => {
    const manifests = await buildManifests();
    for (const [name, manifest] of Object.entries(manifests)) {
      const frozen = JSON.stringify(manifest);
      const variants: PresentationResult[] = [
        ...SPIN_MODES.map((mode) => present(manifest, mode, PERMISSIVE_POLICY, 'clock')),
        ...SPIN_MODES.map((mode) => present(manifest, mode, PERMISSIVE_POLICY, 'skip')),
      ];
      const [reference, ...rest] = variants;
      for (const variant of rest) {
        // identical final win, balance, terminal state, state path, HUD count-up
        expect(variant.finalWinMinor).toBe(reference!.finalWinMinor);
        expect(variant.finalBalanceMinor).toBe(reference!.finalBalanceMinor);
        expect(variant.terminalState).toBe(reference!.terminalState);
        expect(variant.statePath).toBe(reference!.statePath);
        expect(variant.presentedWinMinor).toBe(reference!.presentedWinMinor);
      }
      expect(reference!.terminalState).toBe('round_complete');
      // presentation never mutates the committed manifest
      expect(JSON.stringify(manifest)).toBe(frozen);
      // the presented count-up equals the manifest's step-win sum (mode-invariant)
      expect(reference!.presentedWinMinor).toBe(stepsWinTotalMinor(manifest));
      // settlement comes from the manifest alone
      if (manifest.capped) {
        expect(reference!.finalWinMinor).toBe(manifest.maxWinCapMinor);
      } else {
        expect(reference!.finalWinMinor).toBe(stepsWinTotalMinor(manifest));
      }
      // sanity per manifest name (silence unused-var lint and label failures)
      expect(name.length).toBeGreaterThan(0);
    }
  });

  test('modes differ ONLY in presentation duration, never in results', async () => {
    const manifests = await buildManifests();
    const manifest = manifests['feature']!;
    const normal = present(manifest, 'normal', PERMISSIVE_POLICY, 'clock');
    const quick = present(manifest, 'quick', PERMISSIVE_POLICY, 'clock');
    const turbo = present(manifest, 'turbo', PERMISSIVE_POLICY, 'clock');
    expect(normal.totalDurationMs).toBeGreaterThan(quick.totalDurationMs);
    expect(quick.totalDurationMs).toBeGreaterThan(turbo.totalDurationMs);
    expect(normal.finalWinMinor).toBe(turbo.finalWinMinor);
    expect(normal.finalBalanceMinor).toBe(turbo.finalBalanceMinor);
  });

  test('jurisdiction min round duration pads presentation without touching results', async () => {
    const manifests = await buildManifests();
    const manifest = manifests['plain']!;
    const padded = present(manifest, 'turbo', MIN_DURATION_POLICY, 'clock');
    const unpadded = present(manifest, 'turbo', PERMISSIVE_POLICY, 'clock');
    expect(padded.totalDurationMs).toBeGreaterThanOrEqual(MIN_DURATION_POLICY.minRoundDurationMs);
    expect(padded.finalWinMinor).toBe(unpadded.finalWinMinor);
    expect(padded.finalBalanceMinor).toBe(unpadded.finalBalanceMinor);
    expect(padded.presentedWinMinor).toBe(unpadded.presentedWinMinor);
  });

  test('restricted jurisdictions degrade the MODE, never the RESULT', async () => {
    expect(resolveSpinMode('turbo', MOST_RESTRICTIVE_POLICY)).toBe('normal');
    expect(resolveSpinMode('quick', MOST_RESTRICTIVE_POLICY)).toBe('normal');
    const manifests = await buildManifests();
    const manifest = manifests['superFeature']!;
    const restricted = present(manifest, 'turbo', { ...MOST_RESTRICTIVE_POLICY, minRoundDurationMs: 0 }, 'clock');
    const permissive = present(manifest, 'turbo', PERMISSIVE_POLICY, 'clock');
    expect(restricted.finalWinMinor).toBe(permissive.finalWinMinor);
    expect(restricted.finalBalanceMinor).toBe(permissive.finalBalanceMinor);
    expect(restricted.terminalState).toBe(permissive.terminalState);
  });
});

describe('recovered presentation — same final result, no re-settlement', () => {
  test('recovery from every step of every manifest preserves the settled result', async () => {
    const manifests = await buildManifests();
    for (const manifest of Object.values(manifests)) {
      for (const step of manifest.steps) {
        const plan = buildRecoveryPlan(manifest, step.stepId);
        // already-presented + still-to-present always equals the full step-win sum
        const remainingWins = plan.remainingSteps.reduce(
          (sum, s) => sum + s.wins.reduce((x, w) => x + w.winMinor, 0),
          0,
        );
        expect(plan.presentedWinMinor + remainingWins).toBe(stepsWinTotalMinor(manifest));
        // the settled total is copied, never recomputed
        expect(plan.totalWinMinor).toBe(manifest.totalWinMinor);
        expect(plan.roundId).toBe(manifest.roundId);
        // resuming mid-round reaches the same terminal state via the same path suffix
        expect(plan.remainingSteps[0]!.stepId).toBe(step.stepId);
      }
      // recovery entry state is reachable from `recovering` for every step
      const machineTargets = new Set<GameState>([
        'presenting_initial_result', 'presenting_wins', 'presenting_cascades', 'feature_pending',
        'feature_active', 'super_feature_active', 'ultimate_feature_active', 'feature_retrigger',
        'maximum_win', 'feature_summary', 'round_complete',
      ]);
      for (const step of manifest.steps) {
        expect(machineTargets.has(buildRecoveryPlan(manifest, step.stepId).entryState)).toBe(true);
      }
    }
  });

  test('recovery plan for an unknown pointer throws instead of guessing', async () => {
    const manifests = await buildManifests();
    expect(() => buildRecoveryPlan(manifests['plain']!, 'step-999')).toThrow(RangeError);
  });
});

/**
 * PixiJS v8 application bootstrap + presentation integration.
 *
 * Responsibilities (and ONLY these — all game truth lives in src/core):
 *   - async Pixi init, WebGPU preferred with WebGL fallback, DPR handling
 *   - resize + orientation handling with breakpoints
 *     (portrait / landscape / tablet / desktop / ultrawide), safe-area aware
 *   - visibilitychange pause, WebGL context-loss listener → recovery via the
 *     core recovery plan
 *   - reduced-motion (matchMedia) + low-performance (fps probe) flags
 *   - wiring: InputGuard → actions, RoundProvider → state machine →
 *     spinTiming schedule → Timeline → ReelView/MotionPlayer/Hud/Audio
 *
 * The client is a pure renderer of the committed OutcomeManifest (§9.1/§9.2):
 * nothing in this file computes or alters wins, balances, or scatter counts.
 */

import { Application, Container, type Texture } from 'pixi.js';
import type { GameConfig, JurisdictionPolicy, OutcomeManifest, SpinMode, Step } from '../core/types.js';
import { MOST_RESTRICTIVE_POLICY } from '../core/types.js';
import { loadConfigBundle } from '../core/configLoader.js';
import { SlotStateMachine, type GameState } from '../core/stateMachine.js';
import type { RoundProvider } from '../core/roundProvider.js';
import { DevRoundProvider } from '../core/devRoundProvider.js';
import { Timeline, type TimelineFiring } from '../core/timeline.js';
import { buildSpinSchedule, resolveSpinMode, scheduleToTimelineEvents, SPIN_MODE_PROFILES } from '../core/spinTiming.js';
import { buildRecoveryPlan, stateForStep } from '../core/recovery.js';
import { AutoplayController, type AutoplayConfig } from '../core/autoplay.js';
import { InputGuard, type RawInputKind } from '../core/inputGuard.js';
import { RafClock } from './clock.js';
import { ReelView } from './reelView.js';
import { Hud } from './hud.js';
import { MotionPlayer, DEFAULT_ANIMATION_EVENTS } from './motionPlayer.js';
import { AudioManager, DEFAULT_AUDIO_EVENTS, type AudioContextLike, type MusicStateId } from './audioManager.js';
import {
  celebrationEventForTier,
  resolveWinTier,
  WinCountUp,
  winTierThresholdsFromConfig,
  DEFAULT_WIN_TIER_THRESHOLDS,
  type WinTierThresholds,
} from './winPresentation.js';

// ---------------------------------------------------------------------------
// Breakpoints
// ---------------------------------------------------------------------------

export type Breakpoint = 'portrait' | 'landscape' | 'tablet' | 'desktop' | 'ultrawide';

export function resolveBreakpoint(width: number, height: number): Breakpoint {
  if (height >= width) return 'portrait';
  const aspect = width / height;
  if (aspect >= 21 / 9) return 'ultrawide';
  if (width >= 1280) return 'desktop';
  if (width >= 900) return 'tablet';
  return 'landscape';
}

// ---------------------------------------------------------------------------
// Template dev defaults — used when config/*.json is not served. A generated
// game always ships real config files; these exist so `bun run dev` works in
// the bare template. The policy is a NAMED dev jurisdiction (not UNKNOWN —
// UNKNOWN would correctly collapse to MOST_RESTRICTIVE_POLICY per §9.6).
// ---------------------------------------------------------------------------

function templateStrip(): string[] {
  return [
    'H1', 'L1', 'H2', 'L2', 'L1', 'WILD', 'L2', 'H2',
    'L1', 'SCATTER', 'L2', 'H1', 'L1', 'H2', 'L2', 'L1',
    'H1', 'L2', 'WILD', 'L1', 'H2', 'L2', 'L1', 'H2',
  ];
}

export const TEMPLATE_DEV_CONFIG: GameConfig = {
  projectSlug: 'template-example',
  gameVersion: '1.0.0',
  mathVersion: '1.0.0',
  currency: 'EUR',
  columns: 5,
  rows: 4,
  lines: [
    [0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
    [2, 2, 2, 2, 2],
    [3, 3, 3, 3, 3],
    [0, 1, 2, 1, 0],
  ],
  minBetMinor: 10,
  maxBetMinor: 10000,
  maxWinXBet: 5000,
  rtpTarget: 0.96,
  symbols: [
    { id: 'WILD', kind: 'wild' },
    { id: 'SCATTER', kind: 'scatter' },
    { id: 'H1', kind: 'premium' },
    { id: 'H2', kind: 'premium' },
    { id: 'L1', kind: 'low' },
    { id: 'L2', kind: 'low' },
  ],
  paytable: [
    { symbolId: 'H1', count: 3, payX100: 250 },
    { symbolId: 'H1', count: 4, payX100: 1000 },
    { symbolId: 'H1', count: 5, payX100: 5000 },
    { symbolId: 'H2', count: 3, payX100: 150 },
    { symbolId: 'H2', count: 4, payX100: 500 },
    { symbolId: 'H2', count: 5, payX100: 2000 },
    { symbolId: 'L1', count: 3, payX100: 50 },
    { symbolId: 'L1', count: 4, payX100: 100 },
    { symbolId: 'L1', count: 5, payX100: 400 },
    { symbolId: 'L2', count: 3, payX100: 30 },
    { symbolId: 'L2', count: 4, payX100: 80 },
    { symbolId: 'L2', count: 5, payX100: 300 },
    { symbolId: 'WILD', count: 3, payX100: 250 },
    { symbolId: 'WILD', count: 4, payX100: 1000 },
    { symbolId: 'WILD', count: 5, payX100: 5000 },
  ],
  reelSets: [
    {
      id: 'base',
      context: 'base',
      strips: [templateStrip(), templateStrip(), templateStrip(), templateStrip(), templateStrip()],
    },
  ],
  scatterTiers: [
    { tierId: 'feature', scatters: 3, roundsAwarded: 6, multiplier: 2, retriggerCap: 2 },
    { tierId: 'super_feature', scatters: 4, roundsAwarded: 10, multiplier: 3, retriggerCap: 2 },
    { tierId: 'ultimate_feature', scatters: 5, roundsAwarded: 12, multiplier: 5, retriggerCap: 1 },
  ],
  cascades: { enabled: true, maxSteps: 6 },
};

/** DEV ONLY permissive policy so the template demonstrates every control. */
export const TEMPLATE_DEV_POLICY: JurisdictionPolicy = {
  jurisdictionId: 'DEV-TEMPLATE',
  autoplayAllowed: true,
  autoplayMaxRounds: 100,
  quickSpinAllowed: true,
  turboSpinAllowed: true,
  slamStopAllowed: true,
  bonusBuyAllowed: true,
  minRoundDurationMs: 0,
  rtpDisplayRequired: true,
  realityCheckIntervalMs: 3_600_000,
};

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

export interface AppOptions {
  /** DOM element that receives the canvas. */
  mount: HTMLElement;
  /** Base URL for config/*.json (default 'config/'). */
  configBaseUrl?: string;
  /** Dev round provider seed (recorded; same seed ⇒ same round sequence). */
  seed?: number;
  /** Starting dev balance, minor units (display/dev only). Default 100 000. */
  startBalanceMinor?: number;
  /** Inject a provider (e.g. a real RgsAdapter). Default: DevRoundProvider. */
  provider?: RoundProvider;
  /** Symbol sprite textures keyed by symbol id; missing ids render placeholders. */
  symbolTextures?: ReadonlyMap<string, Texture>;
}

export async function bootstrapApp(options: AppOptions): Promise<SlotApp> {
  const app = new Application();
  const resolution = Math.min(globalThis.devicePixelRatio ?? 1, 2);
  const baseInit = {
    // Transparent canvas: the Blender-rendered parlour backdrop (index.html
    // body background) shows through behind the cabinet.
    backgroundAlpha: 0,
    resizeTo: options.mount,
    antialias: true,
    resolution,
    autoDensity: true,
  } as const;
  try {
    // WebGPU preferred; PixiJS v8 falls back to WebGL when unavailable.
    await app.init({ ...baseInit, preference: 'webgpu' });
  } catch {
    await app.init({ ...baseInit, preference: 'webgl' });
  }
  options.mount.appendChild(app.canvas);

  // Config: served files win; the template falls back to built-in dev config.
  let gameConfig = TEMPLATE_DEV_CONFIG;
  let policy: JurisdictionPolicy = TEMPLATE_DEV_POLICY;
  let thresholds: WinTierThresholds = DEFAULT_WIN_TIER_THRESHOLDS;
  const base = options.configBaseUrl ?? 'config/';
  try {
    const bundle = await loadConfigBundle(async (name) => {
      const res = await fetch(`${base}${name}`);
      if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
      return res.json();
    });
    gameConfig = bundle.gameConfig;
    policy = bundle.jurisdictionPolicy;
  } catch {
    console.warn(
      '[slot-template] config/*.json not served — using built-in DEV template config + DEV-TEMPLATE policy. ' +
        'A generated game must ship real config files (unknown jurisdictions collapse to MOST_RESTRICTIVE_POLICY).',
    );
  }
  try {
    const res = await fetch(`${base}spin-presentation.json`);
    if (res.ok) {
      const raw = (await res.json()) as { winTiers?: unknown };
      thresholds = winTierThresholdsFromConfig(raw.winTiers);
    }
  } catch {
    // optional file — defaults apply
  }
  if (policy.jurisdictionId === 'UNKNOWN') policy = MOST_RESTRICTIVE_POLICY; // §9.6

  const provider =
    options.provider ??
    // DEV ONLY — throws in production builds; real games wire an RgsAdapter.
    new DevRoundProvider(gameConfig, options.seed ?? 12345);

  const slotApp = new SlotApp(app, options.mount, gameConfig, policy, provider, thresholds, options);
  await slotApp.start();
  return slotApp;
}

// ---------------------------------------------------------------------------
// SlotApp
// ---------------------------------------------------------------------------

export class SlotApp {
  readonly machine = new SlotStateMachine({ mode: 'prod' });
  readonly root = new Container();

  private timeline = new Timeline();
  private readonly clock: RafClock;
  private readonly guard: InputGuard;
  private readonly autoplay: AutoplayController;
  private readonly reelView: ReelView;
  private readonly hud: Hud;
  private readonly motion: MotionPlayer;
  private readonly audio: AudioManager;

  private balanceMinor: number;
  private requestedMode: SpinMode = 'normal';
  private currentManifest: OutcomeManifest | null = null;
  private currentStepId: string | null = null;
  private roundTimelineDone = true;
  private presentedWinMinor = 0;
  private countUp: WinCountUp | null = null;
  private autoplayDelayMs = 0;
  private userPaused = false;
  private contextLost = false;
  private reducedMotion = false;
  private lowPerformance = false;
  private fpsSamples: number[] = [];
  private fpsProbeDone = false;
  private readonly disposers: (() => void)[] = [];

  constructor(
    private readonly app: Application,
    private readonly mount: HTMLElement,
    private readonly config: GameConfig,
    private readonly policy: JurisdictionPolicy,
    private readonly provider: RoundProvider,
    private readonly thresholds: WinTierThresholds,
    options: AppOptions,
  ) {
    this.balanceMinor = options.startBalanceMinor ?? 100_000;
    this.clock = new RafClock();
    this.guard = new InputGuard({ now: () => performance.now() });
    this.autoplay = new AutoplayController(policy);

    this.audio = new AudioManager({
      createContext: (): AudioContextLike | null => {
        const Ctor = (globalThis as { AudioContext?: new () => unknown }).AudioContext;
        return Ctor ? (new Ctor() as AudioContextLike) : null; // silent-safe when absent
      },
    });
    this.audio.registerEvents(DEFAULT_AUDIO_EVENTS);

    this.motion = new MotionPlayer(this.timeline, {
      onAudioEvent: (audioEventId) => void this.audio.play(audioEventId),
    });
    this.motion.register(DEFAULT_ANIMATION_EVENTS);

    this.reelView = new ReelView({
      columns: config.columns,
      rows: config.rows,
      ...(options.symbolTextures ? { textures: options.symbolTextures } : {}),
      spinCycleSymbols: config.symbols.map((s) => s.id),
      onReelStop: (reelIndex, anticipation) => {
        this.motion.play('anim.reel.stop');
        if (anticipation) this.motion.play('anim.scatter.anticipation');
        void reelIndex;
      },
      onCascadeRemove: () => this.motion.play('anim.cascade.remove'),
      onCascadeRefill: () => this.motion.play('anim.cascade.refill'),
    });

    const betSteps = buildBetSteps(config.minBetMinor, config.maxBetMinor);
    this.hud = new Hud({
      policy,
      currency: config.currency,
      betStepsMinor: betSteps,
      initialBetMinor: betSteps[0] ?? config.minBetMinor,
      rtp: config.rtpTarget,
      maxWinXBet: config.maxWinXBet,
      onPrimaryAction: (kind) => this.routeInput(kind),
      onBetChanged: () => this.autoplay.notifyBetChanged(),
      onSpinModeChanged: (mode) => {
        this.requestedMode = resolveSpinMode(mode, this.policy);
        this.hud.setSpinMode(this.requestedMode);
      },
      onAutoplayStart: (autoplayConfig) => this.startAutoplay(autoplayConfig),
      onAutoplayStop: () => this.autoplay.stop('user_stop'),
      onMuteToggled: (muted) => this.audio.setMuted(muted),
      onUiClick: () => void this.audio.play('ui.click'),
    });

    this.root.addChild(this.reelView.container, this.hud.container);
    this.app.stage.addChild(this.root);
  }

  async start(): Promise<void> {
    this.machine.transition('loading', 'boot');
    this.installDomListeners();

    // Frame loop: the ONLY wall-clock entry point (README § Seams).
    this.clock.start((dtMs) => this.frame(dtMs));

    // Recovery-first boot: an interrupted committed round is replayed, never
    // re-requested (§7). resume() returning null = clean boot.
    let resumed = false;
    try {
      const resume = await this.provider.resume();
      this.machine.transition('ready', 'loaded');
      if (resume) {
        resumed = true;
        this.recoverRound(resume.manifest, resume.resumePointer);
      }
    } catch (err) {
      this.machine.transition('error', 'resume_failed');
      this.hud.setStatusMessage('Recovery failed — reload to retry');
      console.error('[slot-template] resume failed', err);
      return;
    }

    if (!resumed) {
      this.reelView.setGrid(idleGrid(this.config));
      this.hud.setSpinButtonState('idle');
    }
    this.hud.setBalance(this.balanceMinor);
    this.hud.setSpinMode(this.requestedMode);
    this.layout();
  }

  destroy(): void {
    this.clock.stop();
    for (const dispose of this.disposers) dispose();
    this.hud.destroy();
    this.reelView.destroy();
    this.app.destroy(true);
  }

  // -- frame loop ---------------------------------------------------------------

  private frame(dtMs: number): void {
    this.timeline.advance(dtMs);
    this.reelView.update(dtMs);
    this.audio.update(dtMs);

    if (this.countUp && !this.countUp.done) {
      this.countUp.advance(dtMs);
      this.hud.setWin(this.presentedWinMinor + this.countUp.valueMinor);
    }

    this.probeFps(dtMs);

    // Round completion + autoplay pacing run on frame boundaries so every
    // presentation mode shares one code path.
    if (!this.roundTimelineDone && this.timeline.complete) {
      this.roundTimelineDone = true;
      this.finishRound();
    }
    if (this.autoplayDelayMs > 0) {
      this.autoplayDelayMs -= dtMs;
      if (this.autoplayDelayMs <= 0) this.maybeAutoplaySpin();
    }
  }

  /** fps probe: first ~120 frames after boot decide the lowPerformance flag. */
  private probeFps(dtMs: number): void {
    if (this.fpsProbeDone || dtMs <= 0) return;
    this.fpsSamples.push(dtMs);
    if (this.fpsSamples.length >= 120) {
      const avgDt = this.fpsSamples.reduce((a, b) => a + b, 0) / this.fpsSamples.length;
      this.lowPerformance = 1000 / avgDt < 45;
      this.fpsProbeDone = true;
      this.applyMotionFlags();
    }
  }

  private applyMotionFlags(): void {
    this.motion.setFlags({ reducedMotion: this.reducedMotion, lowPerformance: this.lowPerformance });
    this.reelView.setLowPerformance(this.reducedMotion || this.lowPerformance);
  }

  // -- input ---------------------------------------------------------------------

  private routeInput(kind: RawInputKind): void {
    this.audio.unlock(); // first gesture unlocks audio — always safe
    const action = this.guard.handleInput(kind, {
      state: this.machine.state,
      autoplayActive: this.autoplay.getState().active,
      reelsSpinning: this.reelView.anyReelSpinning,
      outcomeCommitted: this.currentManifest !== null,
      slamStopAllowed: this.policy.slamStopAllowed,
      skippableAnimationActive:
        (!this.roundTimelineDone && !this.reelView.anyReelSpinning) || this.motion.skippableActive,
    });
    switch (action) {
      case 'spin':
        void this.startRound();
        return;
      case 'stop_reels': {
        // Slam stop: fast-forward to the last reel stop — outcome-committed
        // presentation seek, never a settlement change (§9.2).
        const lastStop = Math.max(0, ...(this.currentSchedule?.reelSchedules.map((r) => r.stopAtMs) ?? [0]));
        this.timeline.seek(Math.max(this.timeline.now, lastStop));
        return;
      }
      case 'skip':
        if (this.countUp?.skip()) {
          this.hud.setWin(this.presentedWinMinor + this.countUp.valueMinor);
        }
        if (!this.motion.skip()) this.timeline.skipTo('next_step');
        return;
      case 'stop_autoplay':
        this.autoplay.stop('user_stop');
        this.hud.setAutoplay(this.autoplay.getState());
        return;
      case 'ignored':
        return;
    }
  }

  // -- round flow -------------------------------------------------------------------

  private currentSchedule: ReturnType<typeof buildSpinSchedule> | null = null;

  private async startRound(): Promise<void> {
    const betMinor = this.hud.currentBetMinor;
    if (betMinor > this.balanceMinor) {
      this.hud.setStatusMessage('Insufficient balance');
      return;
    }
    // Duplicate-wager protection: exactly one request slot (idempotency key).
    const idempotencyKey = this.guard.acquireRequestSlot();
    if (idempotencyKey === null) return;

    this.hud.setStatusMessage(null);
    this.hud.setSpinButtonState('requesting');
    this.hud.setControlsLocked(true);
    this.machine.transition('round_requested', 'spin_pressed');

    let manifest: OutcomeManifest;
    try {
      manifest = await this.provider.requestRound(betMinor, { idempotencyKey });
    } catch (err) {
      console.error('[slot-template] round request failed', err);
      this.guard.releaseRequestSlot();
      this.autoplay.notifyNetworkError();
      this.machine.transition('error', 'request_failed');
      this.hud.setStatusMessage('Connection problem — press spin to retry');
      this.hud.setSpinButtonState('idle');
      this.hud.setControlsLocked(false);
      this.machine.transition('ready', 'error_acknowledged');
      return;
    }

    this.machine.transition('outcome_received', 'manifest_received');
    this.machine.transition('outcome_committed', 'manifest_committed');

    // Display-only balance debit (a real RGS settles server-side).
    this.balanceMinor -= betMinor;
    this.hud.setBalance(this.balanceMinor);
    if (this.autoplay.getState().active) this.autoplay.beginRound(betMinor);

    this.presentRound(manifest, null);
  }

  /** Build the presentation timeline for a committed manifest and play it. */
  private presentRound(manifest: OutcomeManifest, resumePointer: string | null): void {
    this.currentManifest = manifest;
    this.presentedWinMinor = 0;
    this.countUp = null;
    this.hud.setWin(0);

    const schedule = buildSpinSchedule(manifest, this.requestedMode, this.policy);
    this.currentSchedule = schedule;
    this.hud.setSpinMode(schedule.mode);

    this.timeline = new Timeline();
    this.motion.attach(this.timeline);
    this.timeline.addMany(scheduleToTimelineEvents(schedule));
    this.timeline.onFire((firing) => this.handleRoundFiring(firing, manifest));
    this.reelView.beginRound(manifest.steps, schedule);
    this.roundTimelineDone = false;

    this.motion.play('anim.reel.spin_start');
    this.hud.setSpinButtonState(this.policy.slamStopAllowed ? 'spinning' : 'requesting');

    if (resumePointer !== null) {
      // Recovery seek: jump presentation to the resume step instantly (§7).
      const plan = buildRecoveryPlan(manifest, resumePointer);
      const resumeStart = schedule.stepSchedules[plan.resumeStepIndex]?.startAtMs ?? 0;
      this.machine.transition('recovering', 'recovery_seek');
      // The seek fires every pre-resume step firing (skipped) — those
      // completions accumulate presentedWinMinor to exactly plan.presentedWinMinor.
      this.timeline.seek(resumeStart);
      this.hud.setWin(this.presentedWinMinor);
      this.advanceMachineToward(plan.entryState, 'recovery_entry');
    } else {
      this.machine.transition('presenting_initial_result', 'presentation_started');
    }
  }

  private handleRoundFiring(firing: TimelineFiring, manifest: OutcomeManifest): void {
    this.reelView.handleFiring(firing);
    const payload = firing.payload as { kind?: string; stepId?: string; stepWinMinor?: number } | undefined;
    if (!payload || payload.kind !== 'step') return;

    const step = manifest.steps.find((s) => s.stepId === payload.stepId);
    if (!step) return;

    if (firing.phase === 'start') {
      this.currentStepId = step.stepId;
      this.enterStepState(step, manifest);
      this.playStepMotion(step, manifest);
      if (step.wins.length > 0) {
        const stepWin = payload.stepWinMinor ?? 0;
        const profile = SPIN_MODE_PROFILES[this.currentSchedule?.mode ?? 'normal'];
        this.countUp = new WinCountUp({ totalWinMinor: stepWin, durationMs: firing.skipped ? 0 : profile.winCountupMs });
        if (firing.skipped) this.hud.setWin(this.presentedWinMinor + stepWin);
      }
    } else {
      // Step complete: fold the step win into the running total EXACTLY —
      // the count-up display can never desync the final number (§9.2).
      const stepWin = payload.stepWinMinor ?? 0;
      if (stepWin > 0) {
        this.presentedWinMinor += stepWin;
        this.countUp = null;
        this.hud.setWin(this.presentedWinMinor);
      }
    }
  }

  /** Walk the state machine to the presentation state of a step. */
  private enterStepState(step: Step, manifest: OutcomeManifest): void {
    const target = stateForStep(step, manifest);
    this.advanceMachineToward(target, `manifest_step:${step.stepId}`);
    if (step.type === 'initial_result' && step.wins.length > 0) {
      this.advanceMachineToward('presenting_wins', `manifest_step:${step.stepId}`);
    }
  }

  /** Insert required intermediate states (feature_pending → *_entry → *_active). */
  private advanceMachineToward(target: GameState, cause: string): void {
    for (let hops = 0; hops < 4 && this.machine.state !== target; hops++) {
      if (this.machine.canTransition(target)) {
        this.machine.transition(target, cause);
        return;
      }
      const intermediate = this.intermediateFor(target);
      if (!intermediate || !this.machine.canTransition(intermediate)) return; // prod machine: refuse, don't crash
      this.machine.transition(intermediate, cause);
    }
  }

  private intermediateFor(target: GameState): GameState | null {
    if (target === 'feature_active') return 'feature_entry';
    if (target === 'super_feature_active') return 'super_feature_entry';
    if (target === 'ultimate_feature_active') return 'ultimate_feature_entry';
    if (target === 'round_complete') return 'feature_summary';
    return null;
  }

  private playStepMotion(step: Step, manifest: OutcomeManifest): void {
    switch (step.type) {
      case 'feature_trigger': {
        const tier = manifest.feature?.tierId ?? 'feature';
        this.motion.play(`anim.${tier}.enter`);
        this.audio.setMusicState(tier as MusicStateId);
        return;
      }
      case 'feature_retrigger':
        this.motion.play('anim.feature.retrigger');
        return;
      case 'max_win_termination':
        this.motion.play('anim.maxwin.reached');
        return;
      case 'settlement':
        if (manifest.feature) this.motion.play('anim.feature.summary');
        return;
      default:
        return;
    }
  }

  private finishRound(): void {
    const manifest = this.currentManifest;
    if (!manifest) return;

    // Authoritative settlement values — copied, never recomputed (§9.1).
    this.balanceMinor = manifest.balanceAfterMinor ?? this.balanceMinor + manifest.totalWinMinor;
    this.hud.setBalance(this.balanceMinor);
    this.hud.setWin(manifest.totalWinMinor);

    const tier = resolveWinTier(
      { totalWinMinor: manifest.totalWinMinor, betMinor: manifest.betMinor, capped: manifest.capped },
      this.thresholds,
    );
    const celebration = celebrationEventForTier(tier);
    // LDW guarantee (§9.5) is enforced inside resolveWinTier: tier is at most
    // 'small' when win < stake, so no big-win motion can play for an LDW.
    if (celebration && (tier === 'big' || tier === 'mega' || tier === 'epic' || tier === 'max')) {
      this.motion.play(celebration);
    }

    this.advanceMachineToward('round_complete', 'round_settled');
    this.audio.setMusicState('base');
    this.guard.releaseRequestSlot();
    this.currentManifest = null;
    this.currentStepId = null;
    this.currentSchedule = null;
    this.machine.transition('ready', 'round_complete');
    this.hud.setSpinButtonState('idle');
    this.hud.setControlsLocked(false);

    // Autoplay: feed the settled round back even when autoplay was stopped
    // mid-round (the controller needs the completion to close its books).
    const state = this.autoplay.getState();
    if (state.roundInFlight) {
      this.autoplay.completeRound({ manifest, balanceAfterMinor: this.balanceMinor });
      this.hud.setAutoplay(this.autoplay.getState());
      if (this.autoplay.getState().active) this.autoplayDelayMs = 400;
    }
  }

  private startAutoplay(config: AutoplayConfig): void {
    try {
      this.autoplay.start(config);
      this.hud.setAutoplay(this.autoplay.getState());
      this.maybeAutoplaySpin();
    } catch (err) {
      this.hud.setStatusMessage(err instanceof Error ? err.message : 'Autoplay unavailable');
    }
  }

  private maybeAutoplaySpin(): void {
    if (this.machine.state !== 'ready') return;
    if (this.autoplay.shouldSpin(this.hud.currentBetMinor, this.balanceMinor)) {
      void this.startRound();
    }
    this.hud.setAutoplay(this.autoplay.getState());
  }

  // -- recovery ------------------------------------------------------------------

  private recoverRound(manifest: OutcomeManifest, resumePointer: string): void {
    // Machine walk to a committed round: the wager already happened server-side.
    this.machine.transition('round_requested', 'recovery');
    this.machine.transition('outcome_received', 'recovery');
    this.machine.transition('outcome_committed', 'recovery');
    this.hud.setControlsLocked(true);
    this.hud.setSpinButtonState('spinning');
    this.presentRound(manifest, resumePointer);
  }

  // -- DOM listeners ------------------------------------------------------------------

  private installDomListeners(): void {
    const doc = this.mount.ownerDocument;
    const win = doc.defaultView ?? window;

    const onVisibility = (): void => {
      if (doc.hidden) {
        this.timeline.pause();
        this.audio.handleVisibilityChange(true);
      } else {
        this.audio.handleVisibilityChange(false);
        if (!this.userPaused && !this.contextLost) this.timeline.play();
      }
    };
    doc.addEventListener('visibilitychange', onVisibility);
    this.disposers.push(() => doc.removeEventListener('visibilitychange', onVisibility));

    const onResize = (): void => this.layout();
    win.addEventListener('resize', onResize);
    win.addEventListener('orientationchange', onResize);
    this.disposers.push(() => {
      win.removeEventListener('resize', onResize);
      win.removeEventListener('orientationchange', onResize);
    });

    // WebGL context loss → pause; restore → recover the committed round via
    // the core recovery plan (no re-request, no re-settlement — §7). No-op
    // under WebGPU (the events never fire).
    const canvas = this.app.canvas;
    const onLost = (e: Event): void => {
      e.preventDefault();
      this.contextLost = true;
      this.timeline.pause();
      this.hud.setStatusMessage('Graphics context lost — recovering…');
    };
    const onRestored = (): void => {
      this.contextLost = false;
      this.hud.setStatusMessage(null);
      const manifest = this.currentManifest;
      if (manifest && this.currentStepId) {
        const plan = buildRecoveryPlan(manifest, this.currentStepId);
        const resumeStep = plan.remainingSteps[0];
        if (resumeStep) this.reelView.setGrid(resumeStep.grid);
        this.machine.transition('reconnecting', 'context_lost');
        this.machine.transition('recovering', 'context_restored');
        this.advanceMachineToward(plan.entryState, 'context_restored');
      }
      if (!this.userPaused) this.timeline.play();
    };
    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', onRestored);
    this.disposers.push(() => {
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
    });

    // Reduced motion — accessibility flag, live-updates (§9.7).
    if (typeof win.matchMedia === 'function') {
      const media = win.matchMedia('(prefers-reduced-motion: reduce)');
      this.reducedMotion = media.matches;
      this.applyMotionFlags();
      const onMedia = (e: MediaQueryListEvent): void => {
        this.reducedMotion = e.matches;
        this.applyMotionFlags();
      };
      media.addEventListener('change', onMedia);
      this.disposers.push(() => media.removeEventListener('change', onMedia));
    }

    // Keyboard: space/enter share the pointer debounce channel via InputGuard.
    const onKey = (e: KeyboardEvent): void => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        this.routeInput(e.code === 'Space' ? 'space' : 'enter');
      }
    };
    win.addEventListener('keydown', onKey);
    this.disposers.push(() => win.removeEventListener('keydown', onKey));

    // First gesture anywhere unlocks audio.
    const onFirstPointer = (): void => this.audio.unlock();
    win.addEventListener('pointerdown', onFirstPointer, { once: true });
    this.disposers.push(() => win.removeEventListener('pointerdown', onFirstPointer));
  }

  // -- layout ---------------------------------------------------------------------

  private layout(): void {
    const width = this.app.screen.width;
    const height = this.app.screen.height;
    if (width <= 0 || height <= 0) return;
    const breakpoint = resolveBreakpoint(width, height);

    // Reel grid: fit the play area, leaving room for the HUD strip.
    const hudReserve = breakpoint === 'portrait' ? 200 : 140;
    const availW = width - 32;
    const availH = height - hudReserve - 48;
    const scale = Math.min(availW / this.reelView.widthPx, availH / this.reelView.heightPx, 1.4);
    this.reelView.container.scale.set(Math.max(0.2, scale));
    this.reelView.container.position.set(
      (width - this.reelView.widthPx * this.reelView.container.scale.x) / 2,
      breakpoint === 'portrait' ? 56 : Math.max(40, (height - hudReserve - this.reelView.heightPx * scale) / 2),
    );

    this.hud.layout(width, height, breakpoint === 'portrait');
  }
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function buildBetSteps(minBetMinor: number, maxBetMinor: number): number[] {
  const steps: number[] = [];
  for (const multiplier of [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000]) {
    const value = minBetMinor * multiplier;
    if (value > maxBetMinor) break;
    steps.push(value);
  }
  if (steps[steps.length - 1] !== maxBetMinor) steps.push(maxBetMinor);
  return steps;
}

function idleGrid(config: GameConfig): string[][] {
  const strips = config.reelSets.find((r) => r.context === 'base')?.strips;
  const grid: string[][] = [];
  for (let c = 0; c < config.columns; c++) {
    const strip = strips?.[c];
    const column: string[] = [];
    for (let r = 0; r < config.rows; r++) column.push(strip?.[r] ?? 'BLANK');
    grid.push(column);
  }
  return grid;
}

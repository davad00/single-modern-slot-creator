/**
 * Motion player — plays animation-event configs (CONVENTIONS §4.3 event ids,
 * §9.8 required fields) on the deterministic core Timeline.
 *
 * PURE presentation logic: no PixiJS, no DOM, no wall clock. Renderers sample
 * `progress(instanceId)` against `timeline.now` to position sprites; tests
 * drive the timeline with a TestClock. Skipping delegates to the timeline's
 * fast-forward, so every game-logic firing still fires (flagged `skipped`) and
 * outcomes can never change (§9.2).
 *
 * Accessibility / performance (§9.7, §9.8): every event carries a
 * reducedMotion and a lowPerformance variant; `prefers-reduced-motion` takes
 * precedence over the fps-probe flag. Variants are resolved at play() time.
 */

import type { SkipTarget, Timeline, TimelineFiring } from '../core/timeline.js';

// ---------------------------------------------------------------------------
// Easing library — standard set, implemented as pure fns of t ∈ [0, 1].
// (GSAP-style names, zero runtime dependency — CONVENTIONS §8.)
// ---------------------------------------------------------------------------

export type EasingFn = (t: number) => number;

const BACK_C1 = 1.70158;
const BACK_C2 = BACK_C1 * 1.525;
const BACK_C3 = BACK_C1 + 1;
const ELASTIC_C4 = (2 * Math.PI) / 3;

export const easings = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => 1 - (1 - t) * (1 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2),
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => 1 - (1 - t) ** 3,
  easeInOutCubic: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
  easeInQuart: (t: number) => t ** 4,
  easeOutQuart: (t: number) => 1 - (1 - t) ** 4,
  easeOutExpo: (t: number) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t)),
  easeInBack: (t: number) => BACK_C3 * t * t * t - BACK_C1 * t * t,
  easeOutBack: (t: number) => 1 + BACK_C3 * (t - 1) ** 3 + BACK_C1 * (t - 1) ** 2,
  easeInOutBack: (t: number) =>
    t < 0.5
      ? ((2 * t) ** 2 * ((BACK_C2 + 1) * 2 * t - BACK_C2)) / 2
      : ((2 * t - 2) ** 2 * ((BACK_C2 + 1) * (t * 2 - 2) + BACK_C2) + 2) / 2,
  easeOutElastic: (t: number) =>
    t <= 0 ? 0 : t >= 1 ? 1 : 2 ** (-10 * t) * Math.sin((t * 10 - 0.75) * ELASTIC_C4) + 1,
  easeOutBounce: (t: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
} satisfies Record<string, EasingFn>;

export type EasingName = keyof typeof easings;

// ---------------------------------------------------------------------------
// Animation-event config — the full §9.8 field set.
// ---------------------------------------------------------------------------

export type HapticEventId = 'haptic.light' | 'haptic.medium' | 'haptic.heavy';

export type MotionRecovery = 'snap_to_end' | 'replay' | 'skip';

/** Variant override for reducedMotion / lowPerformance modes. */
export interface MotionVariant {
  durationMs?: number;
  easing?: EasingName;
  /** True ⇒ the event runs instantly (0 ms) and fires no audio/haptics. */
  disabled?: boolean;
}

export interface AnimationEventConfig {
  /** `anim.<context>.<name>` per CONVENTIONS §4.3. */
  eventId: string;
  durationMs: number;
  easing: EasingName;
  skippable: boolean;
  /**
   * Where a skip seeks: a structural timeline target, or undefined = the end
   * of this event only.
   */
  skipTo?: SkipTarget;
  blocksInput: boolean;
  /** Higher fires first among same-time timeline firings. */
  priority: number;
  /** Audio event id (§4.3) fired at motion start (never on skipped firings). */
  audioEvent?: string;
  haptic?: HapticEventId;
  reducedMotion: MotionVariant;
  lowPerformance: MotionVariant;
  /** Behaviour after interruption (tab suspend / context loss). */
  recovery: MotionRecovery;
}

export interface MotionFlags {
  reducedMotion: boolean;
  lowPerformance: boolean;
}

export interface ResolvedVariant {
  durationMs: number;
  easing: EasingName;
  disabled: boolean;
}

/**
 * Resolve the effective duration/easing for the current flags.
 * reducedMotion (accessibility) takes precedence over lowPerformance.
 */
export function resolveVariant(config: AnimationEventConfig, flags: MotionFlags): ResolvedVariant {
  const variant: MotionVariant | undefined = flags.reducedMotion
    ? config.reducedMotion
    : flags.lowPerformance
      ? config.lowPerformance
      : undefined;
  const disabled = variant?.disabled ?? false;
  return {
    durationMs: disabled ? 0 : (variant?.durationMs ?? config.durationMs),
    easing: variant?.easing ?? config.easing,
    disabled,
  };
}

// ---------------------------------------------------------------------------
// Motion player
// ---------------------------------------------------------------------------

export interface MotionInstance {
  instanceId: string;
  eventId: string;
  config: AnimationEventConfig;
  startAtMs: number;
  durationMs: number;
  easing: EasingName;
  disabled: boolean;
  /** start firing seen, complete firing not yet seen. */
  active: boolean;
  finished: boolean;
}

export interface MotionPlayerOptions {
  flags?: MotionFlags;
  /** Fired once per motion start (duplicate-audio protection: never re-fired on skip). */
  onAudioEvent?: (audioEventId: string, ctx: { eventId: string; instanceId: string }) => void;
  onHaptic?: (haptic: HapticEventId, ctx: { eventId: string; instanceId: string }) => void;
}

export interface PlayOptions {
  /** Timeline time to start at; default = timeline.now. */
  atMs?: number;
  payload?: unknown;
}

export class MotionPlayer {
  private timeline: Timeline;
  private detach: (() => void) | null = null;
  private flags: MotionFlags;
  private readonly configs = new Map<string, AnimationEventConfig>();
  private readonly instances = new Map<string, MotionInstance>();
  private seq = 0;
  private readonly onAudioEvent: MotionPlayerOptions['onAudioEvent'];
  private readonly onHaptic: MotionPlayerOptions['onHaptic'];

  constructor(timeline: Timeline, options: MotionPlayerOptions = {}) {
    this.timeline = timeline;
    this.flags = options.flags ?? { reducedMotion: false, lowPerformance: false };
    this.onAudioEvent = options.onAudioEvent;
    this.onHaptic = options.onHaptic;
    this.detach = timeline.onFire((f) => this.handleFiring(f));
  }

  /** Register configs. Duplicate event ids throw (duplicate-event protection). */
  register(configs: readonly AnimationEventConfig[]): void {
    for (const config of configs) {
      if (this.configs.has(config.eventId)) {
        throw new Error(`animation event "${config.eventId}" already registered`);
      }
      if (!config.eventId.startsWith('anim.')) {
        throw new Error(`animation event id "${config.eventId}" must match anim.<context>.<name> (§4.3)`);
      }
      this.configs.set(config.eventId, config);
    }
  }

  getConfig(eventId: string): AnimationEventConfig | undefined {
    return this.configs.get(eventId);
  }

  setFlags(flags: MotionFlags): void {
    this.flags = flags;
  }

  getFlags(): MotionFlags {
    return this.flags;
  }

  /**
   * Rounds get a fresh Timeline; re-attach the player instead of rebuilding
   * it (configs survive, in-flight instances are dropped).
   */
  attach(timeline: Timeline): void {
    this.detach?.();
    this.timeline = timeline;
    this.instances.clear();
    this.detach = timeline.onFire((f) => this.handleFiring(f));
  }

  /**
   * Schedule one play of a registered animation event. The variant for the
   * CURRENT flags is resolved now (flag changes affect future plays only).
   * Returns the instance id used on the timeline.
   */
  play(eventId: string, options: PlayOptions = {}): string {
    const config = this.configs.get(eventId);
    if (!config) throw new Error(`animation event "${eventId}" is not registered`);
    const variant = resolveVariant(config, this.flags);
    const instanceId = `${eventId}#${++this.seq}`;
    const at = options.atMs ?? this.timeline.now;
    this.instances.set(instanceId, {
      instanceId,
      eventId,
      config,
      startAtMs: at,
      durationMs: variant.durationMs,
      easing: variant.easing,
      disabled: variant.disabled,
      active: false,
      finished: false,
    });
    this.timeline.add({
      id: instanceId,
      at,
      duration: variant.durationMs,
      priority: config.priority,
      ...(options.payload !== undefined ? { payload: options.payload } : {}),
    });
    return instanceId;
  }

  /**
   * Eased progress ∈ [0, 1] of an instance at the timeline's current time.
   * Renderers call this every frame. Unknown/finished instances read 1.
   */
  progress(instanceId: string): number {
    const inst = this.instances.get(instanceId);
    if (!inst || inst.finished) return 1;
    if (inst.durationMs <= 0) return this.timeline.now >= inst.startAtMs ? 1 : 0;
    const raw = (this.timeline.now - inst.startAtMs) / inst.durationMs;
    const clamped = raw <= 0 ? 0 : raw >= 1 ? 1 : raw;
    return easings[inst.easing](clamped);
  }

  getInstance(instanceId: string): MotionInstance | undefined {
    return this.instances.get(instanceId);
  }

  get activeInstances(): MotionInstance[] {
    return [...this.instances.values()].filter((i) => i.active);
  }

  /** True while any active, non-disabled motion declares blocksInput. */
  get inputBlocked(): boolean {
    for (const inst of this.instances.values()) {
      if (inst.active && !inst.disabled && inst.config.blocksInput) return true;
    }
    return false;
  }

  /** True while any active motion is skippable (HUD skip affordance). */
  get skippableActive(): boolean {
    for (const inst of this.instances.values()) {
      if (inst.active && inst.config.skippable) return true;
    }
    return false;
  }

  /**
   * Skip a motion (specific instance, or the highest-priority active
   * skippable one). Honors `skippable`; seeks per `skipTo`:
   *   undefined        → fast-forward to this instance's end
   *   'complete' etc.  → timeline.skipTo(target)
   * Fast-forwarding fires every due firing in order (flagged skipped), so
   * settlement/game callbacks are never lost. Returns false when nothing
   * skippable matched.
   */
  skip(instanceId?: string): boolean {
    let target: MotionInstance | undefined;
    if (instanceId !== undefined) {
      const inst = this.instances.get(instanceId);
      if (inst && inst.active && inst.config.skippable) target = inst;
    } else {
      for (const inst of this.instances.values()) {
        if (!inst.active || !inst.config.skippable) continue;
        if (!target || inst.config.priority > target.config.priority) target = inst;
      }
    }
    if (!target) return false;
    if (target.config.skipTo !== undefined) {
      this.timeline.skipTo(target.config.skipTo);
    } else {
      const endAt = target.startAtMs + target.durationMs;
      this.timeline.seek(Math.max(this.timeline.now, endAt));
    }
    return true;
  }

  /** Drop finished instance records (bounded memory across a session). */
  clearFinished(): void {
    for (const [id, inst] of this.instances) {
      if (inst.finished) this.instances.delete(id);
    }
  }

  private handleFiring(firing: TimelineFiring): void {
    const inst = this.instances.get(firing.eventId);
    if (!inst) return;
    if (firing.phase === 'start') {
      inst.active = true;
      // Duplicate-audio protection: audio/haptics fire on real playback only —
      // a skipped start (fast-forward) is presentation catch-up, not a cue.
      if (!firing.skipped && !inst.disabled) {
        if (inst.config.audioEvent !== undefined) {
          this.onAudioEvent?.(inst.config.audioEvent, { eventId: inst.eventId, instanceId: inst.instanceId });
        }
        if (inst.config.haptic !== undefined) {
          this.onHaptic?.(inst.config.haptic, { eventId: inst.eventId, instanceId: inst.instanceId });
        }
      }
    } else {
      inst.active = false;
      inst.finished = true;
    }
  }
}

// ---------------------------------------------------------------------------
// Default animation-event set — every §4.3 id, full §9.8 field set.
// A generated game replaces these from config/animation-events.json; the
// template ships them inline so it runs with zero config.
// ---------------------------------------------------------------------------

export const DEFAULT_ANIMATION_EVENTS: readonly AnimationEventConfig[] = [
  {
    eventId: 'anim.reel.spin_start',
    durationMs: 250,
    easing: 'easeInQuad',
    skippable: false,
    blocksInput: false,
    priority: 10,
    audioEvent: 'sfx.reel.spin_start',
    reducedMotion: { durationMs: 0, disabled: true },
    lowPerformance: { durationMs: 120 },
    recovery: 'snap_to_end',
  },
  {
    eventId: 'anim.reel.stop',
    durationMs: 180,
    easing: 'easeOutBack',
    skippable: false,
    blocksInput: false,
    priority: 10,
    audioEvent: 'sfx.reel.stop',
    haptic: 'haptic.light',
    reducedMotion: { durationMs: 0 },
    lowPerformance: { durationMs: 90, easing: 'easeOutQuad' },
    recovery: 'snap_to_end',
  },
  {
    eventId: 'anim.symbol.land',
    durationMs: 220,
    easing: 'easeOutBack',
    skippable: true,
    blocksInput: false,
    priority: 6,
    reducedMotion: { disabled: true },
    lowPerformance: { durationMs: 100, easing: 'easeOutQuad' },
    recovery: 'snap_to_end',
  },
  {
    eventId: 'anim.scatter.land',
    durationMs: 450,
    easing: 'easeOutElastic',
    skippable: true,
    blocksInput: false,
    priority: 7,
    audioEvent: 'sfx.scatter.land',
    haptic: 'haptic.medium',
    reducedMotion: { durationMs: 150, easing: 'easeOutQuad' },
    lowPerformance: { durationMs: 220, easing: 'easeOutQuad' },
    recovery: 'snap_to_end',
  },
  {
    eventId: 'anim.scatter.anticipation',
    durationMs: 1500,
    easing: 'easeInOutQuad',
    skippable: true,
    blocksInput: false,
    priority: 8,
    audioEvent: 'sfx.scatter.anticipation',
    reducedMotion: { durationMs: 500 },
    lowPerformance: { durationMs: 800 },
    recovery: 'skip',
  },
  {
    eventId: 'anim.win.countup',
    durationMs: 1200,
    easing: 'easeOutCubic',
    skippable: true,
    blocksInput: false,
    priority: 5,
    audioEvent: 'sfx.win.countup',
    reducedMotion: { durationMs: 400, easing: 'linear' },
    lowPerformance: { durationMs: 600 },
    recovery: 'snap_to_end',
  },
  {
    eventId: 'anim.win.big',
    durationMs: 2600,
    easing: 'easeOutBack',
    skippable: true,
    skipTo: 'complete',
    blocksInput: true,
    priority: 9,
    audioEvent: 'sfx.win.big',
    haptic: 'haptic.heavy',
    reducedMotion: { durationMs: 900, easing: 'easeOutQuad' },
    lowPerformance: { durationMs: 1400 },
    recovery: 'snap_to_end',
  },
  {
    eventId: 'anim.cascade.remove',
    durationMs: 350,
    easing: 'easeInQuad',
    skippable: true,
    blocksInput: false,
    priority: 6,
    audioEvent: 'sfx.cascade.remove',
    reducedMotion: { durationMs: 120, easing: 'linear' },
    lowPerformance: { durationMs: 180 },
    recovery: 'snap_to_end',
  },
  {
    eventId: 'anim.cascade.refill',
    durationMs: 350,
    easing: 'easeOutCubic',
    skippable: true,
    blocksInput: false,
    priority: 6,
    audioEvent: 'sfx.cascade.refill',
    reducedMotion: { durationMs: 120, easing: 'linear' },
    lowPerformance: { durationMs: 180 },
    recovery: 'snap_to_end',
  },
  {
    eventId: 'anim.feature.enter',
    durationMs: 2400,
    easing: 'easeInOutCubic',
    skippable: true,
    skipTo: 'next_step',
    blocksInput: true,
    priority: 9,
    audioEvent: 'sfx.feature.enter',
    haptic: 'haptic.medium',
    reducedMotion: { durationMs: 800, easing: 'easeInOutQuad' },
    lowPerformance: { durationMs: 1200 },
    recovery: 'snap_to_end',
  },
  {
    eventId: 'anim.super_feature.enter',
    durationMs: 2400,
    easing: 'easeInOutCubic',
    skippable: true,
    skipTo: 'next_step',
    blocksInput: true,
    priority: 9,
    audioEvent: 'sfx.super_feature.enter',
    haptic: 'haptic.medium',
    reducedMotion: { durationMs: 800, easing: 'easeInOutQuad' },
    lowPerformance: { durationMs: 1200 },
    recovery: 'snap_to_end',
  },
  {
    eventId: 'anim.ultimate_feature.enter',
    durationMs: 2400,
    easing: 'easeInOutCubic',
    skippable: true,
    skipTo: 'next_step',
    blocksInput: true,
    priority: 9,
    audioEvent: 'sfx.ultimate_feature.enter',
    haptic: 'haptic.heavy',
    reducedMotion: { durationMs: 800, easing: 'easeInOutQuad' },
    lowPerformance: { durationMs: 1200 },
    recovery: 'snap_to_end',
  },
  {
    eventId: 'anim.feature.retrigger',
    durationMs: 1400,
    easing: 'easeOutBack',
    skippable: true,
    blocksInput: true,
    priority: 8,
    audioEvent: 'sfx.feature.retrigger',
    haptic: 'haptic.medium',
    reducedMotion: { durationMs: 500, easing: 'easeOutQuad' },
    lowPerformance: { durationMs: 700 },
    recovery: 'snap_to_end',
  },
  {
    eventId: 'anim.feature.summary',
    durationMs: 1500,
    easing: 'easeOutCubic',
    skippable: true,
    skipTo: 'summary',
    blocksInput: true,
    priority: 8,
    audioEvent: 'sfx.feature.summary',
    reducedMotion: { durationMs: 600 },
    lowPerformance: { durationMs: 800 },
    recovery: 'snap_to_end',
  },
  {
    eventId: 'anim.maxwin.reached',
    durationMs: 3000,
    easing: 'easeOutBack',
    // Maximum win is the one celebration that always plays out (§9.8 spirit:
    // important feature events preserved) — still seekable via recovery.
    skippable: false,
    blocksInput: true,
    priority: 10,
    audioEvent: 'sfx.maxwin.reached',
    haptic: 'haptic.heavy',
    reducedMotion: { durationMs: 1200, easing: 'easeOutQuad' },
    lowPerformance: { durationMs: 1800 },
    recovery: 'snap_to_end',
  },
];

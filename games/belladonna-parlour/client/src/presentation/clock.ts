/**
 * Clock adapters — the ONLY place presentation time enters the system.
 *
 * The core Timeline never reads a wall clock (README § Seams): something must
 * call `timeline.advance(dtMs)`. In the browser that is RafClock
 * (requestAnimationFrame); in tests it is TestClock (manual ticks), which is
 * what makes every presentation test deterministic and browser-free.
 *
 * No PixiJS imports here — pure modules and tests may import this file.
 */

import type { Timeline } from '../core/timeline.js';

export type TickCallback = (dtMs: number) => void;

export interface ClockDriver {
  /** Begin ticking. Replaces any previous callback. */
  start(onTick: TickCallback): void;
  stop(): void;
  readonly running: boolean;
}

// ---------------------------------------------------------------------------
// requestAnimationFrame clock (browser)
// ---------------------------------------------------------------------------

export interface RafClockOptions {
  /** Injected for tests/older hosts; default globalThis.requestAnimationFrame. */
  requestFrame?: (cb: (t: number) => void) => number;
  cancelFrame?: (handle: number) => void;
  /** Monotonic now() in ms; default performance.now. */
  now?: () => number;
  /**
   * Frame-delta clamp, ms (default 250). After tab suspension / device sleep
   * the first rAF delta can be minutes long; clamping keeps presentation
   * advancing sanely — round recovery is handled by the recovery plan, not by
   * replaying a giant dt.
   */
  maxFrameMs?: number;
}

export class RafClock implements ClockDriver {
  private readonly requestFrame: (cb: (t: number) => void) => number;
  private readonly cancelFrame: (handle: number) => void;
  private readonly now: () => number;
  private readonly maxFrameMs: number;
  private handle: number | null = null;
  private lastMs: number | null = null;
  private callback: TickCallback | null = null;

  constructor(options: RafClockOptions = {}) {
    const g = globalThis as {
      requestAnimationFrame?: (cb: (t: number) => void) => number;
      cancelAnimationFrame?: (handle: number) => void;
      performance?: { now(): number };
    };
    const raf = options.requestFrame ?? g.requestAnimationFrame?.bind(globalThis);
    const caf = options.cancelFrame ?? g.cancelAnimationFrame?.bind(globalThis);
    if (!raf || !caf) {
      throw new Error('RafClock requires requestAnimationFrame (inject requestFrame/cancelFrame outside browsers)');
    }
    this.requestFrame = raf;
    this.cancelFrame = caf;
    this.now = options.now ?? (g.performance ? () => g.performance!.now() : () => Date.now());
    this.maxFrameMs = options.maxFrameMs ?? 250;
    if (this.maxFrameMs <= 0) throw new RangeError('maxFrameMs must be > 0');
  }

  start(onTick: TickCallback): void {
    this.callback = onTick;
    if (this.handle !== null) return;
    this.lastMs = null;
    const loop = (): void => {
      this.handle = this.requestFrame(() => {
        const t = this.now();
        const dt = this.lastMs === null ? 0 : Math.min(this.maxFrameMs, Math.max(0, t - this.lastMs));
        this.lastMs = t;
        this.callback?.(dt);
        if (this.handle !== null) loop();
      });
    };
    loop();
  }

  stop(): void {
    if (this.handle !== null) {
      this.cancelFrame(this.handle);
      this.handle = null;
    }
    this.lastMs = null;
  }

  get running(): boolean {
    return this.handle !== null;
  }
}

// ---------------------------------------------------------------------------
// Manual-tick clock (tests)
// ---------------------------------------------------------------------------

export class TestClock implements ClockDriver {
  private callback: TickCallback | null = null;
  private isRunning = false;
  private elapsed = 0;

  start(onTick: TickCallback): void {
    this.callback = onTick;
    this.isRunning = true;
  }

  stop(): void {
    this.isRunning = false;
  }

  get running(): boolean {
    return this.isRunning;
  }

  /** Total ms ticked since construction. */
  get elapsedMs(): number {
    return this.elapsed;
  }

  /** Deliver one tick of dtMs (no-op unless started). */
  tick(dtMs: number): void {
    if (!Number.isFinite(dtMs) || dtMs < 0) throw new RangeError('tick(dt): dt must be ≥ 0');
    if (!this.isRunning) return;
    this.elapsed += dtMs;
    this.callback?.(dtMs);
  }

  /** Deliver `count` ticks of dtMs each (e.g. tickMany(60, 16) ≈ one second). */
  tickMany(count: number, dtMs: number): void {
    for (let i = 0; i < count; i++) this.tick(dtMs);
  }
}

/**
 * Wire a clock to a timeline (plus optional per-frame subscribers such as
 * ReelView.update / AudioManager.update). Returns a disposer.
 */
export function driveTimeline(clock: ClockDriver, timeline: Timeline, alsoTick?: TickCallback): () => void {
  clock.start((dtMs) => {
    timeline.advance(dtMs);
    alsoTick?.(dtMs);
  });
  return () => clock.stop();
}

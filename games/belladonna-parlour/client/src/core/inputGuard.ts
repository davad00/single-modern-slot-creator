/**
 * Rapid-input protection (prompt lines 1426-1450).
 *
 * Translates raw player inputs (pointer / touch / space / enter) into at most
 * ONE well-defined action, with:
 *   - debounce across all spin-intent channels (touch → synthetic click,
 *     key auto-repeat, button mashing)
 *   - round-in-progress locking (never two concurrent wagers)
 *   - duplicate-request protection via a single pending idempotency key
 *   - skip-vs-stop disambiguation:
 *       reels still travelling + outcome committed + slam allowed → stop_reels
 *       skippable presentation running                            → skip
 *       autoplay active                                            → stop_autoplay
 *       ready + no pending request                                 → spin
 *       anything else                                              → ignored
 *
 * Pure logic — the clock is injected so tests are deterministic.
 */

import type { GameState } from './stateMachine.js';
import { isAuthoritative } from './stateMachine.js';

export type RawInputKind = 'pointer' | 'touch' | 'space' | 'enter';

export type InputAction = 'spin' | 'stop_reels' | 'skip' | 'stop_autoplay' | 'ignored';

export interface InputContext {
  state: GameState;
  autoplayActive: boolean;
  /** Reel travel animation still running (outcome may already be committed). */
  reelsSpinning: boolean;
  /** The outcome manifest for the round has been committed. */
  outcomeCommitted: boolean;
  /** Jurisdiction gate: slam stop permitted. */
  slamStopAllowed: boolean;
  /** A skippable presentation (win count-up, cascade, transition) is active. */
  skippableAnimationActive: boolean;
}

export interface InputGuardOptions {
  /** Monotonic clock in ms (injected for testability). */
  now: () => number;
  /** Minimum ms between accepted inputs on the shared channel. Default 200. */
  debounceMs?: number;
}

export class InputGuard {
  private readonly now: () => number;
  private readonly debounceMs: number;
  private lastAcceptedAtMs = Number.NEGATIVE_INFINITY;
  private pendingRequestKey: string | null = null;
  private requestCounter = 0;

  constructor(options: InputGuardOptions) {
    this.now = options.now;
    this.debounceMs = options.debounceMs ?? 200;
    if (this.debounceMs < 0) throw new RangeError('debounceMs must be ≥ 0');
  }

  /**
   * Classify one raw input. All four input kinds share ONE debounce channel:
   * a touch that also fires a synthetic pointer event, or Enter+Space mashing,
   * must not produce two actions.
   */
  handleInput(kind: RawInputKind, ctx: InputContext): InputAction {
    void kind; // all kinds share the same channel by design
    const t = this.now();
    if (t - this.lastAcceptedAtMs < this.debounceMs) return 'ignored';

    const action = this.classify(ctx);
    if (action !== 'ignored') this.lastAcceptedAtMs = t;
    return action;
  }

  private classify(ctx: InputContext): InputAction {
    // Manual input during autoplay = stop autoplay, nothing else.
    if (ctx.autoplayActive) return 'stop_autoplay';

    // Waiting on the server (round_requested/outcome_received…): input is
    // meaningless and MUST NOT queue wagers or skips.
    if (isAuthoritative(ctx.state) && ctx.state !== 'round_complete') {
      // Exception: reel-stop is allowed once the outcome is committed.
      if (!(ctx.state === 'outcome_committed' && ctx.reelsSpinning)) return 'ignored';
    }

    // Skip-vs-stop disambiguation.
    if (ctx.reelsSpinning) {
      return ctx.outcomeCommitted && ctx.slamStopAllowed ? 'stop_reels' : 'ignored';
    }
    if (ctx.skippableAnimationActive) return 'skip';

    // Spin only from ready, and only when no request is pending.
    if (ctx.state === 'ready') {
      return this.pendingRequestKey === null ? 'spin' : 'ignored';
    }
    return 'ignored';
  }

  /**
   * Duplicate-request protection: acquire the single request slot. Returns a
   * fresh idempotency key, or null when a request is already pending (the
   * caller MUST NOT place a wager on null). Retries after network failure
   * should reuse getPendingKey(), not acquire a new one.
   */
  acquireRequestSlot(): string | null {
    if (this.pendingRequestKey !== null) return null;
    this.requestCounter += 1;
    this.pendingRequestKey = `req-${this.requestCounter}`;
    return this.pendingRequestKey;
  }

  /** Key of the in-flight request (reuse for idempotent retries). */
  getPendingKey(): string | null {
    return this.pendingRequestKey;
  }

  /** Release the slot when the round settles or errors out terminally. */
  releaseRequestSlot(): void {
    this.pendingRequestKey = null;
  }

  get roundInProgress(): boolean {
    return this.pendingRequestKey !== null;
  }
}

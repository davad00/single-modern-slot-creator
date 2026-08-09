import { describe, expect, test } from 'bun:test';
import { InputGuard, type InputContext } from '../src/core/inputGuard.js';

/** Deterministic fake clock. */
function makeClock(startMs = 0) {
  let now = startMs;
  return {
    now: () => now,
    tick: (ms: number) => {
      now += ms;
    },
  };
}

function ctx(overrides: Partial<InputContext> = {}): InputContext {
  return {
    state: 'ready',
    autoplayActive: false,
    reelsSpinning: false,
    outcomeCommitted: false,
    slamStopAllowed: true,
    skippableAnimationActive: false,
    ...overrides,
  };
}

describe('debounce (rapid clicks / touch / space / enter)', () => {
  test('second input inside the window is ignored', () => {
    const clock = makeClock();
    const guard = new InputGuard({ now: clock.now, debounceMs: 200 });
    expect(guard.handleInput('pointer', ctx())).toBe('spin');
    clock.tick(50);
    // touch fires a synthetic pointer too — same channel, ignored
    expect(guard.handleInput('touch', ctx())).toBe('ignored');
    expect(guard.handleInput('space', ctx())).toBe('ignored');
  });

  test('input after the window is classified again', () => {
    const clock = makeClock();
    const guard = new InputGuard({ now: clock.now, debounceMs: 200 });
    expect(guard.handleInput('space', ctx({ skippableAnimationActive: true, state: 'presenting_wins' }))).toBe('skip');
    clock.tick(250);
    expect(guard.handleInput('space', ctx({ skippableAnimationActive: true, state: 'presenting_wins' }))).toBe('skip');
  });

  test('ignored inputs do not reset the debounce window', () => {
    const clock = makeClock();
    const guard = new InputGuard({ now: clock.now, debounceMs: 200 });
    // a meaningless input (nothing to do in ready+pending-free? use round_requested)
    expect(guard.handleInput('pointer', ctx({ state: 'round_requested' }))).toBe('ignored');
    clock.tick(10);
    // still classified — the previous input was not "accepted"
    expect(guard.handleInput('pointer', ctx())).toBe('spin');
  });

  test('key auto-repeat cannot spam actions', () => {
    const clock = makeClock();
    const guard = new InputGuard({ now: clock.now, debounceMs: 200 });
    const actions: string[] = [];
    for (let i = 0; i < 20; i++) {
      actions.push(guard.handleInput('enter', ctx({ skippableAnimationActive: true, state: 'presenting_wins' })));
      clock.tick(33); // ~30Hz auto-repeat
    }
    expect(actions.filter((a) => a !== 'ignored').length).toBeLessThanOrEqual(4);
  });
});

describe('spin + duplicate-request protection', () => {
  test('spin only from ready; request slot is single-occupancy', () => {
    const clock = makeClock();
    const guard = new InputGuard({ now: clock.now });
    expect(guard.handleInput('pointer', ctx())).toBe('spin');
    const key = guard.acquireRequestSlot();
    expect(key).not.toBeNull();
    expect(guard.roundInProgress).toBe(true);
    // second acquisition refused → caller must NOT place a second wager
    expect(guard.acquireRequestSlot()).toBeNull();
    // retries reuse the SAME idempotency key
    expect(guard.getPendingKey()).toBe(key);
    clock.tick(1000);
    // spin input while a request is pending is ignored
    expect(guard.handleInput('pointer', ctx())).toBe('ignored');
    guard.releaseRequestSlot();
    clock.tick(1000);
    expect(guard.handleInput('pointer', ctx())).toBe('spin');
    // fresh round → fresh key
    expect(guard.acquireRequestSlot()).not.toBe(key);
  });

  test('input during authoritative wait states is ignored (no queued wagers)', () => {
    const clock = makeClock();
    const guard = new InputGuard({ now: clock.now });
    for (const state of ['round_requested', 'outcome_received'] as const) {
      expect(guard.handleInput('pointer', ctx({ state }))).toBe('ignored');
      clock.tick(500);
    }
  });
});

describe('skip-vs-stop disambiguation', () => {
  test('reels spinning + outcome committed + slam allowed → stop_reels', () => {
    const guard = new InputGuard({ now: makeClock().now });
    const action = guard.handleInput(
      'pointer',
      ctx({ state: 'outcome_committed', reelsSpinning: true, outcomeCommitted: true }),
    );
    expect(action).toBe('stop_reels');
  });

  test('slam stop disallowed by jurisdiction → ignored', () => {
    const guard = new InputGuard({ now: makeClock().now });
    const action = guard.handleInput(
      'pointer',
      ctx({ state: 'outcome_committed', reelsSpinning: true, outcomeCommitted: true, slamStopAllowed: false }),
    );
    expect(action).toBe('ignored');
  });

  test('reels spinning but outcome NOT committed → ignored (nothing to reveal yet)', () => {
    const guard = new InputGuard({ now: makeClock().now });
    const action = guard.handleInput(
      'pointer',
      ctx({ state: 'presenting_initial_result', reelsSpinning: true, outcomeCommitted: false }),
    );
    expect(action).toBe('ignored');
  });

  test('skippable presentation → skip', () => {
    const guard = new InputGuard({ now: makeClock().now });
    for (const state of ['presenting_wins', 'presenting_cascades', 'feature_entry'] as const) {
      const fresh = new InputGuard({ now: makeClock().now });
      expect(fresh.handleInput('space', ctx({ state, skippableAnimationActive: true }))).toBe('skip');
    }
    expect(guard.handleInput('enter', ctx({ state: 'presenting_wins', skippableAnimationActive: true }))).toBe('skip');
  });

  test('non-skippable presentation → ignored', () => {
    const guard = new InputGuard({ now: makeClock().now });
    expect(guard.handleInput('pointer', ctx({ state: 'feature_summary', skippableAnimationActive: false }))).toBe(
      'ignored',
    );
  });
});

describe('autoplay interaction', () => {
  test('any manual input during autoplay → stop_autoplay only', () => {
    const clock = makeClock();
    const guard = new InputGuard({ now: clock.now });
    expect(guard.handleInput('pointer', ctx({ autoplayActive: true, state: 'presenting_wins' }))).toBe(
      'stop_autoplay',
    );
    clock.tick(500);
    expect(guard.handleInput('space', ctx({ autoplayActive: true, state: 'ready' }))).toBe('stop_autoplay');
  });
});

describe('construction', () => {
  test('rejects negative debounce', () => {
    expect(() => new InputGuard({ now: () => 0, debounceMs: -1 })).toThrow(RangeError);
  });
});

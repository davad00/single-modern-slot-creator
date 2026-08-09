/**
 * motionPlayer — variant selection (reducedMotion / lowPerformance), skip
 * semantics driven through the deterministic Timeline via TestClock, easing
 * sanity, blocksInput and duplicate-audio protection. Pure module: no
 * browser, no pixi.
 */

import { describe, expect, test } from 'bun:test';
import { Timeline, type TimelineFiring } from '../src/core/timeline.js';
import { TestClock, driveTimeline } from '../src/presentation/clock.js';
import {
  DEFAULT_ANIMATION_EVENTS,
  easings,
  MotionPlayer,
  resolveVariant,
  type AnimationEventConfig,
} from '../src/presentation/motionPlayer.js';

const NO_FLAGS = { reducedMotion: false, lowPerformance: false };

function makeConfig(overrides: Partial<AnimationEventConfig> = {}): AnimationEventConfig {
  return {
    eventId: 'anim.test.event',
    durationMs: 1000,
    easing: 'linear',
    skippable: true,
    blocksInput: false,
    priority: 5,
    reducedMotion: { durationMs: 200, easing: 'easeOutQuad' },
    lowPerformance: { durationMs: 500 },
    recovery: 'snap_to_end',
    ...overrides,
  };
}

/** Timeline + player + manual clock, with all firings captured. */
function rig(configs: AnimationEventConfig[], flags = NO_FLAGS) {
  const timeline = new Timeline();
  const clock = new TestClock();
  driveTimeline(clock, timeline);
  const audioCalls: string[] = [];
  const hapticCalls: string[] = [];
  const player = new MotionPlayer(timeline, {
    flags,
    onAudioEvent: (id) => audioCalls.push(id),
    onHaptic: (id) => hapticCalls.push(id),
  });
  player.register(configs);
  const firings: TimelineFiring[] = [];
  timeline.onFire((f) => firings.push(f));
  return { timeline, clock, player, firings, audioCalls, hapticCalls };
}

describe('easings', () => {
  test('all easings are 0 at 0 and 1 at 1', () => {
    for (const [name, fn] of Object.entries(easings)) {
      expect(fn(0)).toBeCloseTo(0, 6);
      expect(fn(1)).toBeCloseTo(1, 6);
      void name;
    }
  });

  test('easeOutBack overshoots past 1 mid-curve', () => {
    expect(easings.easeOutBack(0.7)).toBeGreaterThan(1);
  });

  test('easeInOutQuad is symmetric around the midpoint', () => {
    expect(easings.easeInOutQuad(0.5)).toBeCloseTo(0.5, 6);
    expect(easings.easeInOutQuad(0.25) + easings.easeInOutQuad(0.75)).toBeCloseTo(1, 6);
  });
});

describe('variant selection', () => {
  test('no flags → base duration and easing', () => {
    const v = resolveVariant(makeConfig(), NO_FLAGS);
    expect(v).toEqual({ durationMs: 1000, easing: 'linear', disabled: false });
  });

  test('lowPerformance flag → lowPerformance variant (easing inherited)', () => {
    const v = resolveVariant(makeConfig(), { reducedMotion: false, lowPerformance: true });
    expect(v).toEqual({ durationMs: 500, easing: 'linear', disabled: false });
  });

  test('reducedMotion flag → reducedMotion variant', () => {
    const v = resolveVariant(makeConfig(), { reducedMotion: true, lowPerformance: false });
    expect(v).toEqual({ durationMs: 200, easing: 'easeOutQuad', disabled: false });
  });

  test('reducedMotion takes precedence over lowPerformance (accessibility wins)', () => {
    const v = resolveVariant(makeConfig(), { reducedMotion: true, lowPerformance: true });
    expect(v.durationMs).toBe(200);
    expect(v.easing).toBe('easeOutQuad');
  });

  test('disabled variant → zero duration', () => {
    const config = makeConfig({ reducedMotion: { disabled: true } });
    const v = resolveVariant(config, { reducedMotion: true, lowPerformance: false });
    expect(v).toEqual({ durationMs: 0, easing: 'linear', disabled: true });
  });

  test('variant resolves at play() time and flag swaps affect future plays only', () => {
    const { clock, player } = rig([makeConfig()]);
    const before = player.play('anim.test.event');
    player.setFlags({ reducedMotion: true, lowPerformance: false });
    const after = player.play('anim.test.event');
    clock.tick(0);
    expect(player.getInstance(before)?.durationMs).toBe(1000);
    expect(player.getInstance(after)?.durationMs).toBe(200);
  });
});

describe('registration', () => {
  test('duplicate event ids throw (duplicate-event protection)', () => {
    const { player } = rig([makeConfig()]);
    expect(() => player.register([makeConfig()])).toThrow(/already registered/);
  });

  test('non-anim ids are rejected (§4.3 pattern)', () => {
    const { player } = rig([]);
    expect(() => player.register([makeConfig({ eventId: 'sfx.oops' })])).toThrow(/anim\./);
  });

  test('the default event set registers cleanly and covers §4.3 ids', () => {
    const { player } = rig([...DEFAULT_ANIMATION_EVENTS]);
    for (const id of [
      'anim.reel.spin_start',
      'anim.reel.stop',
      'anim.symbol.land',
      'anim.scatter.land',
      'anim.scatter.anticipation',
      'anim.win.countup',
      'anim.win.big',
      'anim.cascade.remove',
      'anim.cascade.refill',
      'anim.feature.enter',
      'anim.super_feature.enter',
      'anim.ultimate_feature.enter',
      'anim.feature.retrigger',
      'anim.feature.summary',
      'anim.maxwin.reached',
    ]) {
      expect(player.getConfig(id)).toBeDefined();
    }
  });

  test('every default event carries the full §9.8 variant/recovery field set', () => {
    for (const config of DEFAULT_ANIMATION_EVENTS) {
      expect(config.reducedMotion).toBeDefined();
      expect(config.lowPerformance).toBeDefined();
      expect(['snap_to_end', 'replay', 'skip']).toContain(config.recovery);
      expect(typeof config.skippable).toBe('boolean');
      expect(typeof config.blocksInput).toBe('boolean');
      expect(typeof config.priority).toBe('number');
    }
  });
});

describe('playback via TestClock', () => {
  test('progress follows the clock through the easing', () => {
    const { clock, player } = rig([makeConfig()]);
    const id = player.play('anim.test.event');
    clock.tick(0); // deliver the start firing
    expect(player.progress(id)).toBe(0);
    clock.tick(500);
    expect(player.progress(id)).toBeCloseTo(0.5, 6); // linear easing
    clock.tick(500);
    expect(player.progress(id)).toBe(1);
    expect(player.getInstance(id)?.finished).toBe(true);
  });

  test('blocksInput reflects active blocking motions only', () => {
    const { clock, player } = rig([makeConfig({ blocksInput: true })]);
    expect(player.inputBlocked).toBe(false);
    player.play('anim.test.event');
    clock.tick(0);
    expect(player.inputBlocked).toBe(true);
    clock.tick(1000);
    expect(player.inputBlocked).toBe(false);
  });

  test('audio + haptics fire once at start, never again on completion', () => {
    const { clock, audioCalls, hapticCalls, player } = rig([
      makeConfig({ audioEvent: 'sfx.test.ping', haptic: 'haptic.light' }),
    ]);
    player.play('anim.test.event');
    clock.tick(0);
    clock.tick(2000);
    expect(audioCalls).toEqual(['sfx.test.ping']);
    expect(hapticCalls).toEqual(['haptic.light']);
  });
});

describe('skip semantics', () => {
  test('skipping fast-forwards; the complete firing still fires, flagged skipped', () => {
    const { clock, firings, player, timeline } = rig([makeConfig()]);
    const id = player.play('anim.test.event');
    clock.tick(100);
    expect(player.skip()).toBe(true);
    expect(timeline.now).toBe(1000); // sought to the instance end
    const complete = firings.find((f) => f.eventId === id && f.phase === 'complete');
    expect(complete).toBeDefined();
    expect(complete?.skipped).toBe(true);
    expect(player.progress(id)).toBe(1);
  });

  test('non-skippable motions refuse the skip and time does not move', () => {
    const { clock, player, timeline } = rig([makeConfig({ skippable: false })]);
    player.play('anim.test.event');
    clock.tick(100);
    expect(player.skip()).toBe(false);
    expect(timeline.now).toBe(100);
  });

  test('skip picks the highest-priority active skippable motion', () => {
    const low = makeConfig({ eventId: 'anim.test.low', priority: 1, durationMs: 1000 });
    const high = makeConfig({ eventId: 'anim.test.high', priority: 9, skipTo: 'complete', durationMs: 2000 });
    const { clock, player, timeline } = rig([low, high]);
    player.play('anim.test.low');
    player.play('anim.test.high');
    clock.tick(50);
    expect(player.skip()).toBe(true);
    // high's skipTo: 'complete' seeks to the END of the whole timeline
    expect(timeline.now).toBe(2000);
    expect(timeline.complete).toBe(true);
  });

  test("skipTo: 'summary' seeks to the summary marker, not the end", () => {
    const config = makeConfig({ skipTo: 'summary', durationMs: 5000 });
    const { clock, player, timeline } = rig([config]);
    timeline.add({ id: 'summary-marker', at: 800, duration: 100, marker: 'summary' });
    timeline.add({ id: 'tail', at: 3000, duration: 0 });
    player.play('anim.test.event');
    clock.tick(50);
    expect(player.skip()).toBe(true);
    expect(timeline.now).toBe(800); // parked at the summary, tail not yet fired
    expect(timeline.complete).toBe(false);
  });

  test('skipped start firings suppress audio (duplicate-audio protection)', () => {
    const { audioCalls, clock, player, timeline } = rig([makeConfig({ audioEvent: 'sfx.test.ping' })]);
    player.play('anim.test.event', { atMs: 500 });
    clock.tick(0);
    timeline.seek(2000); // fast-forward PAST the start — audio must not fire
    expect(audioCalls).toEqual([]);
    expect(player.progress(timeline.now === 2000 ? 'anim.test.event#1' : '')).toBe(1);
  });

  test('specific-instance skip honors only that instance', () => {
    const { clock, player, timeline } = rig([makeConfig()]);
    const a = player.play('anim.test.event');
    const b = player.play('anim.test.event', { atMs: 100 });
    clock.tick(150); // both active
    expect(player.skip(a)).toBe(true);
    expect(timeline.now).toBe(1000); // a ends at 1000; b (ends 1100) still live
    expect(player.getInstance(b)?.active).toBe(true);
  });
});

describe('timeline re-attachment (fresh round)', () => {
  test('attach() drops old instances and plays on the new timeline', () => {
    const { clock, player } = rig([makeConfig()]);
    const oldId = player.play('anim.test.event');
    clock.tick(0);
    expect(player.getInstance(oldId)?.active).toBe(true);

    const fresh = new Timeline();
    player.attach(fresh);
    expect(player.getInstance(oldId)).toBeUndefined();
    expect(player.inputBlocked).toBe(false);

    const newId = player.play('anim.test.event');
    fresh.advance(0);
    expect(player.getInstance(newId)?.active).toBe(true);
  });
});

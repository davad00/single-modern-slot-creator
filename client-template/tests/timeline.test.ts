import { describe, expect, test } from 'bun:test';
import { DuplicateEventError, Timeline, type TimelineEventInput, type TimelineFiring } from '../src/core/timeline.js';

function record(timeline: Timeline): TimelineFiring[] {
  const firings: TimelineFiring[] = [];
  timeline.onFire((f) => firings.push(f));
  return firings;
}

function sig(firings: TimelineFiring[]): string[] {
  return firings.map((f) => `${f.eventId}:${f.phase}@${f.at}`);
}

const SAMPLE: TimelineEventInput[] = [
  { id: 'reel-0', at: 0, duration: 500, priority: 10 },
  { id: 'reel-1', at: 0, duration: 700, priority: 10 },
  { id: 'step:step-1', at: 700, duration: 400, priority: 5, marker: 'step', payload: { winMinor: 250 } },
  { id: 'step:step-2', at: 1100, duration: 300, priority: 5, marker: 'step', payload: { winMinor: 0 } },
  { id: 'summary', at: 1400, duration: 200, priority: 5, marker: 'summary' },
];

describe('deterministic firing order', () => {
  test('advance in small ticks and skipTo(complete) produce the IDENTICAL sequence', () => {
    const a = new Timeline();
    const firingsA = record(a);
    a.addMany(SAMPLE);
    while (!a.complete) a.advance(16); // 60fps-style clock

    const b = new Timeline();
    const firingsB = record(b);
    b.addMany(SAMPLE);
    b.skipTo('complete');

    expect(sig(firingsB)).toEqual(sig(firingsA));
    expect(b.complete).toBe(true);
    // skip path marks firings as skipped; clock path does not
    expect(firingsB.every((f) => f.skipped)).toBe(true);
    expect(firingsA.every((f) => !f.skipped)).toBe(true);
  });

  test('seek to an intermediate time equals advancing to it', () => {
    const a = new Timeline();
    const firingsA = record(a);
    a.addMany(SAMPLE);
    a.advance(750);

    const b = new Timeline();
    const firingsB = record(b);
    b.addMany(SAMPLE);
    b.seek(750);

    expect(sig(firingsB)).toEqual(sig(firingsA));
    expect(b.now).toBe(a.now);
  });

  test('same-time firings order by priority desc, then insertion order', () => {
    const timeline = new Timeline();
    const firings = record(timeline);
    timeline.add({ id: 'low', at: 100, priority: 1 });
    timeline.add({ id: 'high', at: 100, priority: 9 });
    timeline.add({ id: 'mid-a', at: 100, priority: 5 });
    timeline.add({ id: 'mid-b', at: 100, priority: 5 });
    timeline.advance(100);
    expect(firings.map((f) => f.eventId)).toEqual([
      'high', 'high', // start + complete (duration 0)
      'mid-a', 'mid-a',
      'mid-b', 'mid-b',
      'low', 'low',
    ]);
  });

  test('start fires at `at`, complete at `at + duration`', () => {
    const timeline = new Timeline();
    const firings = record(timeline);
    timeline.add({ id: 'e', at: 100, duration: 400 });
    timeline.advance(99);
    expect(firings).toHaveLength(0);
    timeline.advance(1);
    expect(sig(firings)).toEqual(['e:start@100']);
    timeline.advance(400);
    expect(sig(firings)).toEqual(['e:start@100', 'e:complete@500']);
  });
});

describe('skipTo targets', () => {
  test('next_step fast-forwards to the next step marker only', () => {
    const timeline = new Timeline();
    const firings = record(timeline);
    timeline.addMany(SAMPLE);
    timeline.advance(100); // inside the reels
    timeline.skipTo('next_step');
    expect(timeline.now).toBe(700); // start of step-1
    const fired = new Set(sig(firings));
    expect(fired.has('step:step-1:start@700')).toBe(true);
    expect(fired.has('step:step-2:start@1100')).toBe(false); // NOT skipped past
    // a second next_step lands on step-2
    timeline.skipTo('next_step');
    expect(timeline.now).toBe(1100);
  });

  test('summary fast-forwards to the summary marker', () => {
    const timeline = new Timeline();
    const firings = record(timeline);
    timeline.addMany(SAMPLE);
    timeline.skipTo('summary');
    expect(timeline.now).toBe(1400);
    expect(sig(firings)).toContain('summary:start@1400');
    expect(sig(firings)).not.toContain('summary:complete@1600');
  });

  test('next_step/summary with no marker ahead behave like complete', () => {
    const timeline = new Timeline();
    timeline.add({ id: 'plain', at: 0, duration: 100 });
    timeline.skipTo('next_step');
    expect(timeline.complete).toBe(true);
  });

  test('every firing is still delivered when skipping — none lost', () => {
    const timeline = new Timeline();
    const firings = record(timeline);
    timeline.addMany(SAMPLE);
    timeline.skipTo('complete');
    expect(firings).toHaveLength(SAMPLE.length * 2); // start + complete each
  });
});

describe('play/pause', () => {
  test('advance is a no-op while paused; seek still works (explicit jump)', () => {
    const timeline = new Timeline();
    const firings = record(timeline);
    timeline.addMany(SAMPLE);
    timeline.pause();
    timeline.advance(10_000);
    expect(firings).toHaveLength(0);
    expect(timeline.now).toBe(0);
    timeline.play();
    timeline.advance(50);
    expect(sig(firings)).toEqual(['reel-0:start@0', 'reel-1:start@0']);
  });
});

describe('protection', () => {
  test('duplicate event ids are rejected', () => {
    const timeline = new Timeline();
    timeline.add({ id: 'x', at: 0 });
    expect(() => timeline.add({ id: 'x', at: 100 })).toThrow(DuplicateEventError);
  });

  test('cancel removes pending firings', () => {
    const timeline = new Timeline();
    const firings = record(timeline);
    timeline.addMany(SAMPLE);
    expect(timeline.cancel('step:step-2')).toBe(true);
    timeline.skipTo('complete');
    expect(sig(firings)).not.toContain('step:step-2:start@1100');
    expect(timeline.cancel('step:step-2')).toBe(false); // nothing left to cancel
  });

  test('timeline never rewinds', () => {
    const timeline = new Timeline();
    timeline.addMany(SAMPLE);
    timeline.advance(500);
    expect(() => timeline.seek(100)).toThrow(RangeError);
    expect(() => timeline.advance(-5)).toThrow(RangeError);
  });

  test('rejects invalid event times', () => {
    const timeline = new Timeline();
    expect(() => timeline.add({ id: 'bad', at: -1 })).toThrow(RangeError);
    expect(() => timeline.add({ id: 'bad2', at: 0, duration: -1 })).toThrow(RangeError);
  });
});

describe('listener-driven insertion stays deterministic', () => {
  test('a listener may append events; they fire in order', () => {
    const timeline = new Timeline();
    const firings = record(timeline);
    timeline.add({ id: 'first', at: 100 });
    timeline.onFire((f) => {
      if (f.eventId === 'first' && f.phase === 'start') {
        timeline.add({ id: 'chained', at: 150 });
      }
    });
    timeline.advance(200);
    expect(sig(firings)).toEqual([
      'first:start@100',
      'first:complete@100',
      'chained:start@150',
      'chained:complete@150',
    ]);
  });
});

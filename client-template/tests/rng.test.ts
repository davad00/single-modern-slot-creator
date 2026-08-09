import { describe, expect, test } from 'bun:test';
import { Xoshiro128StarStar, splitmix32 } from '../src/core/rng.js';

/**
 * Regression vectors recorded from this implementation (xoshiro128** with
 * splitmix32 seed expansion). They pin the exact output stream: ANY change to
 * seeding or the scrambler breaks reproducibility of every recorded dev/sim
 * round, so a diff here must be treated as a breaking math-reproducibility
 * change and re-recorded deliberately.
 */
const VECTOR_SEED_42 = [
  660444221, 3652823732, 77672526, 910233633, 2297337756, 3786072677, 3123505064, 1891482476,
];
const VECTOR_SEED_0 = [
  1789933344, 44971166, 2521387044, 3848737593, 1138324114, 749234105, 1899511038, 1995189375,
];
const VECTOR_SPLITMIX_123 = [1965001953, 923654468, 3296506099, 1443291460];

describe('splitmix32', () => {
  test('known vector for seed 123', () => {
    const mix = splitmix32(123);
    expect([mix(), mix(), mix(), mix()]).toEqual(VECTOR_SPLITMIX_123);
  });
});

describe('Xoshiro128StarStar', () => {
  test('known vectors', () => {
    const r42 = new Xoshiro128StarStar(42);
    expect(VECTOR_SEED_42.map(() => r42.nextUint32())).toEqual(VECTOR_SEED_42);
    const r0 = new Xoshiro128StarStar(0);
    expect(VECTOR_SEED_0.map(() => r0.nextUint32())).toEqual(VECTOR_SEED_0);
  });

  test('determinism: same seed ⇒ identical stream', () => {
    const a = new Xoshiro128StarStar(987654321);
    const b = new Xoshiro128StarStar(987654321);
    for (let i = 0; i < 1000; i++) expect(a.nextUint32()).toBe(b.nextUint32());
  });

  test('different seeds ⇒ different streams', () => {
    const a = new Xoshiro128StarStar(1);
    const b = new Xoshiro128StarStar(2);
    const sameCount = Array.from({ length: 100 }, () => (a.nextUint32() === b.nextUint32() ? 1 : 0)).reduce<number>(
      (x, y) => x + y,
      0,
    );
    expect(sameCount).toBeLessThan(3);
  });

  test('serializable state resumes the exact stream', () => {
    const original = new Xoshiro128StarStar(42);
    for (let i = 0; i < 3; i++) original.nextUint32();
    expect(original.serialize()).toBe(
      '{"s0":2776653749,"s1":3178881218,"s2":2839047872,"s3":2645728665}',
    );
    const resumed = Xoshiro128StarStar.deserialize(original.serialize());
    for (let i = 0; i < 500; i++) expect(resumed.nextUint32()).toBe(original.nextUint32());
  });

  test('fromState round-trips', () => {
    const a = new Xoshiro128StarStar(7);
    a.nextUint32();
    const b = Xoshiro128StarStar.fromState(a.getState());
    expect(b.nextUint32()).toBe(a.nextUint32());
  });

  test('getState snapshot is not live', () => {
    const a = new Xoshiro128StarStar(7);
    const snapshot = a.getState();
    a.nextUint32();
    expect(a.getState()).not.toEqual(snapshot);
  });

  test('nextFloat in [0, 1)', () => {
    const r = new Xoshiro128StarStar(5);
    for (let i = 0; i < 1000; i++) {
      const f = r.nextFloat();
      expect(f).toBeGreaterThanOrEqual(0);
      expect(f).toBeLessThan(1);
    }
  });

  test('int(min, max) respects bounds and is deterministic', () => {
    const a = new Xoshiro128StarStar(9);
    const b = new Xoshiro128StarStar(9);
    for (let i = 0; i < 1000; i++) {
      const va = a.int(3, 17);
      expect(va).toBeGreaterThanOrEqual(3);
      expect(va).toBeLessThan(17);
      expect(va).toBe(b.int(3, 17));
    }
  });

  test('int covers the full range (small range sanity)', () => {
    const r = new Xoshiro128StarStar(11);
    const seen = new Set<number>();
    for (let i = 0; i < 200; i++) seen.add(r.int(0, 4));
    expect([...seen].sort()).toEqual([0, 1, 2, 3]);
  });

  test('rejects invalid ranges and seeds', () => {
    const r = new Xoshiro128StarStar(1);
    expect(() => r.int(5, 5)).toThrow(RangeError);
    expect(() => r.int(10, 2)).toThrow(RangeError);
    expect(() => new Xoshiro128StarStar(1.5)).toThrow(RangeError);
  });

  test('all-zero state is escaped', () => {
    const r = new Xoshiro128StarStar({ s0: 0, s1: 0, s2: 0, s3: 0 });
    // must not be stuck on the xoshiro fixed point
    const outputs = new Set([r.nextUint32(), r.nextUint32(), r.nextUint32(), r.nextUint32()]);
    expect(outputs.size).toBeGreaterThan(1);
  });

  test('deserialize rejects malformed state', () => {
    expect(() => Xoshiro128StarStar.deserialize('{"s0":1}')).toThrow(TypeError);
    expect(() => Xoshiro128StarStar.deserialize('{"s0":1,"s1":2,"s2":3,"s3":"x"}')).toThrow(TypeError);
  });
});

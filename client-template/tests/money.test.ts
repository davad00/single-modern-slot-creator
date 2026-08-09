import { describe, expect, test } from 'bun:test';
import { assertMinor, formatMinor, maxWinCapMinor, minorExponent, winMinor } from '../src/core/money.js';

describe('winMinor — canonical floor rule (CONVENTIONS §5)', () => {
  test('exact division', () => {
    expect(winMinor(100, 250)).toBe(250); // 2.5x on 100 minor
    expect(winMinor(200, 100)).toBe(200); // 1x
  });

  test('floors, never rounds', () => {
    expect(winMinor(33, 250)).toBe(82); // 82.5 → 82
    expect(winMinor(10, 5)).toBe(0); // 0.5 → 0 (sub-minor wins floor to zero)
    expect(winMinor(1, 99)).toBe(0);
    expect(winMinor(1, 199)).toBe(1);
    expect(winMinor(3, 33)).toBe(0); // 0.99 → 0
  });

  test('multiplier applies BEFORE the single floor division', () => {
    // floor(1 * 150 * 2 / 100) = 3, whereas floor-then-multiply would give 2.
    expect(winMinor(1, 150, 2)).toBe(3);
    expect(winMinor(33, 250, 3)).toBe(247); // floor(24750*... ) 33*250*3/100 = 247.5 → 247
    // equals a single integer division, always
    expect(winMinor(7, 333, 7)).toBe(Math.floor((7 * 333 * 7) / 100));
  });

  test('zero cases', () => {
    expect(winMinor(0, 5000)).toBe(0);
    expect(winMinor(1000, 0)).toBe(0);
  });

  test('huge values stay exact via BigInt', () => {
    // 10^9 bet * 10^6 payX100 would lose precision as a float product
    expect(winMinor(1_000_000_000, 1_000_000)).toBe(10_000_000_000_000);
    expect(winMinor(999_999_937, 999_983)).toBe(
      Number((BigInt(999_999_937) * BigInt(999_983)) / 100n),
    );
  });

  test('rejects invalid inputs', () => {
    expect(() => winMinor(-1, 100)).toThrow(RangeError);
    expect(() => winMinor(1.5, 100)).toThrow(RangeError);
    expect(() => winMinor(100, -5)).toThrow(RangeError);
    expect(() => winMinor(100, 100, 0)).toThrow(RangeError);
    expect(() => winMinor(100, 100, 1.5)).toThrow(RangeError);
    expect(() => winMinor(Number.NaN, 100)).toThrow(RangeError);
    expect(() => winMinor(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)).toThrow(RangeError); // overflow guard
  });
});

describe('maxWinCapMinor', () => {
  test('bet times x-bet cap', () => {
    expect(maxWinCapMinor(100, 5000)).toBe(500_000);
    expect(maxWinCapMinor(10, 1)).toBe(10);
  });
  test('rejects invalid', () => {
    expect(() => maxWinCapMinor(100, 0)).toThrow(RangeError);
    expect(() => maxWinCapMinor(-1, 10)).toThrow(RangeError);
  });
});

describe('assertMinor', () => {
  test('accepts 0 and positive safe integers', () => {
    expect(() => assertMinor(0)).not.toThrow();
    expect(() => assertMinor(Number.MAX_SAFE_INTEGER)).not.toThrow();
  });
  test('rejects floats, negatives, unsafe, NaN, Infinity', () => {
    for (const bad of [0.1, -1, Number.MAX_SAFE_INTEGER + 1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => assertMinor(bad)).toThrow(RangeError);
    }
  });
});

describe('formatMinor — display only, integer-exact', () => {
  test('two-decimal currencies', () => {
    expect(formatMinor(12345, 'EUR')).toBe('€123.45');
    expect(formatMinor(5, 'USD')).toBe('$0.05');
    expect(formatMinor(0, 'GBP')).toBe('£0.00');
  });
  test('zero-decimal currency', () => {
    expect(formatMinor(1234, 'JPY')).toBe('¥1,234');
    expect(minorExponent('JPY')).toBe(0);
  });
  test('three-decimal currency', () => {
    expect(formatMinor(12345, 'KWD')).toBe('KWD 12.345');
    expect(minorExponent('KWD')).toBe(3);
  });
  test('grouping', () => {
    expect(formatMinor(123_456_789, 'EUR')).toBe('€1,234,567.89');
  });
  test('unknown currency falls back to code prefix', () => {
    expect(formatMinor(150, 'SEK')).toBe('SEK 1.50');
  });
  test('options', () => {
    expect(formatMinor(12345, 'EUR', { withCurrency: false })).toBe('123.45');
    expect(formatMinor(123456, 'EUR', { groupSeparator: '.', decimalSeparator: ',' })).toBe('€1.234,56');
  });
  test('rejects non-minor amounts', () => {
    expect(() => formatMinor(1.5, 'EUR')).toThrow(RangeError);
    expect(() => formatMinor(-1, 'EUR')).toThrow(RangeError);
  });
});

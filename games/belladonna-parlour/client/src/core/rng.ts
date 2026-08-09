/**
 * ╔════════════════════════════════════════════════════════════════════════╗
 * ║  DEV / TEST ONLY RNG — NEVER USED FOR REAL-MONEY OUTCOMES.              ║
 * ║  Production outcomes come ONLY from the RGS (CONVENTIONS §5, §9.1).     ║
 * ║  This RNG exists so the dev round provider and tests are reproducible. ║
 * ╚════════════════════════════════════════════════════════════════════════╝
 *
 * xoshiro128** (Blackman & Vigna) seeded via splitmix32, per CONVENTIONS §5.
 * State is fully serializable so any dev round can be replayed exactly.
 */

/** Serializable xoshiro128** state: four uint32 words, never all zero. */
export interface RngState {
  s0: number;
  s1: number;
  s2: number;
  s3: number;
}

/**
 * splitmix32 stream — used only to expand a single 32-bit seed into the
 * four xoshiro state words.
 */
export function splitmix32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x9e3779b9) | 0;
    let t = a ^ (a >>> 16);
    t = Math.imul(t, 0x21f0aaad);
    t = t ^ (t >>> 15);
    t = Math.imul(t, 0x735a2d97);
    t = t ^ (t >>> 15);
    return t >>> 0;
  };
}

function rotl(x: number, k: number): number {
  return ((x << k) | (x >>> (32 - k))) >>> 0;
}

export class Xoshiro128StarStar {
  private s0: number;
  private s1: number;
  private s2: number;
  private s3: number;

  constructor(seed: number | RngState) {
    if (typeof seed === 'number') {
      if (!Number.isSafeInteger(seed)) throw new RangeError(`seed must be a safe integer, got ${seed}`);
      const mix = splitmix32(seed >>> 0);
      this.s0 = mix();
      this.s1 = mix();
      this.s2 = mix();
      this.s3 = mix();
    } else {
      this.s0 = seed.s0 >>> 0;
      this.s1 = seed.s1 >>> 0;
      this.s2 = seed.s2 >>> 0;
      this.s3 = seed.s3 >>> 0;
    }
    if ((this.s0 | this.s1 | this.s2 | this.s3) === 0) {
      // All-zero state is the one fixed point of xoshiro; escape it.
      this.s0 = 1;
    }
  }

  static fromState(state: RngState): Xoshiro128StarStar {
    return new Xoshiro128StarStar(state);
  }

  /** Next uint32 in [0, 2^32). */
  nextUint32(): number {
    const result = (Math.imul(rotl(Math.imul(this.s1, 5) >>> 0, 7), 9)) >>> 0;
    const t = (this.s1 << 9) >>> 0;
    this.s2 = (this.s2 ^ this.s0) >>> 0;
    this.s3 = (this.s3 ^ this.s1) >>> 0;
    this.s1 = (this.s1 ^ this.s2) >>> 0;
    this.s0 = (this.s0 ^ this.s3) >>> 0;
    this.s2 = (this.s2 ^ t) >>> 0;
    this.s3 = rotl(this.s3, 11);
    return result;
  }

  /** Uniform float in [0, 1). Display/dev use only — never settlement math. */
  nextFloat(): number {
    return this.nextUint32() / 0x1_0000_0000;
  }

  /**
   * Unbiased integer in [minInclusive, maxExclusive) via rejection sampling.
   */
  int(minInclusive: number, maxExclusive: number): number {
    if (!Number.isSafeInteger(minInclusive) || !Number.isSafeInteger(maxExclusive) || maxExclusive <= minInclusive) {
      throw new RangeError(`invalid int range [${minInclusive}, ${maxExclusive})`);
    }
    const range = maxExclusive - minInclusive;
    if (range > 0x1_0000_0000) throw new RangeError('range exceeds 2^32');
    const limit = Math.floor(0x1_0000_0000 / range) * range;
    let x = this.nextUint32();
    while (x >= limit) x = this.nextUint32();
    return minInclusive + (x % range);
  }

  /** Snapshot of the internal state (safe to JSON.stringify). */
  getState(): RngState {
    return { s0: this.s0, s1: this.s1, s2: this.s2, s3: this.s3 };
  }

  serialize(): string {
    return JSON.stringify(this.getState());
  }

  static deserialize(json: string): Xoshiro128StarStar {
    const raw = JSON.parse(json) as Partial<RngState>;
    for (const key of ['s0', 's1', 's2', 's3'] as const) {
      const v = raw[key];
      if (typeof v !== 'number' || !Number.isSafeInteger(v)) {
        throw new TypeError(`invalid serialized RngState: bad ${key}`);
      }
    }
    return new Xoshiro128StarStar(raw as RngState);
  }
}

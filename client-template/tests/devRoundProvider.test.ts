import { describe, expect, test } from 'bun:test';
import { DevRoundProvider } from '../src/core/devRoundProvider.js';
import { stepsWinTotalMinor, validateManifest } from '../src/core/roundProvider.js';
import { makeConfig, makeGuaranteedWinConfig } from './fixtures.js';

const BET = 100;

describe('determinism', () => {
  test('same config + same seed + same call sequence ⇒ identical manifests', async () => {
    const a = new DevRoundProvider(makeConfig(), 1234);
    const b = new DevRoundProvider(makeConfig(), 1234);
    for (let i = 0; i < 25; i++) {
      const ma = await a.requestRound(BET);
      const mb = await b.requestRound(BET);
      expect(JSON.stringify(ma)).toBe(JSON.stringify(mb));
    }
  });

  test('forced options are part of the deterministic sequence', async () => {
    const a = new DevRoundProvider(makeConfig(), 77);
    const b = new DevRoundProvider(makeConfig(), 77);
    const ma = await a.requestRound(BET, { forceScatterCount: 4 });
    const mb = await b.requestRound(BET, { forceScatterCount: 4 });
    expect(JSON.stringify(ma)).toBe(JSON.stringify(mb));
  });

  test('different seeds ⇒ different round streams', async () => {
    const a = new DevRoundProvider(makeConfig(), 1);
    const b = new DevRoundProvider(makeConfig(), 2);
    const grids: string[] = [];
    for (let i = 0; i < 5; i++) {
      grids.push(JSON.stringify((await a.requestRound(BET)).steps[0]!.grid));
      grids.push(JSON.stringify((await b.requestRound(BET)).steps[0]!.grid));
    }
    // at least one initial grid must differ across the two streams
    expect(new Set(grids).size).toBeGreaterThan(5);
  });
});

describe('manifest validity', () => {
  test('every generated manifest passes shared validation', async () => {
    const provider = new DevRoundProvider(makeConfig(), 999);
    for (let i = 0; i < 50; i++) {
      const manifest = await provider.requestRound(BET);
      expect(validateManifest(manifest)).toEqual([]);
      expect(manifest.steps[0]!.type).toBe('initial_result');
      expect(manifest.steps.at(-1)!.type).toBe('settlement');
      if (!manifest.capped) {
        expect(stepsWinTotalMinor(manifest)).toBe(manifest.totalWinMinor);
      }
    }
  });

  test('bet outside config range is rejected', async () => {
    const provider = new DevRoundProvider(makeConfig(), 1);
    await expect(provider.requestRound(5)).rejects.toThrow(RangeError); // below minBetMinor
    await expect(provider.requestRound(20_000)).rejects.toThrow(RangeError);
    await expect(provider.requestRound(100.5)).rejects.toThrow(RangeError);
  });
});

describe('scatter tier mapping 3/4/5+', () => {
  test.each([
    [3, 'feature', 6, 2],
    [4, 'super_feature', 10, 3],
    [5, 'ultimate_feature', 12, 5],
  ] as const)('%i scatters → %s (tier-distinct rounds/multipliers)', async (scatters, tierId, rounds, multiplier) => {
    const provider = new DevRoundProvider(makeConfig(), 4242);
    const manifest = await provider.requestRound(BET, { forceScatterCount: scatters });
    expect(validateManifest(manifest)).toEqual([]);
    expect(manifest.steps[0]!.scatterCount).toBe(scatters);
    expect(manifest.feature).not.toBeNull();
    expect(manifest.feature!.tierId).toBe(tierId);
    expect(manifest.feature!.multiplier).toBe(multiplier);
    expect(manifest.feature!.triggerScatterCount).toBe(scatters);
    expect(manifest.feature!.retriggerCount).toBeLessThanOrEqual(manifest.feature!.retriggerCap);
    // base awarded rounds come from the tier config
    expect(manifest.feature!.roundsAwarded).toBeGreaterThanOrEqual(rounds);
    // trigger step present, tier-specific enter event
    const trigger = manifest.steps.find((s) => s.type === 'feature_trigger');
    expect(trigger).toBeDefined();
    expect(trigger!.events).toContain(`anim.${tierId}.enter`);
    // every feature round carries the tier multiplier (materially different tiers)
    const featureRounds = manifest.steps.filter((s) => s.type === 'feature_round');
    expect(featureRounds.length).toBeGreaterThan(0);
    for (const s of featureRounds) expect(s.multiplier).toBe(multiplier);
  });

  test('fewer than 3 scatters never triggers a feature', async () => {
    const provider = new DevRoundProvider(makeConfig(), 31337);
    for (const scatters of [0, 1, 2]) {
      const manifest = await provider.requestRound(BET, { forceScatterCount: scatters });
      expect(manifest.feature).toBeNull();
      expect(manifest.steps.some((s) => s.type === 'feature_trigger')).toBe(false);
    }
  });

  test('bonus buy forces the purchased tier', async () => {
    const provider = new DevRoundProvider(makeConfig(), 5150);
    const manifest = await provider.requestRound(BET, { bonusBuyTier: 'super_feature', forceScatterCount: 0 });
    expect(manifest.feature!.tierId).toBe('super_feature');
  });
});

describe('max-win cap enforcement (§9.4)', () => {
  test('guaranteed-win config with 1x cap terminates at exactly the cap', async () => {
    const provider = new DevRoundProvider(makeGuaranteedWinConfig(1), 1);
    const manifest = await provider.requestRound(BET);
    expect(validateManifest(manifest)).toEqual([]);
    expect(manifest.capped).toBe(true);
    expect(manifest.totalWinMinor).toBe(manifest.maxWinCapMinor);
    expect(manifest.maxWinCapMinor).toBe(BET * 1);
    expect(manifest.steps.some((s) => s.type === 'max_win_termination')).toBe(true);
    // only settlement may follow the termination step
    const idx = manifest.steps.findIndex((s) => s.type === 'max_win_termination');
    expect(manifest.steps.slice(idx + 1).every((s) => s.type === 'settlement')).toBe(true);
    // raw step wins exceed the cap; settlement is clamped to it
    expect(stepsWinTotalMinor(manifest)).toBeGreaterThanOrEqual(manifest.maxWinCapMinor);
  });

  test('cap terminates a feature early too', async () => {
    const provider = new DevRoundProvider(makeGuaranteedWinConfig(40), 7);
    // 40x cap: even with 3 forced scatters at least one 50x H1 line survives,
    // so the cap is guaranteed to be exceeded before the feature plays
    const manifest = await provider.requestRound(BET, { forceScatterCount: 3 });
    expect(manifest.capped).toBe(true);
    expect(manifest.totalWinMinor).toBe(manifest.maxWinCapMinor);
  });

  test('cascade loop always terminates (hard step cap)', async () => {
    // guaranteed wins + cascades enabled would loop forever without the cap
    const config = makeGuaranteedWinConfig(5000);
    config.cascades = { enabled: true, maxSteps: 4 };
    const provider = new DevRoundProvider(config, 3);
    const manifest = await provider.requestRound(BET);
    const cascadeSteps = manifest.steps.filter((s) => s.type === 'cascade');
    expect(cascadeSteps.length).toBeLessThanOrEqual(4);
    expect(validateManifest(manifest)).toEqual([]);
  });
});

describe('resume (dev recovery scenario)', () => {
  test('devMarkInterrupted → resume returns the committed manifest once', async () => {
    const provider = new DevRoundProvider(makeConfig(), 11);
    const manifest = await provider.requestRound(BET, { forceScatterCount: 3 });
    const pointer = manifest.steps[2]!.stepId;
    provider.devMarkInterrupted(pointer);
    const resumed = await provider.resume();
    expect(resumed).not.toBeNull();
    expect(resumed!.resumePointer).toBe(pointer);
    expect(resumed!.manifest.roundId).toBe(manifest.roundId);
    expect(resumed!.manifest.totalWinMinor).toBe(manifest.totalWinMinor); // never re-settled
    expect(await provider.resume()).toBeNull(); // consumed
  });

  test('resume is null when nothing was interrupted', async () => {
    const provider = new DevRoundProvider(makeConfig(), 12);
    expect(await provider.resume()).toBeNull();
  });
});

describe('production guard', () => {
  test('construction throws when NODE_ENV=production', () => {
    const prev = process.env['NODE_ENV'];
    process.env['NODE_ENV'] = 'production';
    try {
      expect(() => new DevRoundProvider(makeConfig(), 1)).toThrow(/DEV\/TEST ONLY/);
    } finally {
      if (prev === undefined) delete process.env['NODE_ENV'];
      else process.env['NODE_ENV'] = prev;
    }
  });

  test('provider is loudly flagged dev-only', () => {
    expect(new DevRoundProvider(makeConfig(), 1).isDevOnly).toBe(true);
  });
});

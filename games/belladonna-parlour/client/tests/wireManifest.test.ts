/**
 * Wire-format serialization tests — toWireManifest must emit exactly the
 * shape of ../schemas/outcome-manifest.schema.json (the authoritative check
 * is the external JSON-Schema validation run by
 * scripts/export-wire-manifests.ts + jsonschema; these tests encode the
 * schema's fixed structural constraints so regressions fail fast in
 * `bun test` without adding a validator dependency).
 */

import { describe, expect, test } from 'bun:test';
import { DevRoundProvider } from '../src/core/devRoundProvider.js';
import {
  DEV_PLACEHOLDER_CONFIG_HASH,
  toWireManifest,
  wireMetaFromConfig,
  type WireOutcomeManifest,
} from '../src/core/wireManifest.js';
import { makeConfig, makeGuaranteedWinConfig } from './fixtures.js';

const BET = 100;

const TOP_LEVEL_KEYS = new Set([
  'schemaVersion',
  'roundId',
  'gameId',
  'gameVersion',
  'mathVersion',
  'mathProfileId',
  'configHash',
  'currency',
  'wagerMinor',
  'initialBalanceMinor',
  'initialGrid',
  'steps',
  'feature',
  'totalWinMinor',
  'maximumWinReached',
  'balanceAfterMinor',
  'roundComplete',
  'resumePointer',
  'signature',
  'ext',
]);
const REQUIRED_KEYS = [
  'schemaVersion',
  'roundId',
  'gameId',
  'gameVersion',
  'mathVersion',
  'mathProfileId',
  'configHash',
  'currency',
  'wagerMinor',
  'initialGrid',
  'steps',
  'feature',
  'totalWinMinor',
  'maximumWinReached',
  'roundComplete',
  'signature',
];
const STEP_KEYS = new Set(['stepId', 'type', 'grid', 'wins', 'scatterCount', 'multiplier100', 'events']);
const WIN_KEYS = new Set(['symbolId', 'positions', 'payX100', 'winMinor', 'lineId', 'waysCount', 'clusterSize']);
const FEATURE_KEYS = new Set([
  'triggered',
  'tier',
  'initialRounds',
  'remainingRounds',
  'steps',
  'retriggers',
  'maxWinReached',
]);
const EVENT_ID = /^(anim\.[a-z0-9_]+\.[a-z0-9_]+|music\.[a-z0-9_]+|sfx\.[a-z0-9_]+\.[a-z0-9_]+|amb\.[a-z0-9_]+|ui\.[a-z0-9_]+|haptic\.(light|medium|heavy))$/;
const SEMVER = /^\d+\.\d+\.\d+$/;
const SHA256 = /^sha256:[0-9a-f]{64}$/;

async function wireFor(seed: number, opts = {}, config = makeConfig()): Promise<WireOutcomeManifest> {
  const provider = new DevRoundProvider(config, seed);
  const manifest = await provider.requestRound(BET, opts);
  return toWireManifest(manifest, wireMetaFromConfig(config));
}

function assertSchemaShape(wire: WireOutcomeManifest): void {
  for (const key of Object.keys(wire)) expect(TOP_LEVEL_KEYS.has(key)).toBe(true);
  for (const key of REQUIRED_KEYS) expect(wire).toHaveProperty(key);
  expect(wire.schemaVersion).toMatch(SEMVER);
  expect(wire.gameVersion).toMatch(SEMVER);
  expect(wire.mathVersion).toMatch(SEMVER);
  expect(wire.roundId).toMatch(/^rnd_[A-Za-z0-9_-]{6,}$/);
  expect(wire.gameId).toMatch(/^[a-z][a-z0-9-]{2,60}$/);
  expect(wire.mathProfileId).toMatch(/^[a-z][a-z0-9-]{1,40}$/);
  expect(wire.configHash).toMatch(SHA256);
  expect(wire.currency).toMatch(/^[A-Z]{3}$/);
  expect(wire.roundComplete).toBe(true);
  expect(wire.signature.length).toBeGreaterThan(0);

  const allSteps = [...wire.steps, ...(wire.feature.steps ?? [])];
  expect(wire.steps.length).toBeGreaterThan(0);
  for (const step of allSteps) {
    for (const key of Object.keys(step)) expect(STEP_KEYS.has(key)).toBe(true);
    expect(STEP_KEYS.size).toBe(Object.keys(step).length); // all step fields are required
    expect(step.stepId).toMatch(/^step-[0-9]+$/);
    expect(step.multiplier100).toBeGreaterThanOrEqual(100);
    expect(step.multiplier100 % 100).toBe(0); // integer multipliers in this template
    expect(step.events.length).toBeLessThanOrEqual(40);
    for (const event of step.events) expect(event).toMatch(EVENT_ID);
    for (const column of step.grid) {
      for (const symbol of column) expect(symbol).toMatch(/^[A-Z][A-Z0-9_]{0,15}$/);
    }
    for (const win of step.wins) {
      for (const key of Object.keys(win)) expect(WIN_KEYS.has(key)).toBe(true);
      expect(win).not.toHaveProperty('count'); // schema: additionalProperties false
      expect(win.positions.length).toBeGreaterThan(0);
      for (const pos of win.positions) expect(pos.length).toBe(2);
    }
  }

  // stepIds are manifest-globally unique and strictly ascending step-1..step-N.
  const ids = allSteps
    .map((s) => Number(s.stepId.slice('step-'.length)))
    .sort((a, b) => a - b);
  ids.forEach((n, i) => expect(n).toBe(i + 1));

  for (const key of Object.keys(wire.feature)) expect(FEATURE_KEYS.has(key)).toBe(true);
  if (wire.feature.triggered) {
    for (const key of FEATURE_KEYS) expect(wire.feature).toHaveProperty(key);
    expect(wire.feature.initialRounds!).toBeGreaterThanOrEqual(1);
    expect(wire.feature.remainingRounds).toBe(0);
    expect(wire.feature.retriggers!).toBeGreaterThanOrEqual(0);
  } else {
    expect(Object.keys(wire.feature)).toEqual(['triggered']);
    expect(wire.feature.steps).toBeUndefined();
  }
}

describe('toWireManifest — schema shape', () => {
  test('20 diverse manifests all serialize to the exact schema shape', async () => {
    const wires: WireOutcomeManifest[] = [];
    for (let seed = 1; seed <= 8; seed++) wires.push(await wireFor(seed));
    for (const [seed, scatters] of [
      [101, 3],
      [102, 4],
      [103, 5],
    ] as const) {
      wires.push(await wireFor(seed, { forceScatterCount: scatters }));
    }
    for (const [seed, tier] of [
      [104, 'feature'],
      [105, 'super_feature'],
      [106, 'ultimate_feature'],
    ] as const) {
      wires.push(await wireFor(seed, { bonusBuyTier: tier, forceScatterCount: 0 }));
    }
    wires.push(await wireFor(107, {}, makeGuaranteedWinConfig(1)));
    wires.push(await wireFor(108, { forceScatterCount: 5 }, makeConfig({ maxWinXBet: 20 })));
    for (const seed of [109, 110, 111]) wires.push(await wireFor(seed));
    wires.push(await wireFor(112, { forceScatterCount: 4 }));

    expect(wires.length).toBe(20);
    for (const wire of wires) assertSchemaShape(wire);
    // coverage: at least one triggered feature and one capped round in the set
    expect(wires.some((w) => w.feature.triggered)).toBe(true);
    expect(wires.some((w) => w.maximumWinReached)).toBe(true);
  });

  test('field mapping: multiplier→multiplier100, betMinor→wagerMinor, capped→maximumWinReached', async () => {
    const config = makeConfig();
    const provider = new DevRoundProvider(config, 4242);
    const manifest = await provider.requestRound(BET, { forceScatterCount: 4 });
    const wire = toWireManifest(manifest, wireMetaFromConfig(config));

    expect(wire.wagerMinor).toBe(manifest.betMinor);
    expect(wire.totalWinMinor).toBe(manifest.totalWinMinor);
    expect(wire.maximumWinReached).toBe(manifest.capped);
    expect(wire.initialGrid).toEqual(manifest.steps[0]!.grid);
    expect(wire.gameId).toBe(config.projectSlug);
    expect(wire.mathProfileId).toBe('rtp-96');
    expect(wire.configHash).toBe(DEV_PLACEHOLDER_CONFIG_HASH);

    // super_feature: tier fields carried over exactly
    expect(wire.feature.triggered).toBe(true);
    expect(wire.feature.tier).toBe('super_feature');
    expect(wire.feature.initialRounds).toBe(manifest.feature!.initialRoundsAwarded);
    expect(wire.feature.retriggers).toBe(manifest.feature!.retriggerCount);

    // feature rounds moved out of the base steps array, multipliers x100
    expect(wire.steps.some((s) => s.type === 'feature_round' || s.type === 'feature_retrigger')).toBe(false);
    const featureRounds = wire.feature.steps!.filter((s) => s.type === 'feature_round');
    expect(featureRounds.length).toBeGreaterThan(0);
    for (const s of featureRounds) expect(s.multiplier100).toBe(manifest.feature!.multiplier * 100);
    // base+feature step count is conserved
    expect(wire.steps.length + wire.feature.steps!.length).toBe(manifest.steps.length);
  });

  test('resumePointer is carried into the wire payload', async () => {
    const config = makeConfig();
    const provider = new DevRoundProvider(config, 112);
    await provider.requestRound(BET, { forceScatterCount: 3 });
    provider.devMarkInterrupted('step-2');
    const resumed = await provider.resume();
    const wire = toWireManifest(resumed!.manifest, wireMetaFromConfig(config));
    expect(wire.resumePointer).toBe('step-2');
  });

  test('deterministic: same seed + options ⇒ byte-identical wire JSON', async () => {
    const a = await wireFor(777, { forceScatterCount: 4 });
    const b = await wireFor(777, { forceScatterCount: 4 });
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  test('serialization never mutates the internal manifest', async () => {
    const config = makeConfig();
    const provider = new DevRoundProvider(config, 999);
    const manifest = await provider.requestRound(BET, { forceScatterCount: 3 });
    const before = JSON.stringify(manifest);
    toWireManifest(manifest, wireMetaFromConfig(config));
    expect(JSON.stringify(manifest)).toBe(before);
  });

  test('feature steps without a feature block are rejected', async () => {
    const config = makeConfig();
    const provider = new DevRoundProvider(config, 5);
    const manifest = await provider.requestRound(BET, { forceScatterCount: 3 });
    const broken = { ...manifest, feature: null };
    expect(() => toWireManifest(broken, wireMetaFromConfig(config))).toThrow(/feature steps/);
  });
});

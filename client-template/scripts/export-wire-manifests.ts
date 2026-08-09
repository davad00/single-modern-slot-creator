/**
 * Export 20 diverse wire-format outcome manifests for external JSON-Schema
 * validation against ../schemas/outcome-manifest.schema.json (see README /
 * CONVENTIONS §7). Deterministic: fixed seeds, no wall clock.
 *
 *   bun run scripts/export-wire-manifests.ts <outputDir>
 *
 * The suite covers: natural spins across seeds/bets, all three forced scatter
 * tiers, all three bonus-buy tiers, max-win-capped rounds (base and feature),
 * and a recovery payload with resumePointer.
 */

import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { DevRoundProvider } from '../src/core/devRoundProvider.js';
import { toWireManifest, wireMetaFromConfig } from '../src/core/wireManifest.js';
import type { OutcomeManifest } from '../src/core/types.js';
import { makeConfig, makeGuaranteedWinConfig } from '../tests/fixtures.js';

const outDir = process.argv[2];
if (!outDir) {
  console.error('usage: bun run scripts/export-wire-manifests.ts <outputDir>');
  process.exit(1);
}
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

interface Case {
  label: string;
  run: () => Promise<{ manifest: OutcomeManifest; config: ReturnType<typeof makeConfig> }>;
}

function spin(
  config: ReturnType<typeof makeConfig>,
  seed: number,
  betMinor: number,
  opts: Parameters<DevRoundProvider['requestRound']>[1] = {},
): Case['run'] {
  return async () => {
    const provider = new DevRoundProvider(config, seed);
    return { manifest: await provider.requestRound(betMinor, opts), config };
  };
}

const base = makeConfig();
const cases: Case[] = [
  { label: 'natural-seed-1', run: spin(base, 1, 100) },
  { label: 'natural-seed-2', run: spin(base, 2, 100) },
  { label: 'natural-seed-3', run: spin(base, 3, 100) },
  { label: 'natural-seed-4', run: spin(base, 4, 100) },
  { label: 'natural-seed-5', run: spin(base, 5, 100) },
  { label: 'natural-seed-6', run: spin(base, 6, 100) },
  { label: 'natural-seed-7', run: spin(base, 7, 100) },
  { label: 'natural-seed-8', run: spin(base, 8, 100) },
  { label: 'forced-3-scatters-feature', run: spin(base, 101, 100, { forceScatterCount: 3 }) },
  { label: 'forced-4-scatters-super', run: spin(base, 102, 100, { forceScatterCount: 4 }) },
  { label: 'forced-5-scatters-ultimate', run: spin(base, 103, 100, { forceScatterCount: 5 }) },
  { label: 'bonus-buy-feature', run: spin(base, 104, 100, { bonusBuyTier: 'feature', forceScatterCount: 0 }) },
  { label: 'bonus-buy-super', run: spin(base, 105, 100, { bonusBuyTier: 'super_feature', forceScatterCount: 0 }) },
  { label: 'bonus-buy-ultimate', run: spin(base, 106, 100, { bonusBuyTier: 'ultimate_feature', forceScatterCount: 0 }) },
  { label: 'capped-base-round', run: spin(makeGuaranteedWinConfig(1), 107, 100) },
  { label: 'capped-during-feature', run: spin(makeConfig({ maxWinXBet: 20 }), 108, 100, { forceScatterCount: 5 }) },
  { label: 'min-bet', run: spin(base, 109, 10) },
  { label: 'max-bet', run: spin(base, 110, 10000) },
  { label: 'odd-bet-with-feature', run: spin(base, 111, 250, { forceScatterCount: 3 }) },
  {
    label: 'recovery-resume-pointer',
    run: async () => {
      const provider = new DevRoundProvider(base, 112);
      await provider.requestRound(100, { forceScatterCount: 3 });
      provider.devMarkInterrupted('step-2');
      const resumed = await provider.resume();
      if (!resumed) throw new Error('expected a pending resume');
      return { manifest: resumed.manifest, config: base };
    },
  },
];

if (cases.length !== 20) throw new Error(`expected 20 cases, have ${cases.length}`);

for (let i = 0; i < cases.length; i++) {
  const { label, run } = cases[i]!;
  const { manifest, config } = await run();
  const wire = toWireManifest(manifest, wireMetaFromConfig(config));
  const file = join(outDir, `wire-manifest-${String(i + 1).padStart(2, '0')}-${label}.json`);
  await Bun.write(file, JSON.stringify(wire, null, 2));
  console.log(
    `${file}  feature=${wire.feature.triggered ? wire.feature.tier : 'none'} capped=${wire.maximumWinReached} steps=${wire.steps.length}+${wire.feature.steps?.length ?? 0}`,
  );
}
console.log('exported 20 wire manifests');

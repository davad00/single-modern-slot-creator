/**
 * Config loading + lightweight structural validation.
 *
 * The authoritative validation is JSON Schema (schemas/*.schema.json) run in
 * the QA step; this module performs fast structural checks so the client
 * fails loudly on malformed configs instead of misbehaving at runtime. It is
 * pure: file/network access is injected (`readJson`), so the module works in
 * browsers, Bun, and tests without DOM or fs dependencies.
 */

import type { GameConfig, JurisdictionPolicy, ScatterTierConfig } from './types.js';
import { SYMBOL_ID_PATTERN, TIER_IDS } from './types.js';

export interface ConfigIssue {
  path: string;
  message: string;
}

export class ConfigError extends Error {
  constructor(
    readonly file: string,
    readonly issues: ConfigIssue[],
  ) {
    super(`invalid config "${file}":\n${issues.map((i) => `  ${i.path}: ${i.message}`).join('\n')}`);
    this.name = 'ConfigError';
  }
}

type Raw = Record<string, unknown>;

function isObject(v: unknown): v is Raw {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function checkInt(raw: Raw, key: string, issues: ConfigIssue[], opts: { min?: number } = {}): void {
  const v = raw[key];
  if (typeof v !== 'number' || !Number.isSafeInteger(v) || (opts.min !== undefined && v < opts.min)) {
    issues.push({ path: key, message: `must be an integer${opts.min !== undefined ? ` ≥ ${opts.min}` : ''}` });
  }
}

function checkString(raw: Raw, key: string, issues: ConfigIssue[], pattern?: RegExp): void {
  const v = raw[key];
  if (typeof v !== 'string' || v.length === 0 || (pattern && !pattern.test(v))) {
    issues.push({ path: key, message: `must be a non-empty string${pattern ? ` matching ${pattern}` : ''}` });
  }
}

function checkBool(raw: Raw, key: string, issues: ConfigIssue[]): void {
  if (typeof raw[key] !== 'boolean') issues.push({ path: key, message: 'must be a boolean' });
}

const SEMVER = /^\d+\.\d+\.\d+$/;
const SLUG = /^[a-z][a-z0-9-]{2,40}$/;

/** Structural validation of the game-config subset the core consumes. */
export function validateGameConfig(raw: unknown): ConfigIssue[] {
  const issues: ConfigIssue[] = [];
  if (!isObject(raw)) return [{ path: '', message: 'config must be an object' }];

  checkString(raw, 'projectSlug', issues, SLUG);
  checkString(raw, 'gameVersion', issues, SEMVER);
  checkString(raw, 'mathVersion', issues, SEMVER);
  checkString(raw, 'currency', issues, /^[A-Z]{3}$/);
  checkInt(raw, 'columns', issues, { min: 3 });
  checkInt(raw, 'rows', issues, { min: 2 });
  checkInt(raw, 'minBetMinor', issues, { min: 1 });
  checkInt(raw, 'maxBetMinor', issues, { min: 1 });
  checkInt(raw, 'maxWinXBet', issues, { min: 1 });

  const rtp = raw['rtpTarget'];
  if (typeof rtp !== 'number' || rtp <= 0 || rtp >= 1) {
    issues.push({ path: 'rtpTarget', message: 'must be a fraction in (0, 1), e.g. 0.96' });
  }
  if (
    typeof raw['minBetMinor'] === 'number' &&
    typeof raw['maxBetMinor'] === 'number' &&
    raw['maxBetMinor'] < raw['minBetMinor']
  ) {
    issues.push({ path: 'maxBetMinor', message: 'must be ≥ minBetMinor' });
  }

  const columns = typeof raw['columns'] === 'number' ? raw['columns'] : 0;
  const rows = typeof raw['rows'] === 'number' ? raw['rows'] : 0;

  const lines = raw['lines'];
  if (!Array.isArray(lines) || lines.length === 0) {
    issues.push({ path: 'lines', message: 'must be a non-empty array of paylines' });
  } else {
    lines.forEach((line, i) => {
      if (!Array.isArray(line) || line.length !== columns) {
        issues.push({ path: `lines[${i}]`, message: `must have exactly ${columns} row indices` });
      } else if (line.some((r) => !Number.isSafeInteger(r) || r < 0 || r >= rows)) {
        issues.push({ path: `lines[${i}]`, message: `row indices must be integers in [0, ${rows})` });
      }
    });
  }

  const symbols = raw['symbols'];
  if (!Array.isArray(symbols) || symbols.length === 0) {
    issues.push({ path: 'symbols', message: 'must be a non-empty array' });
  } else {
    symbols.forEach((s, i) => {
      if (!isObject(s) || typeof s['id'] !== 'string' || !SYMBOL_ID_PATTERN.test(s['id'])) {
        issues.push({ path: `symbols[${i}].id`, message: `must match ${SYMBOL_ID_PATTERN}` });
      }
    });
  }

  const paytable = raw['paytable'];
  if (!Array.isArray(paytable)) {
    issues.push({ path: 'paytable', message: 'must be an array' });
  } else {
    paytable.forEach((e, i) => {
      if (
        !isObject(e) ||
        typeof e['symbolId'] !== 'string' ||
        !Number.isSafeInteger(e['count']) ||
        (e['count'] as number) < 2 ||
        !Number.isSafeInteger(e['payX100']) ||
        (e['payX100'] as number) < 0
      ) {
        issues.push({ path: `paytable[${i}]`, message: 'must be {symbolId, count ≥ 2, payX100 ≥ 0 int}' });
      }
    });
  }

  const reelSets = raw['reelSets'];
  if (!Array.isArray(reelSets) || reelSets.length === 0) {
    issues.push({ path: 'reelSets', message: 'must be a non-empty array' });
  } else {
    if (!reelSets.some((r) => isObject(r) && r['context'] === 'base')) {
      issues.push({ path: 'reelSets', message: 'must include a reel set with context "base"' });
    }
    reelSets.forEach((r, i) => {
      if (!isObject(r) || !Array.isArray(r['strips']) || (columns > 0 && r['strips'].length !== columns)) {
        issues.push({ path: `reelSets[${i}].strips`, message: `must be an array of ${columns} strips` });
        return;
      }
      (r['strips'] as unknown[]).forEach((strip, c) => {
        if (!Array.isArray(strip) || strip.length < rows || strip.some((s) => typeof s !== 'string' || !SYMBOL_ID_PATTERN.test(s))) {
          issues.push({ path: `reelSets[${i}].strips[${c}]`, message: `must be ≥ ${rows} valid symbol ids` });
        }
      });
    });
  }

  const tiers = raw['scatterTiers'];
  if (!Array.isArray(tiers) || tiers.length !== 3) {
    issues.push({ path: 'scatterTiers', message: 'must contain exactly the three tiers (3/4/5+ scatters)' });
  } else {
    const seen = new Set<string>();
    (tiers as unknown[]).forEach((t, i) => {
      if (!isObject(t)) {
        issues.push({ path: `scatterTiers[${i}]`, message: 'must be an object' });
        return;
      }
      const tierId = t['tierId'];
      if (typeof tierId !== 'string' || !(TIER_IDS as readonly string[]).includes(tierId)) {
        issues.push({ path: `scatterTiers[${i}].tierId`, message: `must be one of ${TIER_IDS.join(', ')}` });
      } else {
        seen.add(tierId);
      }
      const tRaw = t as Raw;
      checkInt(tRaw, 'scatters', issues, { min: 3 });
      checkInt(tRaw, 'roundsAwarded', issues, { min: 1 });
      checkInt(tRaw, 'multiplier', issues, { min: 1 });
      checkInt(tRaw, 'retriggerCap', issues, { min: 0 });
    });
    if (seen.size === 3) {
      // Tiers must be materially different in math (§9.3) — at minimum the
      // rounds/multiplier pair must be pairwise distinct.
      const sigs = (tiers as ScatterTierConfig[]).map((t) => `${t.roundsAwarded}:${t.multiplier}`);
      if (new Set(sigs).size !== 3) {
        issues.push({ path: 'scatterTiers', message: 'tiers must differ materially (rounds/multiplier pairwise distinct)' });
      }
    } else if ((tiers as unknown[]).every(isObject)) {
      issues.push({ path: 'scatterTiers', message: 'all three tier ids must be present exactly once' });
    }
  }

  const cascades = raw['cascades'];
  if (!isObject(cascades)) {
    issues.push({ path: 'cascades', message: 'must be an object {enabled, maxSteps}' });
  } else {
    checkBool(cascades, 'enabled', issues);
    checkInt(cascades, 'maxSteps', issues, { min: 1 });
  }

  return issues;
}

/** Structural validation of a jurisdiction policy. */
export function validateJurisdictionPolicy(raw: unknown): ConfigIssue[] {
  const issues: ConfigIssue[] = [];
  if (!isObject(raw)) return [{ path: '', message: 'policy must be an object' }];
  checkString(raw, 'jurisdictionId', issues);
  checkBool(raw, 'autoplayAllowed', issues);
  checkInt(raw, 'autoplayMaxRounds', issues, { min: 0 });
  checkBool(raw, 'quickSpinAllowed', issues);
  checkBool(raw, 'turboSpinAllowed', issues);
  checkBool(raw, 'slamStopAllowed', issues);
  checkBool(raw, 'bonusBuyAllowed', issues);
  checkInt(raw, 'minRoundDurationMs', issues, { min: 0 });
  checkBool(raw, 'rtpDisplayRequired', issues);
  const rc = raw['realityCheckIntervalMs'];
  if (rc !== null && (!Number.isSafeInteger(rc) || (rc as number) <= 0)) {
    issues.push({ path: 'realityCheckIntervalMs', message: 'must be a positive integer or null' });
  }
  if (raw['autoplayAllowed'] === false && raw['autoplayMaxRounds'] !== 0) {
    issues.push({ path: 'autoplayMaxRounds', message: 'must be 0 when autoplay is disallowed' });
  }
  return issues;
}

/** Parse + validate; throws ConfigError on any issue. */
export function parseGameConfig(raw: unknown, file = 'game-config.json'): GameConfig {
  const issues = validateGameConfig(raw);
  if (issues.length > 0) throw new ConfigError(file, issues);
  return raw as GameConfig;
}

export function parseJurisdictionPolicy(raw: unknown, file = 'jurisdiction-policies.json'): JurisdictionPolicy {
  const issues = validateJurisdictionPolicy(raw);
  if (issues.length > 0) throw new ConfigError(file, issues);
  return raw as JurisdictionPolicy;
}

export interface ConfigBundle {
  gameConfig: GameConfig;
  jurisdictionPolicy: JurisdictionPolicy;
}

/**
 * Load the config bundle through an injected reader
 * (e.g. `(name) => fetch(`config/${name}`).then(r => r.json())` in the
 * browser, or Bun.file(...).json() in tooling).
 */
export async function loadConfigBundle(readJson: (fileName: string) => Promise<unknown>): Promise<ConfigBundle> {
  const [gameRaw, policyRaw] = await Promise.all([readJson('game-config.json'), readJson('jurisdiction-policies.json')]);
  return {
    gameConfig: parseGameConfig(gameRaw),
    jurisdictionPolicy: parseJurisdictionPolicy(policyRaw),
  };
}

/**
 * ╔════════════════════════════════════════════════════════════════════════╗
 * ║  DEV / TEST ONLY ROUND PROVIDER — NOT A GAME SERVER.                    ║
 * ║                                                                        ║
 * ║  Real-money outcomes come ONLY from the RGS (rgsAdapter.ts).           ║
 * ║  This provider fabricates valid OutcomeManifests locally from a seeded ║
 * ║  RNG so the client can be developed and tested deterministically.      ║
 * ║  It THROWS on construction when NODE_ENV === 'production'.             ║
 * ╚════════════════════════════════════════════════════════════════════════╝
 *
 * Determinism guarantee: same GameConfig + same seed + same call sequence
 * (including options) ⇒ byte-identical manifests. No Date.now(), no
 * Math.random(), no ambient state.
 */

import type {
  GameConfig,
  GridPosition,
  OutcomeManifest,
  ReelContext,
  ScatterTierConfig,
  Step,
  StepType,
  Win,
} from './types.js';
import { maxWinCapMinor, winMinor } from './money.js';
import { Xoshiro128StarStar, type RngState } from './rng.js';
import type { RequestRoundOptions, ResumeResult, RoundProvider } from './roundProvider.js';
import { assertValidManifest } from './roundProvider.js';

const WILD = 'WILD';
const SCATTER = 'SCATTER';

export interface DevRequestRoundOptions extends RequestRoundOptions {
  /**
   * DEV/TEST ONLY: force the initial grid to show exactly this many scatters
   * so tier paths can be exercised deterministically. Never part of the
   * production RoundProvider contract.
   */
  forceScatterCount?: number;
}

function assertNotProduction(): void {
  // Works in Bun/Node and in browser bundles where `process` may be absent.
  const env =
    typeof process !== 'undefined' && typeof process.env !== 'undefined' ? process.env['NODE_ENV'] : undefined;
  if (env === 'production') {
    throw new Error(
      'DevRoundProvider is DEV/TEST ONLY and must never run in production. ' +
        'Real-money outcomes come only from the RGS adapter.',
    );
  }
}

interface SpinResult {
  grid: string[][];
  scatterCount: number;
}

export class DevRoundProvider implements RoundProvider {
  /** Loud flag so integration code can assert it never ships a dev provider. */
  readonly isDevOnly = true as const;

  private readonly rng: Xoshiro128StarStar;
  private readonly seed: number;
  private roundCounter = 0;
  private pendingResume: ResumeResult | null = null;
  private lastManifest: OutcomeManifest | null = null;

  constructor(
    private readonly config: GameConfig,
    seed: number,
  ) {
    assertNotProduction();
    if (!Number.isSafeInteger(seed)) throw new RangeError(`seed must be a safe integer, got ${seed}`);
    this.seed = seed >>> 0;
    this.rng = new Xoshiro128StarStar(this.seed);
  }

  /** Recorded so simulation reports can reproduce every round (§5). */
  getSeed(): number {
    return this.seed;
  }

  getRngState(): RngState {
    return this.rng.getState();
  }

  async requestRound(betMinor: number, opts: DevRequestRoundOptions = {}): Promise<OutcomeManifest> {
    assertNotProduction();
    if (!Number.isSafeInteger(betMinor) || betMinor < this.config.minBetMinor || betMinor > this.config.maxBetMinor) {
      throw new RangeError(
        `betMinor ${betMinor} outside [${this.config.minBetMinor}, ${this.config.maxBetMinor}] or not an integer`,
      );
    }
    this.roundCounter += 1;
    const roundId = `rnd_dev_${this.seed.toString(16).padStart(8, '0')}_${String(this.roundCounter).padStart(4, '0')}`;
    const capMinor = maxWinCapMinor(betMinor, this.config.maxWinXBet);

    const steps: Step[] = [];
    let cumulativeWinMinor = 0;
    let capped = false;
    const pushStep = (partial: Omit<Step, 'stepId'>): Step => {
      const step: Step = { stepId: `step-${steps.length + 1}`, ...partial };
      steps.push(step);
      for (const w of step.wins) cumulativeWinMinor += w.winMinor;
      return step;
    };

    // --- initial spin -----------------------------------------------------
    const initial = this.spinGrid('base', opts.forceScatterCount);
    const initialWins = this.evaluateLineWins(initial.grid, betMinor, 1);
    const initialEvents = ['anim.reel.spin_start', 'anim.reel.stop'];
    if (initial.scatterCount > 0) initialEvents.push('anim.scatter.land');
    if (initial.scatterCount >= 2) initialEvents.push('anim.scatter.anticipation');
    if (initialWins.length > 0) initialEvents.push('anim.win.countup');
    pushStep({
      type: 'initial_result',
      grid: initial.grid,
      wins: initialWins,
      scatterCount: initial.scatterCount,
      multiplier: 1,
      events: initialEvents,
    });

    // --- cascades (base game) ----------------------------------------------
    if (!this.capReached(cumulativeWinMinor, capMinor)) {
      const afterCascades = this.runCascades(initial.grid, initialWins, betMinor, 1, capMinor, () => cumulativeWinMinor, pushStep);
      capped = afterCascades.capReached;
    } else {
      capped = true;
    }

    // --- feature (scatter tiers 3 / 4 / 5+ on the INITIAL grid) ------------
    // Counting rule: initial-grid (CONVENTIONS §11) — cascaded scatters never count.
    let feature: OutcomeManifest['feature'] = null;
    const bonusTier = opts.bonusBuyTier;
    const naturalTier = this.tierForScatters(initial.scatterCount);
    const tier = bonusTier ? this.config.scatterTiers.find((t) => t.tierId === bonusTier) ?? null : naturalTier;
    if (!capped && tier) {
      const triggerScatters = bonusTier ? tier.scatters : initial.scatterCount;
      const lastGrid = steps[steps.length - 1]!.grid;
      pushStep({
        type: 'feature_trigger',
        grid: lastGrid,
        wins: [],
        scatterCount: triggerScatters,
        multiplier: 1,
        events: [`anim.${tier.tierId}.enter`],
      });
      const featureResult = this.playFeature(tier, triggerScatters, betMinor, capMinor, () => cumulativeWinMinor, pushStep);
      feature = featureResult.block;
      capped = featureResult.capReached;
    }

    // --- max-win termination ------------------------------------------------
    if (capped) {
      const lastGrid = steps[steps.length - 1]!.grid;
      pushStep({
        type: 'max_win_termination',
        grid: lastGrid,
        wins: [],
        scatterCount: 0,
        multiplier: 1,
        events: ['anim.maxwin.reached'],
      });
    }

    // --- settlement (always the last step) ----------------------------------
    const totalWinMinor = capped ? capMinor : cumulativeWinMinor;
    const lastGrid = steps[steps.length - 1]!.grid;
    pushStep({
      type: 'settlement',
      grid: lastGrid,
      wins: [],
      scatterCount: 0,
      multiplier: 1,
      events: totalWinMinor > 0 ? ['anim.win.countup'] : [],
    });

    const manifest: OutcomeManifest = {
      manifestVersion: '1.0.0',
      roundId,
      gameVersion: this.config.gameVersion,
      mathVersion: this.config.mathVersion,
      betMinor,
      currency: this.config.currency,
      totalWinMinor,
      maxWinCapMinor: capMinor,
      capped,
      steps,
      feature,
      // Clearly fake placeholder — production signatures are detached JWS/HMAC
      // verified by the RGS adapter, never fabricated client-side.
      signature: 'dev-unsigned',
    };
    assertValidManifest(manifest);
    this.lastManifest = manifest;
    return manifest;
  }

  async resume(): Promise<ResumeResult | null> {
    assertNotProduction();
    const pending = this.pendingResume;
    this.pendingResume = null;
    return pending;
  }

  /**
   * DEV/TEST ONLY: pretend the last round was interrupted at `stepId` so the
   * recovery path can be exercised. The next resume() returns it once.
   */
  devMarkInterrupted(stepId: string): void {
    if (!this.lastManifest) throw new Error('no round to mark interrupted');
    if (!this.lastManifest.steps.some((s) => s.stepId === stepId)) {
      throw new RangeError(`stepId "${stepId}" not in last manifest`);
    }
    this.pendingResume = {
      manifest: { ...this.lastManifest, resumePointer: stepId },
      resumePointer: stepId,
    };
  }

  // -------------------------------------------------------------------------
  // internals
  // -------------------------------------------------------------------------

  private capReached(cumulative: number, capMinor: number): boolean {
    return cumulative >= capMinor;
  }

  private tierForScatters(scatterCount: number): ScatterTierConfig | null {
    if (scatterCount < 3) return null;
    // 5+ maps to the 5-scatter tier; otherwise exact match.
    const capped = Math.min(scatterCount, 5);
    return this.config.scatterTiers.find((t) => t.scatters === capped) ?? null;
  }

  private stripsFor(context: ReelContext): string[][] {
    const exact = this.config.reelSets.find((r) => r.context === context);
    const base = this.config.reelSets.find((r) => r.context === 'base');
    const chosen = exact ?? base;
    if (!chosen) throw new Error(`no reel set for context "${context}" and no base fallback`);
    return chosen.strips;
  }

  private spinGrid(context: ReelContext, forceScatterCount?: number): SpinResult {
    const { columns, rows } = this.config;
    const strips = this.stripsFor(context);
    if (strips.length !== columns) throw new Error(`reel set has ${strips.length} strips, config says ${columns} columns`);
    const grid: string[][] = [];
    for (let c = 0; c < columns; c++) {
      const strip = strips[c]!;
      const stop = this.rng.int(0, strip.length);
      const column: string[] = [];
      for (let r = 0; r < rows; r++) column.push(strip[(stop + r) % strip.length]!);
      grid.push(column);
    }
    if (forceScatterCount !== undefined) this.forceScatters(grid, forceScatterCount);
    return { grid, scatterCount: this.countScatters(grid) };
  }

  /** DEV/TEST ONLY grid surgery so tier paths are reachable on demand. */
  private forceScatters(grid: string[][], target: number): void {
    if (!Number.isSafeInteger(target) || target < 0 || target > grid.length) {
      throw new RangeError(`forceScatterCount must be in [0, ${grid.length}]`);
    }
    const filler = this.config.symbols.find((s) => s.kind === 'low')?.id ?? 'L1';
    for (const column of grid) {
      for (let r = 0; r < column.length; r++) if (column[r] === SCATTER) column[r] = filler;
    }
    // One scatter per reel, leftmost reels first, deterministic random row.
    for (let c = 0; c < target; c++) {
      const column = grid[c]!;
      column[this.rng.int(0, column.length)] = SCATTER;
    }
  }

  private countScatters(grid: string[][]): number {
    let n = 0;
    for (const column of grid) for (const cell of column) if (cell === SCATTER) n++;
    return n;
  }

  /** Leftmost line evaluation with WILD substitution against the paytable. */
  private evaluateLineWins(grid: string[][], betMinor: number, multiplier: number): Win[] {
    const wins: Win[] = [];
    this.config.lines.forEach((line, lineId) => {
      const cells: string[] = line.map((row, col) => grid[col]![row]!);
      const lead = cells.find((s) => s !== WILD);
      const paying = lead === undefined ? WILD : lead;
      if (paying === SCATTER) return; // scatters never pay on lines here
      let count = 0;
      for (const cell of cells) {
        if (cell === paying || cell === WILD) count++;
        else break;
      }
      const entry = this.config.paytable.find((e) => e.symbolId === paying && e.count === count);
      if (!entry || entry.payX100 === 0) return;
      const positions: GridPosition[] = [];
      for (let col = 0; col < count; col++) positions.push([col, line[col]!]);
      wins.push({
        lineId,
        symbolId: paying,
        count,
        payX100: entry.payX100,
        winMinor: winMinor(betMinor, entry.payX100, multiplier),
        positions,
      });
    });
    return wins;
  }

  /**
   * Cascade loop: remove winning cells, drop survivors, refill from RNG,
   * re-evaluate. Hard-capped by config.cascades.maxSteps (§9.4).
   */
  private runCascades(
    startGrid: string[][],
    startWins: Win[],
    betMinor: number,
    multiplier: number,
    capMinor: number,
    cumulative: () => number,
    pushStep: (partial: Omit<Step, 'stepId'>) => Step,
    stepType: StepType = 'cascade',
  ): { capReached: boolean } {
    if (!this.config.cascades.enabled) return { capReached: this.capReached(cumulative(), capMinor) };
    let grid = startGrid;
    let wins = startWins;
    let cascadeSteps = 0;
    while (wins.length > 0 && cascadeSteps < this.config.cascades.maxSteps) {
      if (this.capReached(cumulative(), capMinor)) return { capReached: true };
      grid = this.cascadeOnce(grid, wins);
      wins = this.evaluateLineWins(grid, betMinor, multiplier);
      cascadeSteps += 1;
      pushStep({
        type: stepType,
        grid,
        wins,
        scatterCount: 0, // initial-grid counting rule: cascaded scatters never count
        multiplier,
        events: ['anim.cascade.remove', 'anim.cascade.refill', ...(wins.length > 0 ? ['anim.win.countup'] : [])],
      });
    }
    return { capReached: this.capReached(cumulative(), capMinor) };
  }

  private cascadeOnce(grid: string[][], wins: Win[]): string[][] {
    const removed = new Set(wins.flatMap((w) => w.positions.map(([c, r]) => `${c}:${r}`)));
    const strips = this.stripsFor('base');
    return grid.map((column, c) => {
      const survivors = column.filter((_, r) => !removed.has(`${c}:${r}`));
      const refillCount = column.length - survivors.length;
      const strip = strips[c]!;
      const refill: string[] = [];
      for (let i = 0; i < refillCount; i++) refill.push(strip[this.rng.int(0, strip.length)]!);
      return [...refill, ...survivors];
    });
  }

  /** Free-round feature with tier-distinct rounds/multiplier and retrigger cap. */
  private playFeature(
    tier: ScatterTierConfig,
    triggerScatterCount: number,
    betMinor: number,
    capMinor: number,
    cumulative: () => number,
    pushStep: (partial: Omit<Step, 'stepId'>) => Step,
  ): { block: NonNullable<OutcomeManifest['feature']>; capReached: boolean } {
    const winBefore = cumulative();
    let roundsRemaining = tier.roundsAwarded;
    let roundsPlayed = 0;
    let retriggerCount = 0;
    let capReached = false;
    // Hard upper bound independent of the loop logic — proven termination (§9.4).
    const absoluteRoundBound = tier.roundsAwarded * (1 + tier.retriggerCap);

    while (roundsRemaining > 0 && roundsPlayed < absoluteRoundBound) {
      if (this.capReached(cumulative(), capMinor)) {
        capReached = true;
        break;
      }
      const spin = this.spinGrid(tier.tierId);
      const wins = this.evaluateLineWins(spin.grid, betMinor, tier.multiplier);
      roundsPlayed += 1;
      roundsRemaining -= 1;
      pushStep({
        type: 'feature_round',
        grid: spin.grid,
        wins,
        scatterCount: spin.scatterCount,
        multiplier: tier.multiplier,
        events: ['anim.reel.spin_start', 'anim.reel.stop', ...(wins.length > 0 ? ['anim.win.countup'] : [])],
      });
      if (spin.scatterCount >= 3 && retriggerCount < tier.retriggerCap) {
        retriggerCount += 1;
        roundsRemaining += tier.roundsAwarded;
        pushStep({
          type: 'feature_retrigger',
          grid: spin.grid,
          wins: [],
          scatterCount: spin.scatterCount,
          multiplier: tier.multiplier,
          events: ['anim.feature.retrigger'],
        });
      }
    }
    if (this.capReached(cumulative(), capMinor)) capReached = true;

    return {
      block: {
        tierId: tier.tierId,
        triggerScatterCount,
        initialRoundsAwarded: tier.roundsAwarded,
        roundsAwarded: tier.roundsAwarded + retriggerCount * tier.roundsAwarded,
        roundsPlayed,
        retriggerCount,
        retriggerCap: tier.retriggerCap,
        multiplier: tier.multiplier,
        winMinor: cumulative() - winBefore,
      },
      capReached,
    };
  }
}

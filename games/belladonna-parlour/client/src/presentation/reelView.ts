/**
 * Reel/grid renderer — PixiJS v8.
 *
 * Driven ONLY by the committed manifest's steps and the spinTiming schedule:
 * this view consumes the timeline firings produced by
 * `scheduleToTimelineEvents(buildSpinSchedule(manifest, …))` plus the
 * manifest steps themselves. It never invents symbols for landed positions
 * and never touches settlement (§9.2). The symbols shown DURING reel travel
 * are a deterministic cosmetic cycle — outcomes land exclusively from the
 * manifest grid on the reel-stop firing.
 *
 * Runs with ZERO assets: symbols without a texture render as labelled
 * placeholder rectangles, so the template is playable before art exists.
 *
 * PixiJS usage is intentionally isolated to this file, hud.ts, and app.ts —
 * pure modules and tests never pull pixi.
 */

import { BlurFilter, Container, Graphics, Sprite, Text, Texture } from 'pixi.js';
import type { Step } from '../core/types.js';
import type { SpinSchedule } from '../core/spinTiming.js';
import type { TimelineFiring } from '../core/timeline.js';

// ---------------------------------------------------------------------------
// Placeholder styling — deterministic colour per symbol id.
// ---------------------------------------------------------------------------

function hashColor(symbolId: string): number {
  let h = 5381;
  for (let i = 0; i < symbolId.length; i++) h = ((h << 5) + h + symbolId.charCodeAt(i)) | 0;
  const hue = ((h % 360) + 360) % 360;
  return hslToRgbInt(hue, 0.55, 0.35);
}

function hslToRgbInt(h: number, s: number, l: number): number {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const to255 = (v: number) => Math.round((v + m) * 255);
  return (to255(r) << 16) | (to255(g) << 8) | to255(b);
}

// ---------------------------------------------------------------------------
// One grid cell — texture sprite when available, labelled rect otherwise.
// ---------------------------------------------------------------------------

class SymbolCell {
  readonly view = new Container();
  private readonly placeholder: Graphics;
  private readonly label: Text;
  private readonly sprite: Sprite;
  private symbolId = '';

  constructor(
    private readonly cellWidth: number,
    private readonly cellHeight: number,
  ) {
    this.placeholder = new Graphics();
    this.sprite = new Sprite();
    this.sprite.width = cellWidth;
    this.sprite.height = cellHeight;
    this.label = new Text({
      text: '',
      style: { fill: 0xffffff, fontSize: Math.floor(cellHeight * 0.24), fontWeight: 'bold', align: 'center' },
    });
    this.label.anchor.set(0.5);
    this.label.position.set(cellWidth / 2, cellHeight / 2);
    this.view.addChild(this.placeholder, this.sprite, this.label);
  }

  setSymbol(symbolId: string, textures: ReadonlyMap<string, Texture> | undefined): void {
    if (symbolId === this.symbolId) return;
    this.symbolId = symbolId;
    const texture = textures?.get(symbolId);
    if (texture) {
      this.sprite.texture = texture;
      this.sprite.visible = true;
      this.placeholder.visible = false;
      this.label.visible = false;
      return;
    }
    this.sprite.visible = false;
    this.placeholder.visible = true;
    this.label.visible = true;
    this.label.text = symbolId;
    const pad = Math.max(2, Math.floor(this.cellWidth * 0.04));
    this.placeholder
      .clear()
      .roundRect(pad, pad, this.cellWidth - 2 * pad, this.cellHeight - 2 * pad, 10)
      .fill({ color: hashColor(symbolId) })
      .stroke({ width: 2, color: 0xffffff, alpha: 0.35 });
  }

  get currentSymbol(): string {
    return this.symbolId;
  }

  setDimmed(dimmed: boolean): void {
    this.view.alpha = dimmed ? 0.25 : 1;
  }
}

// ---------------------------------------------------------------------------
// Reel view
// ---------------------------------------------------------------------------

export interface ReelViewHooks {
  /** Reel began travelling (blur-on-spin already applied). */
  onReelSpinStart?: (reelIndex: number) => void;
  /** Reel landed its manifest column (anticipation flag from the schedule). */
  onReelStop?: (reelIndex: number, anticipation: boolean) => void;
  /** Cascade removal: winning positions of the PREVIOUS grid being cleared. */
  onCascadeRemove?: (stepId: string, positions: ReadonlyArray<readonly [number, number]>) => void;
  /** Cascade refill: the new grid is now applied. */
  onCascadeRefill?: (stepId: string) => void;
  /** Any manifest step's grid was applied to the view. */
  onStepApplied?: (step: Step) => void;
}

export interface ReelViewOptions extends ReelViewHooks {
  columns: number;
  rows: number;
  cellWidth?: number;
  cellHeight?: number;
  /** Symbol textures keyed by symbol id; missing ids render placeholders. */
  textures?: ReadonlyMap<string, Texture>;
  /** Cosmetic symbol cycle shown while a reel travels. */
  spinCycleSymbols?: readonly string[];
}

interface ReelRuntime {
  container: Container;
  cells: SymbolCell[];
  spinning: boolean;
  anticipation: boolean;
  /** Cosmetic scroll position, px. */
  scrollPx: number;
  cyclePos: number;
  blur: BlurFilter;
}

const DEFAULT_SPIN_CYCLE = ['H1', 'L1', 'H2', 'L2', 'WILD', 'H3', 'L3', 'SCATTER', 'H4', 'L4'];
const SPIN_SPEED_PX_PER_MS = 2.4;

export class ReelView {
  readonly container = new Container();
  readonly columns: number;
  readonly rows: number;
  readonly cellWidth: number;
  readonly cellHeight: number;

  private readonly reels: ReelRuntime[] = [];
  private readonly textures: ReadonlyMap<string, Texture> | undefined;
  private readonly spinCycle: readonly string[];
  private readonly hooks: ReelViewHooks;
  private steps = new Map<string, Step>();
  private orderedSteps: Step[] = [];
  private schedule: SpinSchedule | null = null;
  private lowPerformance = false;

  constructor(options: ReelViewOptions) {
    if (options.columns < 1 || options.rows < 1) throw new RangeError('columns/rows must be ≥ 1');
    this.columns = options.columns;
    this.rows = options.rows;
    this.cellWidth = options.cellWidth ?? 120;
    this.cellHeight = options.cellHeight ?? 110;
    this.textures = options.textures;
    this.spinCycle = options.spinCycleSymbols ?? DEFAULT_SPIN_CYCLE;
    this.hooks = options;

    for (let c = 0; c < this.columns; c++) {
      const reelContainer = new Container();
      reelContainer.x = c * this.cellWidth;
      const cells: SymbolCell[] = [];
      for (let r = 0; r < this.rows; r++) {
        const cell = new SymbolCell(this.cellWidth, this.cellHeight);
        cell.view.y = r * this.cellHeight;
        cell.setSymbol('BLANK', this.textures);
        reelContainer.addChild(cell.view);
        cells.push(cell);
      }
      const blur = new BlurFilter({ strengthY: 8, strengthX: 0 });
      blur.enabled = false;
      reelContainer.filters = [blur];
      this.container.addChild(reelContainer);
      this.reels.push({
        container: reelContainer,
        cells,
        spinning: false,
        anticipation: false,
        scrollPx: 0,
        cyclePos: c, // desynchronise the cosmetic cycle across reels
        blur,
      });
    }
  }

  get widthPx(): number {
    return this.columns * this.cellWidth;
  }

  get heightPx(): number {
    return this.rows * this.cellHeight;
  }

  /** fps-probe hook: low-performance mode drops the motion blur (§9.7/§9.8). */
  setLowPerformance(flag: boolean): void {
    this.lowPerformance = flag;
    if (flag) for (const reel of this.reels) reel.blur.enabled = false;
  }

  /**
   * Arm the view for one committed round. `steps` are the manifest steps
   * (display data source of truth); `schedule` is the spinTiming output whose
   * timeline events this view consumes via handleFiring().
   */
  beginRound(steps: readonly Step[], schedule: SpinSchedule): void {
    this.orderedSteps = [...steps];
    this.steps = new Map(steps.map((s) => [s.stepId, s]));
    this.schedule = schedule;
  }

  /**
   * Feed every TimelineFiring from the round timeline here (payloads produced
   * by scheduleToTimelineEvents). Skipped firings apply instantly — the view
   * lands exactly the same grids in every mode (§9.2).
   */
  handleFiring(firing: TimelineFiring): void {
    const payload = firing.payload as { kind?: string } | undefined;
    if (!payload || typeof payload !== 'object') return;

    if (payload.kind === 'reel') {
      const { reelIndex, anticipation } = payload as { reelIndex: number; anticipation: boolean };
      if (firing.phase === 'start') this.startReel(reelIndex, anticipation, firing.skipped);
      else this.stopReel(reelIndex);
      return;
    }
    if (payload.kind === 'step' && firing.phase === 'start') {
      const { stepId } = payload as { stepId: string };
      this.applyStep(stepId);
    }
  }

  /** Cosmetic travel animation; call once per frame with the frame delta. */
  update(dtMs: number): void {
    for (const reel of this.reels) {
      if (!reel.spinning) continue;
      reel.scrollPx += dtMs * SPIN_SPEED_PX_PER_MS * (reel.anticipation ? 0.6 : 1);
      while (reel.scrollPx >= this.cellHeight) {
        reel.scrollPx -= this.cellHeight;
        reel.cyclePos += 1;
        // Shift the cosmetic symbol cycle down the visible window.
        for (let r = 0; r < reel.cells.length; r++) {
          const symbol = this.spinCycle[(reel.cyclePos + r) % this.spinCycle.length] ?? 'BLANK';
          reel.cells[r]?.setSymbol(symbol, this.textures);
        }
      }
      // Sub-cell bounce for the illusion of motion (position resets on stop).
      reel.container.y = reel.scrollPx % this.cellHeight;
    }
  }

  /** Instantly show a grid (recovery seeks, initial idle grid). Columns-major. */
  setGrid(grid: ReadonlyArray<readonly string[]>): void {
    for (let c = 0; c < this.columns; c++) {
      const column = grid[c];
      const reel = this.reels[c];
      if (!column || !reel) continue;
      for (let r = 0; r < this.rows; r++) {
        reel.cells[r]?.setSymbol(column[r] ?? 'BLANK', this.textures);
        reel.cells[r]?.setDimmed(false);
      }
    }
  }

  /** True while any reel is still travelling (InputGuard's reelsSpinning). */
  get anyReelSpinning(): boolean {
    return this.reels.some((r) => r.spinning);
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }

  // -- internals -------------------------------------------------------------

  private startReel(reelIndex: number, anticipation: boolean, skipped: boolean): void {
    const reel = this.reels[reelIndex];
    if (!reel) return;
    if (skipped) return; // fast-forward: the stop firing follows immediately
    reel.spinning = true;
    reel.anticipation = anticipation;
    reel.blur.enabled = !this.lowPerformance; // blur-on-spin hook
    this.hooks.onReelSpinStart?.(reelIndex);
  }

  private stopReel(reelIndex: number): void {
    const reel = this.reels[reelIndex];
    if (!reel) return;
    reel.spinning = false;
    reel.blur.enabled = false;
    reel.container.y = 0;
    reel.scrollPx = 0;
    // Land THE manifest column — the only source of landed symbols (§9.2).
    const initial = this.orderedSteps[0];
    const column = initial?.grid[reelIndex];
    if (column) {
      for (let r = 0; r < this.rows; r++) {
        reel.cells[r]?.setSymbol(column[r] ?? 'BLANK', this.textures);
        reel.cells[r]?.setDimmed(false);
      }
    }
    const anticipation = this.schedule?.reelSchedules[reelIndex]?.anticipation ?? false;
    this.hooks.onReelStop?.(reelIndex, anticipation);
  }

  private applyStep(stepId: string): void {
    const step = this.steps.get(stepId);
    if (!step) return;
    if (step.type === 'cascade' || step.type === 'respin') {
      // Remove hook fires with the winning positions of the PREVIOUS grid —
      // those are the symbols being cleared before this step's refill.
      const index = this.orderedSteps.findIndex((s) => s.stepId === stepId);
      const previous = index > 0 ? this.orderedSteps[index - 1] : undefined;
      const removed = previous ? previous.wins.flatMap((w) => w.positions) : [];
      for (const [c, r] of removed) {
        this.reels[c]?.cells[r]?.setDimmed(true);
      }
      this.hooks.onCascadeRemove?.(stepId, removed);
      this.setGrid(step.grid);
      this.hooks.onCascadeRefill?.(stepId);
    } else if (step.type !== 'initial_result') {
      // initial_result lands reel-by-reel via stopReel; every other step type
      // (feature rounds, triggers, jackpot, termination) shows its own grid.
      this.setGrid(step.grid);
    }
    this.hooks.onStepApplied?.(step);
  }
}

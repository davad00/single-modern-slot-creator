/**
 * HUD — balance / bet / win displays, spin button state machine, quick &
 * turbo toggles, autoplay panel with the full stop-condition set, settings
 * stub. PixiJS v8 (pixi usage stays isolated to this file, reelView.ts and
 * app.ts).
 *
 * Money is DISPLAY ONLY here: every value arrives as integer minor units and
 * is formatted with core `formatMinor` — the HUD never does settlement math.
 *
 * Input rule: the HUD emits raw intents through callbacks; app.ts routes the
 * primary action through core InputGuard (debounce, skip-vs-stop, duplicate
 * wager protection). Secondary controls honor `setControlsLocked` while a
 * round is in flight.
 *
 * Jurisdiction gating (§9.6): quick/turbo toggles and the whole autoplay
 * panel are HIDDEN when the policy disallows them; autoplay counts are capped
 * at policy.autoplayMaxRounds; RTP is displayed when required.
 *
 * Accessibility (§9.7): every control is ≥ 44 px on its shortest side; state
 * is conveyed by label text as well as colour; HUD text is white on dark
 * (contrast ≥ 4.5:1).
 */

import { Container, Graphics, Text } from 'pixi.js';
import { formatMinor } from '../core/money.js';
import type { JurisdictionPolicy, SpinMode } from '../core/types.js';
import type { AutoplayConfig, AutoplayState } from '../core/autoplay.js';
import type { RawInputKind } from '../core/inputGuard.js';

export type SpinButtonState = 'idle' | 'requesting' | 'spinning' | 'skippable' | 'disabled';

export interface HudCallbacks {
  /** Spin/stop/skip intent — app.ts MUST route this through InputGuard. */
  onPrimaryAction?: (kind: RawInputKind) => void;
  onBetChanged?: (betMinor: number) => void;
  /** Requested spin mode (already policy-resolved again by core at spin time). */
  onSpinModeChanged?: (mode: SpinMode) => void;
  onAutoplayStart?: (config: AutoplayConfig) => void;
  onAutoplayStop?: () => void;
  onSettingsToggled?: (open: boolean) => void;
  onMuteToggled?: (muted: boolean) => void;
  /** Any UI press (for ui.click audio). */
  onUiClick?: () => void;
}

export interface HudOptions extends HudCallbacks {
  policy: JurisdictionPolicy;
  currency: string;
  /** Selectable bet levels, integer minor units, ascending. */
  betStepsMinor: readonly number[];
  initialBetMinor: number;
  /** Shown when policy.rtpDisplayRequired (fraction, e.g. 0.96). */
  rtp?: number;
  /** Shown as "MAX WIN <n>x" when provided. */
  maxWinXBet?: number;
}

const MIN_TOUCH = 44; // §9.7 minimum touch target, px

const COLORS = {
  panel: 0x141824,
  panelLine: 0x2c3242,
  button: 0x232a3d,
  buttonActive: 0x3a86ff,
  buttonDisabled: 0x1a1e2a,
  spin: 0x2ec27e,
  spinStop: 0xe0644f,
  text: 0xffffff,
  textDim: 0xaab2c5,
} as const;

interface ButtonParts {
  view: Container;
  background: Graphics;
  label: Text;
  setLabel(text: string): void;
  setEnabled(enabled: boolean): void;
  setActive(active: boolean): void;
  readonly enabled: boolean;
}

function drawButtonBg(g: Graphics, w: number, h: number, color: number): void {
  g.clear()
    .roundRect(0, 0, w, h, 10)
    .fill({ color })
    .stroke({ width: 1, color: COLORS.panelLine });
}

function makeButton(labelText: string, width: number, height: number, onPress: () => void): ButtonParts {
  const w = Math.max(width, MIN_TOUCH);
  const h = Math.max(height, MIN_TOUCH);
  const view = new Container();
  const background = new Graphics();
  drawButtonBg(background, w, h, COLORS.button);
  const label = new Text({ text: labelText, style: { fill: COLORS.text, fontSize: 15, fontWeight: 'bold' } });
  label.anchor.set(0.5);
  label.position.set(w / 2, h / 2);
  view.addChild(background, label);
  view.eventMode = 'static';
  view.cursor = 'pointer';
  let enabled = true;
  let active = false;
  const redraw = (): void => {
    drawButtonBg(background, w, h, !enabled ? COLORS.buttonDisabled : active ? COLORS.buttonActive : COLORS.button);
    label.style.fill = enabled ? COLORS.text : COLORS.textDim;
  };
  view.on('pointerdown', () => {
    if (enabled) onPress();
  });
  return {
    view,
    background,
    label,
    setLabel: (text) => {
      label.text = text;
    },
    setEnabled: (value) => {
      enabled = value;
      view.eventMode = value ? 'static' : 'none';
      view.cursor = value ? 'pointer' : 'default';
      redraw();
    },
    setActive: (value) => {
      active = value;
      redraw();
    },
    get enabled() {
      return enabled;
    },
  };
}

function makeValueDisplay(labelText: string): { view: Container; value: Text } {
  const view = new Container();
  const label = new Text({ text: labelText, style: { fill: COLORS.textDim, fontSize: 12, fontWeight: 'bold' } });
  const value = new Text({ text: '—', style: { fill: COLORS.text, fontSize: 20, fontWeight: 'bold' } });
  value.y = 16;
  view.addChild(label, value);
  return { view, value };
}

/** Cycle-through option control ("LOSS LIMIT: OFF/10×/50×/100×"). */
interface CycleControl<T> {
  button: ButtonParts;
  current(): T;
}

function makeCycle<T>(
  prefix: string,
  options: readonly { label: string; value: T }[],
  width: number,
  onUiClick?: () => void,
): CycleControl<T> {
  let index = 0;
  const text = (): string => `${prefix}: ${options[index]?.label ?? '—'}`;
  const button = makeButton('', width, MIN_TOUCH, () => {
    index = (index + 1) % options.length;
    button.setLabel(text());
    onUiClick?.();
  });
  button.setLabel(text());
  return { button, current: () => options[index]!.value };
}

export class Hud {
  readonly container = new Container();

  private readonly options: HudOptions;
  private readonly policy: JurisdictionPolicy;
  private readonly currency: string;

  private betMinor: number;
  private spinMode: SpinMode = 'normal';
  private spinState: SpinButtonState = 'disabled';
  private settingsOpen = false;
  private muted = false;
  private controlsLocked = false;

  private readonly balanceDisplay: { view: Container; value: Text };
  private readonly betDisplay: { view: Container; value: Text };
  private readonly winDisplay: { view: Container; value: Text };
  private readonly spinButton: ButtonParts;
  private readonly betDownButton: ButtonParts;
  private readonly betUpButton: ButtonParts;
  private readonly quickButton: ButtonParts | null = null;
  private readonly turboButton: ButtonParts | null = null;
  private readonly autoplayButton: ButtonParts | null = null;
  private readonly autoplayPanel: Container | null = null;
  private readonly autoplayCountCycle: CycleControl<number> | null = null;
  private readonly stopOnFeatureCycle: CycleControl<boolean> | null = null;
  private readonly lossLimitCycle: CycleControl<number | null> | null = null;
  private readonly winThresholdCycle: CycleControl<number | null> | null = null;
  private readonly balanceFloorCycle: CycleControl<number | null> | null = null;
  private readonly settingsButton: ButtonParts;
  private readonly settingsPanel: Container;
  private readonly muteButton: ButtonParts;
  private readonly autoplayStatus: Text;
  private readonly statusBanner: Text;
  private readonly infoLine: Text;

  constructor(options: HudOptions) {
    this.options = options;
    this.policy = options.policy;
    this.currency = options.currency;
    this.betMinor = options.initialBetMinor;

    // -- displays: balance, total bet, current win (always visible) --------
    this.balanceDisplay = makeValueDisplay('BALANCE');
    this.betDisplay = makeValueDisplay('TOTAL BET');
    this.winDisplay = makeValueDisplay('WIN');
    this.container.addChild(this.balanceDisplay.view, this.betDisplay.view, this.winDisplay.view);

    // -- spin button (primary action; routed through InputGuard by app.ts) --
    this.spinButton = makeButton('SPIN', 96, 96, () => options.onPrimaryAction?.('pointer'));
    this.container.addChild(this.spinButton.view);

    // -- bet selector -------------------------------------------------------
    this.betDownButton = makeButton('−', MIN_TOUCH, MIN_TOUCH, () => this.stepBet(-1));
    this.betUpButton = makeButton('+', MIN_TOUCH, MIN_TOUCH, () => this.stepBet(1));
    this.container.addChild(this.betDownButton.view, this.betUpButton.view);

    // -- quick / turbo toggles (§9.6: hidden when the policy disallows) -----
    if (this.policy.quickSpinAllowed) {
      this.quickButton = makeButton('QUICK', 76, MIN_TOUCH, () => this.toggleMode('quick'));
      this.container.addChild(this.quickButton.view);
    }
    if (this.policy.turboSpinAllowed) {
      this.turboButton = makeButton('TURBO', 76, MIN_TOUCH, () => this.toggleMode('turbo'));
      this.container.addChild(this.turboButton.view);
    }

    // -- autoplay (hidden entirely when disallowed) --------------------------
    this.autoplayStatus = new Text({ text: '', style: { fill: COLORS.text, fontSize: 14, fontWeight: 'bold' } });
    this.autoplayStatus.visible = false;
    this.container.addChild(this.autoplayStatus);

    if (this.policy.autoplayAllowed && this.policy.autoplayMaxRounds > 0) {
      this.autoplayButton = makeButton('AUTO', 76, MIN_TOUCH, () => this.toggleAutoplayPanel());
      this.container.addChild(this.autoplayButton.view);

      const counts = [10, 25, 50, 100, 250].filter((n) => n <= this.policy.autoplayMaxRounds);
      if (counts.length === 0) counts.push(this.policy.autoplayMaxRounds);
      const panel = new Container();
      const bg = new Graphics().roundRect(0, 0, 300, 320, 12).fill({ color: COLORS.panel, alpha: 0.96 }).stroke({
        width: 1,
        color: COLORS.panelLine,
      });
      panel.addChild(bg);
      const title = new Text({ text: 'AUTOPLAY', style: { fill: COLORS.text, fontSize: 16, fontWeight: 'bold' } });
      title.position.set(16, 12);
      panel.addChild(title);

      this.autoplayCountCycle = makeCycle(
        'ROUNDS',
        counts.map((n) => ({ label: String(n), value: n })),
        268,
        options.onUiClick,
      );
      this.stopOnFeatureCycle = makeCycle(
        'STOP ON FEATURE',
        [
          { label: 'ON', value: true },
          { label: 'OFF', value: false },
        ],
        268,
        options.onUiClick,
      );
      const xBetOptions = (multipliers: number[]): { label: string; value: number | null }[] => [
        { label: 'OFF', value: null },
        ...multipliers.map((m) => ({ label: `${m}× BET`, value: m })),
      ];
      this.lossLimitCycle = makeCycle('LOSS LIMIT', xBetOptions([10, 25, 50, 100]), 268, options.onUiClick);
      this.winThresholdCycle = makeCycle('STOP IF WIN ≥', xBetOptions([10, 25, 50, 100]), 268, options.onUiClick);
      this.balanceFloorCycle = makeCycle('BALANCE FLOOR', xBetOptions([10, 20, 50]), 268, options.onUiClick);

      const startButton = makeButton('START AUTOPLAY', 268, MIN_TOUCH, () => this.startAutoplay());
      const rows = [
        this.autoplayCountCycle.button,
        this.stopOnFeatureCycle.button,
        this.lossLimitCycle.button,
        this.winThresholdCycle.button,
        this.balanceFloorCycle.button,
        startButton,
      ];
      rows.forEach((row, i) => {
        row.view.position.set(16, 44 + i * (MIN_TOUCH + 1));
        panel.addChild(row.view);
      });
      panel.visible = false;
      this.autoplayPanel = panel;
      this.container.addChild(panel);
    }

    // -- settings stub --------------------------------------------------------
    this.settingsButton = makeButton('⚙', MIN_TOUCH, MIN_TOUCH, () => this.toggleSettings());
    this.container.addChild(this.settingsButton.view);

    this.settingsPanel = new Container();
    const settingsBg = new Graphics()
      .roundRect(0, 0, 300, 170, 12)
      .fill({ color: COLORS.panel, alpha: 0.96 })
      .stroke({ width: 1, color: COLORS.panelLine });
    const settingsTitle = new Text({
      text: 'SETTINGS (template stub)',
      style: { fill: COLORS.text, fontSize: 15, fontWeight: 'bold' },
    });
    settingsTitle.position.set(16, 12);
    this.muteButton = makeButton('SOUND: ON', 268, MIN_TOUCH, () => {
      this.muted = !this.muted;
      this.muteButton.setLabel(this.muted ? 'SOUND: OFF' : 'SOUND: ON');
      this.options.onMuteToggled?.(this.muted);
      this.options.onUiClick?.();
    });
    this.muteButton.view.position.set(16, 44);
    const settingsNote = new Text({
      text: 'Paytable, rules and history are game-\nspecific screens added per game.',
      style: { fill: COLORS.textDim, fontSize: 12, lineHeight: 16 },
    });
    settingsNote.position.set(16, 100);
    this.settingsPanel.addChild(settingsBg, settingsTitle, this.muteButton.view, settingsNote);
    this.settingsPanel.visible = false;
    this.container.addChild(this.settingsPanel);

    // -- info line (RTP where required, max win) -----------------------------
    const infoParts: string[] = [];
    if (this.policy.rtpDisplayRequired && options.rtp !== undefined) {
      infoParts.push(`RTP ${(options.rtp * 100).toFixed(2)}%`);
    }
    if (options.maxWinXBet !== undefined) infoParts.push(`MAX WIN ${options.maxWinXBet.toLocaleString('en-US')}×`);
    this.infoLine = new Text({ text: infoParts.join('   ·   '), style: { fill: COLORS.textDim, fontSize: 12 } });
    this.container.addChild(this.infoLine);

    // -- status banner (network / reconnection / errors) ----------------------
    this.statusBanner = new Text({ text: '', style: { fill: 0xffcf5c, fontSize: 15, fontWeight: 'bold' } });
    this.statusBanner.visible = false;
    this.container.addChild(this.statusBanner);

    this.setBet(this.betMinor);
    this.setSpinButtonState('disabled');
  }

  // -- public state setters ----------------------------------------------------

  setBalance(balanceMinor: number): void {
    this.balanceDisplay.value.text = formatMinor(balanceMinor, this.currency);
  }

  setBet(betMinor: number): void {
    this.betMinor = betMinor;
    this.betDisplay.value.text = formatMinor(betMinor, this.currency);
  }

  get currentBetMinor(): number {
    return this.betMinor;
  }

  setWin(winMinor: number): void {
    this.winDisplay.value.text = winMinor > 0 ? formatMinor(winMinor, this.currency) : '—';
  }

  /** Spin-button state machine: label + colour + enabled per state. */
  setSpinButtonState(state: SpinButtonState): void {
    this.spinState = state;
    const bg = this.spinButton.background;
    const spec: Record<SpinButtonState, { label: string; color: number; enabled: boolean }> = {
      idle: { label: 'SPIN', color: COLORS.spin, enabled: true },
      requesting: { label: '…', color: COLORS.buttonDisabled, enabled: false },
      spinning: {
        label: this.policy.slamStopAllowed ? 'STOP' : '…',
        color: this.policy.slamStopAllowed ? COLORS.spinStop : COLORS.buttonDisabled,
        enabled: this.policy.slamStopAllowed,
      },
      skippable: { label: 'SKIP', color: COLORS.spinStop, enabled: true },
      disabled: { label: 'SPIN', color: COLORS.buttonDisabled, enabled: false },
    };
    const s = spec[state];
    this.spinButton.setLabel(s.label);
    this.spinButton.setEnabled(s.enabled);
    // Repaint last: setEnabled redraws with the generic palette.
    drawButtonBg(bg, Math.max(96, MIN_TOUCH), Math.max(96, MIN_TOUCH), s.color);
  }

  get spinButtonState(): SpinButtonState {
    return this.spinState;
  }

  /** Reflect the active mode on the toggles (state set by app.ts). */
  setSpinMode(mode: SpinMode): void {
    this.spinMode = mode;
    this.quickButton?.setActive(mode === 'quick');
    this.turboButton?.setActive(mode === 'turbo');
  }

  /** Active autoplay state display (always-visible requirement). */
  setAutoplay(state: AutoplayState): void {
    if (state.active) {
      this.autoplayStatus.text = `AUTOPLAY ${state.roundsRemaining} LEFT — press to stop`;
      this.autoplayStatus.visible = true;
      this.autoplayButton?.setActive(true);
      this.autoplayButton?.setLabel('STOP');
    } else {
      this.autoplayStatus.visible = false;
      this.autoplayButton?.setActive(false);
      this.autoplayButton?.setLabel('AUTO');
    }
  }

  /** Lock secondary controls while a round is in flight (bet, autoplay start). */
  setControlsLocked(locked: boolean): void {
    this.controlsLocked = locked;
    this.betDownButton.setEnabled(!locked);
    this.betUpButton.setEnabled(!locked);
  }

  /** Network / reconnection / error banner (null hides). */
  setStatusMessage(message: string | null): void {
    this.statusBanner.text = message ?? '';
    this.statusBanner.visible = message !== null;
  }

  // -- layout ---------------------------------------------------------------

  /**
   * Position HUD elements for the current viewport. Called by app.ts on every
   * resize/orientation change with the breakpoint it resolved.
   */
  layout(width: number, height: number, compact: boolean): void {
    const pad = 16;
    const bottom = height - pad;

    // displays along the bottom-left
    this.balanceDisplay.view.position.set(pad, bottom - 44);
    this.betDisplay.view.position.set(pad + 150, bottom - 44);
    this.winDisplay.view.position.set(pad + 300, bottom - 44);

    // spin button bottom-right
    this.spinButton.view.position.set(width - 96 - pad, bottom - 96);

    // bet stepper beside the bet display
    this.betDownButton.view.position.set(pad + 150, bottom - 96);
    this.betUpButton.view.position.set(pad + 150 + MIN_TOUCH + 6, bottom - 96);

    // mode + autoplay toggles left of the spin button (stack when compact)
    const toggles = [this.quickButton, this.turboButton, this.autoplayButton].filter(
      (b): b is ButtonParts => b !== null,
    );
    toggles.forEach((button, i) => {
      if (compact) {
        button.view.position.set(width - 76 - pad, bottom - 96 - (i + 1) * (MIN_TOUCH + 8));
      } else {
        button.view.position.set(width - 96 - pad - (i + 1) * (76 + 8), bottom - MIN_TOUCH - 26);
      }
    });

    this.settingsButton.view.position.set(width - MIN_TOUCH - pad, pad);
    this.settingsPanel.position.set(width - 300 - pad, pad + MIN_TOUCH + 8);
    this.autoplayPanel?.position.set(width - 300 - pad, Math.max(pad, bottom - 96 - 330));
    this.autoplayStatus.position.set(pad, bottom - 74);
    this.infoLine.position.set(pad, pad);
    this.statusBanner.position.set(pad, pad + 22);
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }

  // -- internals ----------------------------------------------------------------

  private stepBet(direction: -1 | 1): void {
    if (this.controlsLocked) return;
    const steps = this.options.betStepsMinor;
    const index = steps.findIndex((s) => s === this.betMinor);
    const next = steps[Math.min(steps.length - 1, Math.max(0, (index < 0 ? 0 : index) + direction))];
    if (next === undefined || next === this.betMinor) return;
    this.setBet(next);
    this.options.onUiClick?.();
    // Bet change is a responsible-gaming autoplay stop condition — app.ts
    // forwards this to AutoplayController.notifyBetChanged().
    this.options.onBetChanged?.(next);
  }

  private toggleMode(mode: 'quick' | 'turbo'): void {
    const next: SpinMode = this.spinMode === mode ? 'normal' : mode;
    this.setSpinMode(next);
    this.options.onUiClick?.();
    this.options.onSpinModeChanged?.(next);
  }

  private toggleAutoplayPanel(): void {
    this.options.onUiClick?.();
    // While autoplay runs, the AUTO button is a stop button.
    if (this.autoplayButton && this.autoplayStatus.visible) {
      this.options.onAutoplayStop?.();
      return;
    }
    if (this.autoplayPanel) this.autoplayPanel.visible = !this.autoplayPanel.visible;
  }

  private startAutoplay(): void {
    if (this.controlsLocked || !this.autoplayCountCycle) return;
    const bet = this.betMinor;
    const lossX = this.lossLimitCycle?.current() ?? null;
    const winX = this.winThresholdCycle?.current() ?? null;
    const floorX = this.balanceFloorCycle?.current() ?? null;
    const config: AutoplayConfig = {
      rounds: this.autoplayCountCycle.current(),
      stopOnFeature: this.stopOnFeatureCycle?.current() ?? true,
      ...(lossX !== null ? { lossLimitMinor: bet * lossX } : {}),
      ...(winX !== null ? { winThresholdMinor: bet * winX } : {}),
      ...(floorX !== null ? { balanceFloorMinor: bet * floorX } : {}),
    };
    if (this.autoplayPanel) this.autoplayPanel.visible = false;
    this.options.onUiClick?.();
    this.options.onAutoplayStart?.(config);
  }

  private toggleSettings(): void {
    this.settingsOpen = !this.settingsOpen;
    this.settingsPanel.visible = this.settingsOpen;
    this.options.onUiClick?.();
    this.options.onSettingsToggled?.(this.settingsOpen);
  }
}

/**
 * Game state machine — CONVENTIONS §4.4, exact 23-state set.
 *
 * Authoritative round states (server-owned): round_requested →
 * outcome_received → outcome_committed → … → round_complete. Everything
 * `presenting_*`, `*_entry`, `feature_summary` is client presentation.
 * UI-only states (menus, paytable, settings) are NOT in this machine; they are
 * overlays that never block settlement.
 *
 * Pure logic — no DOM, no timers. The presentation layer subscribes to typed
 * events and entry/exit hooks.
 */

export const GAME_STATES = [
  'boot',
  'loading',
  'ready',
  'round_requested',
  'outcome_received',
  'outcome_committed',
  'presenting_initial_result',
  'presenting_wins',
  'presenting_cascades',
  'feature_pending',
  'feature_entry',
  'feature_active',
  'super_feature_entry',
  'super_feature_active',
  'ultimate_feature_entry',
  'ultimate_feature_active',
  'feature_retrigger',
  'maximum_win',
  'feature_summary',
  'round_complete',
  'reconnecting',
  'recovering',
  'error',
] as const;

export type GameState = (typeof GAME_STATES)[number];

/** Server-owned states: the client can only observe these, never invent them. */
const AUTHORITATIVE_STATES: readonly GameState[] = [
  'round_requested',
  'outcome_received',
  'outcome_committed',
  'round_complete',
];

export function isAuthoritative(state: GameState): boolean {
  return AUTHORITATIVE_STATES.includes(state);
}

/** Client presentation states (skippable/seekable; never affect settlement). */
export function isPresentation(state: GameState): boolean {
  return (
    state.startsWith('presenting_') ||
    state.endsWith('_entry') ||
    state.endsWith('_active') ||
    state === 'feature_pending' ||
    state === 'feature_retrigger' ||
    state === 'maximum_win' ||
    state === 'feature_summary'
  );
}

/**
 * Legal transition table. `error` is reachable from every state (implicit,
 * added below); `reconnecting` is listed explicitly where a connection loss
 * is meaningful.
 */
const BASE_TRANSITIONS: Record<GameState, readonly GameState[]> = {
  boot: ['loading'],
  loading: ['ready', 'reconnecting'],
  ready: ['round_requested', 'reconnecting', 'loading'],
  round_requested: ['outcome_received', 'reconnecting'],
  outcome_received: ['outcome_committed'],
  outcome_committed: ['presenting_initial_result', 'recovering'],
  presenting_initial_result: [
    'presenting_wins',
    'presenting_cascades',
    'feature_pending',
    'maximum_win',
    'round_complete',
    'reconnecting',
  ],
  presenting_wins: ['presenting_cascades', 'feature_pending', 'maximum_win', 'round_complete', 'reconnecting'],
  presenting_cascades: ['presenting_wins', 'feature_pending', 'maximum_win', 'round_complete', 'reconnecting'],
  feature_pending: ['feature_entry', 'super_feature_entry', 'ultimate_feature_entry', 'reconnecting'],
  feature_entry: ['feature_active', 'reconnecting'],
  feature_active: [
    'feature_retrigger',
    'super_feature_entry', // feature_upgrade step
    'ultimate_feature_entry', // feature_upgrade step
    'maximum_win',
    'feature_summary',
    'reconnecting',
  ],
  super_feature_entry: ['super_feature_active', 'reconnecting'],
  super_feature_active: [
    'feature_retrigger',
    'ultimate_feature_entry', // feature_upgrade step
    'maximum_win',
    'feature_summary',
    'reconnecting',
  ],
  ultimate_feature_entry: ['ultimate_feature_active', 'reconnecting'],
  ultimate_feature_active: ['feature_retrigger', 'maximum_win', 'feature_summary', 'reconnecting'],
  feature_retrigger: ['feature_active', 'super_feature_active', 'ultimate_feature_active', 'reconnecting'],
  maximum_win: ['feature_summary', 'round_complete', 'reconnecting'],
  feature_summary: ['round_complete', 'reconnecting'],
  round_complete: ['ready', 'reconnecting'],
  reconnecting: ['recovering', 'loading', 'ready'],
  recovering: [
    'presenting_initial_result',
    'presenting_wins',
    'presenting_cascades',
    'feature_pending',
    'feature_active',
    'super_feature_active',
    'ultimate_feature_active',
    'feature_retrigger',
    'maximum_win',
    'feature_summary',
    'round_complete',
    'ready',
  ],
  error: ['loading', 'ready', 'reconnecting'],
};

/** error is reachable from every state. */
export const TRANSITIONS: Readonly<Record<GameState, readonly GameState[]>> = Object.fromEntries(
  GAME_STATES.map((from) => [
    from,
    from === 'error' ? BASE_TRANSITIONS[from] : [...BASE_TRANSITIONS[from], 'error'],
  ]),
) as Record<GameState, readonly GameState[]>;

// ---------------------------------------------------------------------------
// Typed events
// ---------------------------------------------------------------------------

export interface TransitionInfo {
  from: GameState;
  to: GameState;
  /** Free-form cause tag (e.g. 'spin_pressed', 'manifest_step:step-3'). */
  cause?: string;
}

export interface MachineEventMap {
  transition: TransitionInfo;
  invalidTransition: TransitionInfo & { reason: string };
  guardBlocked: TransitionInfo & { guard: string };
}

export type MachineEventName = keyof MachineEventMap;

export type MachineMode = 'dev' | 'prod';

export class InvalidTransitionError extends Error {
  constructor(
    readonly from: GameState,
    readonly to: GameState,
    readonly transitionCause?: string,
  ) {
    super(`invalid transition ${from} → ${to}${transitionCause ? ` (cause: ${transitionCause})` : ''}`);
    this.name = 'InvalidTransitionError';
  }
}

type Guard = (info: TransitionInfo) => boolean;
type Hook = (info: TransitionInfo) => void;
type Listener<K extends MachineEventName> = (payload: MachineEventMap[K]) => void;

export interface StateMachineOptions {
  /**
   * dev  → invalid transitions THROW (fail fast during development/tests).
   * prod → invalid transitions are refused without corrupting state: the
   *        machine stays where it is, emits `invalidTransition`, and
   *        transition() returns false. Callers route to `error`/`recovering`
   *        explicitly if needed — the machine never crashes the game loop.
   */
  mode?: MachineMode;
  initial?: GameState;
}

export class SlotStateMachine {
  private current: GameState;
  private readonly mode: MachineMode;
  private readonly guards = new Map<string, Guard>();
  private readonly enterHooks = new Map<GameState, Hook[]>();
  private readonly exitHooks = new Map<GameState, Hook[]>();
  private readonly listeners = new Map<MachineEventName, Listener<MachineEventName>[]>();
  private readonly transitionLog: TransitionInfo[] = [];

  constructor(options: StateMachineOptions = {}) {
    this.mode = options.mode ?? 'dev';
    this.current = options.initial ?? 'boot';
  }

  get state(): GameState {
    return this.current;
  }

  /** Read-only transition history (most recent last). */
  get history(): readonly TransitionInfo[] {
    return this.transitionLog;
  }

  canTransition(to: GameState): boolean {
    return TRANSITIONS[this.current].includes(to);
  }

  /**
   * Attempt a transition. Returns true if applied.
   * Illegal target: throws in dev, refuses + emits in prod (see options doc).
   * Guard veto: refuses + emits `guardBlocked` in both modes (never throws —
   * a guard saying "not now" is normal control flow, not a bug).
   */
  transition(to: GameState, cause?: string): boolean {
    const info: TransitionInfo = cause === undefined ? { from: this.current, to } : { from: this.current, to, cause };
    if (!this.canTransition(to)) {
      if (this.mode === 'dev') throw new InvalidTransitionError(this.current, to, cause);
      this.emit('invalidTransition', { ...info, reason: 'not in transition table' });
      return false;
    }
    for (const [name, guard] of this.guards) {
      if (!guard(info)) {
        this.emit('guardBlocked', { ...info, guard: name });
        return false;
      }
    }
    for (const hook of this.exitHooks.get(this.current) ?? []) hook(info);
    this.current = to;
    this.transitionLog.push(info);
    this.emit('transition', info);
    for (const hook of this.enterHooks.get(to) ?? []) hook(info);
    return true;
  }

  /** Register a named global guard; return value false vetoes the transition. */
  addGuard(name: string, guard: Guard): () => void {
    this.guards.set(name, guard);
    return () => void this.guards.delete(name);
  }

  onEnter(state: GameState, hook: Hook): () => void {
    const list = this.enterHooks.get(state) ?? [];
    list.push(hook);
    this.enterHooks.set(state, list);
    return () => this.removeHook(this.enterHooks, state, hook);
  }

  onExit(state: GameState, hook: Hook): () => void {
    const list = this.exitHooks.get(state) ?? [];
    list.push(hook);
    this.exitHooks.set(state, list);
    return () => this.removeHook(this.exitHooks, state, hook);
  }

  on<K extends MachineEventName>(event: K, listener: Listener<K>): () => void {
    const list = this.listeners.get(event) ?? [];
    list.push(listener as Listener<MachineEventName>);
    this.listeners.set(event, list);
    return () => {
      const cur = this.listeners.get(event) ?? [];
      const i = cur.indexOf(listener as Listener<MachineEventName>);
      if (i >= 0) cur.splice(i, 1);
    };
  }

  private emit<K extends MachineEventName>(event: K, payload: MachineEventMap[K]): void {
    for (const listener of this.listeners.get(event) ?? []) {
      (listener as Listener<K>)(payload);
    }
  }

  private removeHook(map: Map<GameState, Hook[]>, state: GameState, hook: Hook): void {
    const list = map.get(state) ?? [];
    const i = list.indexOf(hook);
    if (i >= 0) list.splice(i, 1);
  }
}

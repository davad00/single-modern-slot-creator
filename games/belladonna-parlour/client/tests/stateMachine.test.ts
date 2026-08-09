import { describe, expect, test } from 'bun:test';
import {
  GAME_STATES,
  InvalidTransitionError,
  SlotStateMachine,
  TRANSITIONS,
  isAuthoritative,
  isPresentation,
  type GameState,
} from '../src/core/stateMachine.js';

describe('canonical state set (CONVENTIONS §4.4)', () => {
  test('exactly the 23 canonical states', () => {
    expect(GAME_STATES.length).toBe(23);
    expect(new Set(GAME_STATES).size).toBe(23);
    for (const s of [
      'boot', 'loading', 'ready', 'round_requested', 'outcome_received', 'outcome_committed',
      'presenting_initial_result', 'presenting_wins', 'presenting_cascades', 'feature_pending',
      'feature_entry', 'feature_active', 'super_feature_entry', 'super_feature_active',
      'ultimate_feature_entry', 'ultimate_feature_active', 'feature_retrigger', 'maximum_win',
      'feature_summary', 'round_complete', 'reconnecting', 'recovering', 'error',
    ]) {
      expect(GAME_STATES).toContain(s as GameState);
    }
  });

  test('every state has outgoing transitions and every target is a real state', () => {
    for (const from of GAME_STATES) {
      const targets = TRANSITIONS[from];
      expect(targets.length).toBeGreaterThan(0);
      for (const to of targets) expect(GAME_STATES).toContain(to);
    }
  });

  test('error is reachable from every other state', () => {
    for (const from of GAME_STATES) {
      if (from === 'error') continue;
      expect(TRANSITIONS[from]).toContain('error');
    }
  });
});

describe('legal path through all 23 states', () => {
  test('a multi-round walk visits every state via legal transitions only', () => {
    const machine = new SlotStateMachine({ mode: 'dev' }); // dev mode: any illegal hop throws
    const visited = new Set<GameState>([machine.state]);
    const walk: GameState[] = [
      'loading', 'ready',
      // round 1: line wins, cascades, feature tier with retrigger
      'round_requested', 'outcome_received', 'outcome_committed',
      'presenting_initial_result', 'presenting_wins', 'presenting_cascades',
      'feature_pending', 'feature_entry', 'feature_active', 'feature_retrigger', 'feature_active',
      'feature_summary', 'round_complete', 'ready',
      // round 2: super feature
      'round_requested', 'outcome_received', 'outcome_committed', 'presenting_initial_result',
      'feature_pending', 'super_feature_entry', 'super_feature_active', 'feature_summary',
      'round_complete', 'ready',
      // round 3: ultimate feature hitting max win
      'round_requested', 'outcome_received', 'outcome_committed', 'presenting_initial_result',
      'feature_pending', 'ultimate_feature_entry', 'ultimate_feature_active', 'maximum_win',
      'feature_summary', 'round_complete', 'ready',
      // connection loss + recovery
      'reconnecting', 'recovering', 'ready',
      // error and back
      'error', 'ready',
    ];
    for (const next of walk) {
      expect(machine.transition(next)).toBe(true);
      visited.add(next);
    }
    expect(visited.size).toBe(23); // every canonical state visited
    expect(machine.state).toBe('ready');
  });
});

describe('invalid-transition policy', () => {
  test('dev mode throws InvalidTransitionError', () => {
    const machine = new SlotStateMachine({ mode: 'dev', initial: 'ready' });
    expect(() => machine.transition('presenting_wins')).toThrow(InvalidTransitionError);
    expect(machine.state).toBe('ready'); // state untouched
  });

  test('prod mode refuses without corrupting state and emits invalidTransition', () => {
    const machine = new SlotStateMachine({ mode: 'prod', initial: 'ready' });
    const emitted: string[] = [];
    machine.on('invalidTransition', (e) => emitted.push(`${e.from}->${e.to}`));
    expect(machine.transition('presenting_wins')).toBe(false);
    expect(machine.state).toBe('ready');
    expect(emitted).toEqual(['ready->presenting_wins']);
    // machine remains fully usable afterwards (recovery, not crash)
    expect(machine.transition('round_requested')).toBe(true);
  });
});

describe('guards', () => {
  test('a vetoing guard blocks the transition and emits guardBlocked', () => {
    const machine = new SlotStateMachine({ initial: 'ready' });
    const blocked: string[] = [];
    machine.on('guardBlocked', (e) => blocked.push(e.guard));
    machine.addGuard('balance-check', (info) => info.to !== 'round_requested');
    expect(machine.transition('round_requested')).toBe(false);
    expect(machine.state).toBe('ready');
    expect(blocked).toEqual(['balance-check']);
  });

  test('guard removal re-enables the transition', () => {
    const machine = new SlotStateMachine({ initial: 'ready' });
    const remove = machine.addGuard('deny-all', () => false);
    expect(machine.transition('round_requested')).toBe(false);
    remove();
    expect(machine.transition('round_requested')).toBe(true);
  });
});

describe('entry/exit hooks and typed events', () => {
  test('exit → transition → enter ordering, with cause propagation', () => {
    const machine = new SlotStateMachine({ initial: 'ready' });
    const order: string[] = [];
    machine.onExit('ready', (i) => order.push(`exit:${i.from}`));
    machine.on('transition', (i) => order.push(`transition:${i.from}->${i.to}:${i.cause}`));
    machine.onEnter('round_requested', (i) => order.push(`enter:${i.to}`));
    machine.transition('round_requested', 'spin_pressed');
    expect(order).toEqual([
      'exit:ready',
      'transition:ready->round_requested:spin_pressed',
      'enter:round_requested',
    ]);
    expect(machine.history.at(-1)).toEqual({ from: 'ready', to: 'round_requested', cause: 'spin_pressed' });
  });
});

describe('state classification', () => {
  test('isAuthoritative: exactly the server-owned round states', () => {
    const authoritative = GAME_STATES.filter(isAuthoritative);
    expect([...authoritative].sort()).toEqual([
      'outcome_committed',
      'outcome_received',
      'round_complete',
      'round_requested',
    ] as GameState[]);
  });

  test('isPresentation covers presenting/entry/active/summary states', () => {
    for (const s of [
      'presenting_initial_result', 'presenting_wins', 'presenting_cascades', 'feature_pending',
      'feature_entry', 'feature_active', 'super_feature_entry', 'super_feature_active',
      'ultimate_feature_entry', 'ultimate_feature_active', 'feature_retrigger', 'maximum_win',
      'feature_summary',
    ] as GameState[]) {
      expect(isPresentation(s)).toBe(true);
    }
    for (const s of ['boot', 'loading', 'ready', 'round_requested', 'round_complete', 'error'] as GameState[]) {
      expect(isPresentation(s)).toBe(false);
    }
  });
});

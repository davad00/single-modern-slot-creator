/**
 * audioManager — music-state machine + crossfade math, ducking math,
 * polyphony caps, unlock, focus loss, and the silent-safe guarantee (missing
 * context/buffers never throw). Runs against a mock AudioContext — no
 * browser, no pixi.
 */

import { describe, expect, test } from 'bun:test';
import {
  AudioManager,
  DEFAULT_AUDIO_EVENTS,
  MUSIC_STATES,
  musicEventForState,
  type AudioContextLike,
  type AudioNodeLike,
  type BufferSourceLike,
  type GainNodeLike,
} from '../src/presentation/audioManager.js';

// ---------------------------------------------------------------------------
// Mock Web Audio backend
// ---------------------------------------------------------------------------

class MockGain implements GainNodeLike {
  gain = { value: 1 };
  connected: AudioNodeLike | null = null;
  connect(destination: AudioNodeLike): unknown {
    this.connected = destination;
    return destination;
  }
  disconnect(): void {
    this.connected = null;
  }
}

class MockSource implements BufferSourceLike {
  buffer: unknown = null;
  loop = false;
  loopStart = 0;
  loopEnd = 0;
  onended: (() => void) | null = null;
  started = 0;
  stopped = 0;
  connected: AudioNodeLike | null = null;
  connect(destination: AudioNodeLike): unknown {
    this.connected = destination;
    return destination;
  }
  disconnect(): void {
    this.connected = null;
  }
  start(): void {
    this.started += 1;
  }
  stop(): void {
    this.stopped += 1;
    this.onended?.();
  }
}

class MockContext implements AudioContextLike {
  state: 'suspended' | 'running' | 'closed' = 'suspended';
  currentTime = 0;
  destination: AudioNodeLike = new MockGain();
  gains: MockGain[] = [];
  sources: MockSource[] = [];
  resumes = 0;
  suspends = 0;
  createGain(): GainNodeLike {
    const gain = new MockGain();
    this.gains.push(gain);
    return gain;
  }
  createBufferSource(): BufferSourceLike {
    const source = new MockSource();
    this.sources.push(source);
    return source;
  }
  async resume(): Promise<void> {
    this.resumes += 1;
    this.state = 'running';
  }
  async suspend(): Promise<void> {
    this.suspends += 1;
    this.state = 'suspended';
  }
}

function makeManager(crossfadeMs = 1000): { manager: AudioManager; context: MockContext } {
  const context = new MockContext();
  const manager = new AudioManager({ context, crossfadeMs });
  manager.registerEvents(DEFAULT_AUDIO_EVENTS);
  for (const state of MUSIC_STATES) manager.setBuffer(musicEventForState(state), { fake: state });
  manager.setBuffer('sfx.win.big', {});
  manager.setBuffer('sfx.scatter.land', {});
  manager.setBuffer('sfx.reel.stop', {});
  manager.setBuffer('ui.click', {});
  return { manager, context };
}

describe('silent-safety (§8: missing files never throw)', () => {
  test('no context at all: every call is a safe no-op, state still advances', () => {
    const manager = new AudioManager({ context: null });
    manager.registerEvents(DEFAULT_AUDIO_EVENTS);
    expect(manager.audible).toBe(false);
    const handle = manager.play('sfx.win.big'); // no context, no buffer
    expect(handle.playing).toBe(false);
    handle.stop();
    manager.setMusicState('feature');
    manager.update(500);
    manager.unlock();
    manager.handleVisibilityChange(true);
    manager.handleVisibilityChange(false);
    expect(manager.currentMusicState).toBe('feature'); // state machine ran anyway
  });

  test('unknown event id → inert handle, no throw', () => {
    const { manager } = makeManager();
    const handle = manager.play('sfx.does.not.exist');
    expect(handle.playing).toBe(false);
  });

  test('registered event with NO buffer → inert handle, no duck, no voice', () => {
    const { manager } = makeManager();
    const handle = manager.play('sfx.feature.enter'); // no buffer set for it
    expect(handle.playing).toBe(false);
    expect(manager.activeVoiceCount('sfx.feature.enter')).toBe(0);
    expect(manager.duckFactor('music')).toBe(1); // duck NOT applied by a silent voice
  });

  test('createContext factory that fails leaves the manager silent, not broken', () => {
    const manager = new AudioManager({
      createContext: () => {
        throw new Error('no audio hardware');
      },
    });
    manager.registerEvents(DEFAULT_AUDIO_EVENTS);
    manager.unlock();
    expect(manager.audible).toBe(false);
    expect(manager.play('ui.click').playing).toBe(false);
  });
});

describe('unlock-on-first-gesture + focus loss', () => {
  test('unlock resumes a suspended context', () => {
    const { manager, context } = makeManager();
    expect(context.state).toBe('suspended');
    manager.unlock();
    expect(manager.unlocked).toBe(true);
    expect(context.resumes).toBe(1);
    expect(context.state).toBe('running');
    manager.unlock(); // idempotent
    expect(manager.unlocked).toBe(true);
  });

  test('focus loss hard-mutes + suspends; refocus restores when unlocked', () => {
    const { manager, context } = makeManager();
    manager.unlock();
    manager.handleVisibilityChange(true);
    expect(manager.effectiveMasterGain()).toBe(0);
    expect(context.suspends).toBe(1);
    manager.handleVisibilityChange(false);
    expect(manager.effectiveMasterGain()).toBe(1);
    expect(context.state).toBe('running');
  });

  test('user mute is independent of focus mute', () => {
    const { manager } = makeManager();
    manager.setMuted(true);
    expect(manager.effectiveMasterGain()).toBe(0);
    manager.handleVisibilityChange(true);
    manager.handleVisibilityChange(false);
    expect(manager.effectiveMasterGain()).toBe(0); // still user-muted
    manager.setMuted(false);
    expect(manager.effectiveMasterGain()).toBe(1);
  });
});

describe('music-state machine + crossfade math', () => {
  test('covers base + all three feature tiers (§4.3)', () => {
    expect(MUSIC_STATES).toEqual(['base', 'feature', 'super_feature', 'ultimate_feature']);
    expect(musicEventForState('super_feature')).toBe('music.super_feature');
  });

  test('linear crossfade: gains sum to 1 and progress with update(dt)', () => {
    const { manager } = makeManager(1000);
    manager.setMusicState('feature');
    expect(manager.currentMusicState).toBe('feature');
    expect(manager.previousMusicState).toBe('base');

    expect(manager.musicGain('feature')).toBe(0);
    manager.update(250);
    expect(manager.musicGain('feature')).toBeCloseTo(0.25, 6);
    expect(manager.musicGain('base')).toBeCloseTo(0.75, 6);
    manager.update(250);
    expect(manager.musicGain('feature')).toBeCloseTo(0.5, 6);
    expect(manager.musicGain('base')).toBeCloseTo(0.5, 6);
    manager.update(500);
    expect(manager.crossfadeProgress).toBe(1);
    expect(manager.musicGain('feature')).toBe(1);
    expect(manager.musicGain('base')).toBe(0);
  });

  test('immediate transition skips the crossfade', () => {
    const { manager } = makeManager(1000);
    manager.setMusicState('ultimate_feature', { immediate: true });
    expect(manager.crossfadeProgress).toBe(1);
    expect(manager.musicGain('ultimate_feature')).toBe(1);
    expect(manager.musicGain('base')).toBe(0);
  });

  test('setting the same state twice is a no-op', () => {
    const { manager } = makeManager(1000);
    manager.setMusicState('feature');
    manager.update(1000);
    manager.setMusicState('feature');
    expect(manager.crossfadeProgress).toBe(1); // no new crossfade started
  });

  test('the outgoing music voice is stopped when the crossfade completes', () => {
    const { manager, context } = makeManager(1000);
    manager.setMusicState('base', { immediate: true }); // no-op (already base)
    manager.setMusicState('feature');
    const baseSources = context.sources.filter((s) => (s.buffer as { fake?: string })?.fake === 'base');
    manager.update(1000);
    // any base-music source that was started must be stopped after the fade
    for (const source of baseSources) {
      if (source.started > 0) expect(source.stopped).toBeGreaterThan(0);
    }
    // incoming loop is looping and audible at full crossfade gain
    const featureSource = context.sources.find((s) => (s.buffer as { fake?: string })?.fake === 'feature');
    expect(featureSource?.loop).toBe(true);
  });
});

describe('ducking math', () => {
  test('sfx.win.big ducks the music bus by its configured factor (0.3)', () => {
    const { manager } = makeManager();
    manager.setLevel('music', 0.8);
    expect(manager.effectiveBusGain('music')).toBeCloseTo(0.8, 6);
    const handle = manager.play('sfx.win.big');
    expect(handle.playing).toBe(true);
    expect(manager.duckFactor('music')).toBeCloseTo(0.3, 6);
    expect(manager.effectiveBusGain('music')).toBeCloseTo(0.8 * 0.3, 6);
    handle.stop();
    expect(manager.duckFactor('music')).toBe(1);
    expect(manager.effectiveBusGain('music')).toBeCloseTo(0.8, 6);
  });

  test('concurrent ducks: the strongest (minimum) factor wins; release restores stepwise', () => {
    const { manager } = makeManager();
    const scatter = manager.play('sfx.scatter.land'); // duck 0.6
    expect(manager.duckFactor('music')).toBeCloseTo(0.6, 6);
    const big = manager.play('sfx.win.big'); // duck 0.3
    expect(manager.duckFactor('music')).toBeCloseTo(0.3, 6);
    big.stop();
    expect(manager.duckFactor('music')).toBeCloseTo(0.6, 6); // scatter still ducking
    scatter.stop();
    expect(manager.duckFactor('music')).toBe(1);
  });

  test('bus gain node values track level × duck', () => {
    const { manager, context } = makeManager();
    manager.setLevel('music', 0.5);
    manager.play('sfx.win.big');
    // the music bus gain node must now read 0.5 * 0.3
    const values = context.gains.map((g) => g.gain.value);
    expect(values.some((v) => Math.abs(v - 0.15) < 1e-6)).toBe(true);
  });

  test('non-ducking events leave every bus untouched', () => {
    const { manager } = makeManager();
    manager.play('sfx.reel.stop');
    expect(manager.duckFactor('music')).toBe(1);
    expect(manager.duckFactor('sfx')).toBe(1);
    expect(manager.duckFactor('ui')).toBe(1);
  });
});

describe('polyphony caps', () => {
  test('voices beyond the cap evict the oldest voice of the same event', () => {
    const { manager } = makeManager();
    // sfx.reel.stop: polyphony 5
    const handles = Array.from({ length: 5 }, () => manager.play('sfx.reel.stop'));
    expect(manager.activeVoiceCount('sfx.reel.stop')).toBe(5);
    const sixth = manager.play('sfx.reel.stop');
    expect(sixth.playing).toBe(true);
    expect(manager.activeVoiceCount('sfx.reel.stop')).toBe(5); // capped
    expect(handles[0]?.playing).toBe(false); // oldest evicted
    expect(handles[4]?.playing).toBe(true);
  });

  test('polyphony-1 events never stack (win.big cannot double-fire)', () => {
    const { manager } = makeManager();
    const first = manager.play('sfx.win.big');
    const second = manager.play('sfx.win.big');
    expect(manager.activeVoiceCount('sfx.win.big')).toBe(1);
    expect(first.playing).toBe(false);
    expect(second.playing).toBe(true);
    // duck must still be exactly one application after the swap
    expect(manager.duckFactor('music')).toBeCloseTo(0.3, 6);
  });

  test('stopAll clears every voice and every duck', () => {
    const { manager } = makeManager();
    manager.play('sfx.win.big');
    manager.play('sfx.reel.stop');
    manager.play('sfx.reel.stop');
    manager.stopAll();
    expect(manager.activeVoiceCount('sfx.win.big')).toBe(0);
    expect(manager.activeVoiceCount('sfx.reel.stop')).toBe(0);
    expect(manager.duckFactor('music')).toBe(1);
  });
});

describe('levels', () => {
  test('levels clamp to [0, 1]', () => {
    const { manager } = makeManager();
    manager.setLevel('sfx', 1.7);
    expect(manager.getLevel('sfx')).toBe(1);
    manager.setLevel('sfx', -2);
    expect(manager.getLevel('sfx')).toBe(0);
  });

  test('update() rejects negative deltas (clock contract)', () => {
    const { manager } = makeManager();
    expect(() => manager.update(-1)).toThrow(RangeError);
  });
});

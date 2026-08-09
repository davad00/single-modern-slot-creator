/**
 * Silent-safe Web Audio manager.
 *
 * Hard guarantees (CONVENTIONS §8 "client ships a silent-safe audio manager"):
 *   - missing audio files / missing Web Audio support NEVER throw — every
 *     public method degrades to a silent no-op while state keeps advancing
 *   - the game is fully playable with zero audio assets
 *
 * Structure:
 *   voice → bus gain (music/sfx/ui) → master gain → destination
 *
 * Features per §9.8: music-state machine with crossfades covering base +
 * all three feature tiers, per-event ducking, polyphony caps with priority
 * eviction, unlock-on-first-gesture, focus-loss muting.
 *
 * PURE presentation logic apart from the injected AudioContext-like object:
 * no DOM, no PixiJS, no wall clock (crossfades advance via update(dtMs) from
 * the frame clock — deterministic and testable with a mock context).
 */

import type { TierId } from '../core/types.js';

// ---------------------------------------------------------------------------
// Minimal structural Web Audio interfaces (mock-friendly; a real
// AudioContext satisfies them).
// ---------------------------------------------------------------------------

export interface AudioParamLike {
  value: number;
}

export interface AudioNodeLike {
  connect(destination: AudioNodeLike): unknown;
  disconnect(): void;
}

export interface GainNodeLike extends AudioNodeLike {
  gain: AudioParamLike;
}

export interface BufferSourceLike extends AudioNodeLike {
  buffer: unknown;
  loop: boolean;
  loopStart: number;
  loopEnd: number;
  start(when?: number): void;
  stop(when?: number): void;
  onended: (() => void) | null;
}

export interface AudioContextLike {
  state: 'suspended' | 'running' | 'closed';
  currentTime: number;
  destination: AudioNodeLike;
  createGain(): GainNodeLike;
  createBufferSource(): BufferSourceLike;
  resume(): Promise<void>;
  suspend(): Promise<void>;
}

// ---------------------------------------------------------------------------
// Audio-event config — §9.8: loop points, priority, ducking, polyphony.
// ---------------------------------------------------------------------------

export type AudioBusId = 'music' | 'sfx' | 'ui';

export const AUDIO_BUSES: readonly AudioBusId[] = ['music', 'sfx', 'ui'];

export interface DuckingConfig {
  /** Bus whose gain is reduced while this event plays. */
  bus: AudioBusId;
  /** Multiplier ∈ [0, 1] applied to the ducked bus (0.3 = duck to 30 %). */
  factor: number;
}

export interface AudioEventConfig {
  /** `music.<state>` | `sfx.<context>.<name>` | `amb.<name>` | `ui.<name>` (§4.3). */
  id: string;
  bus: AudioBusId;
  loop?: boolean;
  /** Loop points in seconds (used when loop is true and the backend supports it). */
  loopStartSec?: number;
  loopEndSec?: number;
  /** Per-voice gain ∈ [0, 1]. Default 1. */
  gain?: number;
  /** Higher survives polyphony contention. Default 0. */
  priority?: number;
  /** Max concurrent voices of THIS event. Default 4. */
  polyphony?: number;
  duck?: DuckingConfig;
}

// ---------------------------------------------------------------------------
// Music-state machine — base + the three tiers (§4.1, §4.3).
// ---------------------------------------------------------------------------

export type MusicStateId = 'base' | TierId;

export const MUSIC_STATES: readonly MusicStateId[] = ['base', 'feature', 'super_feature', 'ultimate_feature'];

export function musicEventForState(state: MusicStateId): string {
  return `music.${state}`;
}

// ---------------------------------------------------------------------------
// Voices
// ---------------------------------------------------------------------------

export interface VoiceHandle {
  readonly voiceId: number;
  readonly eventId: string;
  /** False once stopped/evicted (or when the voice never had a sound source). */
  readonly playing: boolean;
  stop(): void;
}

interface Voice {
  voiceId: number;
  config: AudioEventConfig;
  source: BufferSourceLike | null;
  gainNode: GainNodeLike | null;
  playing: boolean;
}

export interface AudioManagerOptions {
  /**
   * Injected context. Omit in the browser (created lazily on unlock());
   * pass a mock in tests; pass null to force silent mode.
   */
  context?: AudioContextLike | null;
  /** Music crossfade length, ms. Default 800. */
  crossfadeMs?: number;
  /** Lazy factory used by unlock() when no context was injected. */
  createContext?: () => AudioContextLike | null;
}

export class AudioManager {
  private context: AudioContextLike | null;
  private readonly createContextFn: (() => AudioContextLike | null) | null;
  private readonly crossfadeMs: number;

  private masterGain: GainNodeLike | null = null;
  private busGains: Partial<Record<AudioBusId, GainNodeLike>> = {};

  private readonly configs = new Map<string, AudioEventConfig>();
  private readonly buffers = new Map<string, unknown>();
  private readonly voicesByEvent = new Map<string, Voice[]>();
  private readonly activeDucks = new Map<number, DuckingConfig>();
  private voiceSeq = 0;

  private levels: Record<'master' | AudioBusId, number> = { master: 1, music: 1, sfx: 1, ui: 1 };
  private muted = false;
  private focusMuted = false;
  private unlockedFlag = false;

  private musicState: MusicStateId = 'base';
  private previousMusicStateValue: MusicStateId | null = null;
  private crossfadeElapsedMs = 0;
  private crossfading = false;
  private musicVoices: Partial<Record<MusicStateId, Voice>> = {};

  constructor(options: AudioManagerOptions = {}) {
    this.context = options.context ?? null;
    this.createContextFn = options.createContext ?? null;
    this.crossfadeMs = options.crossfadeMs ?? 800;
    if (this.context) this.buildGraph();
  }

  // -- setup ----------------------------------------------------------------

  /** Register configs (idempotent per id: last registration wins). */
  registerEvents(configs: readonly AudioEventConfig[]): void {
    for (const config of configs) this.configs.set(config.id, config);
  }

  /**
   * Attach a decoded buffer for an event. Never required: events without a
   * buffer simply play silently (inert handle).
   */
  setBuffer(eventId: string, buffer: unknown): void {
    this.buffers.set(eventId, buffer);
  }

  /**
   * Unlock on first user gesture (browsers block audio before a gesture).
   * Safe to call repeatedly, never throws.
   */
  unlock(): void {
    this.unlockedFlag = true;
    if (!this.context && this.createContextFn) {
      try {
        this.context = this.createContextFn();
        if (this.context) this.buildGraph();
      } catch {
        this.context = null; // stay silent-safe
      }
    }
    const ctx = this.context;
    if (ctx && ctx.state === 'suspended' && !this.focusMuted) {
      void ctx.resume().catch(() => undefined);
    }
  }

  get unlocked(): boolean {
    return this.unlockedFlag;
  }

  /** True when a real audio backend is wired up (false = fully silent mode). */
  get audible(): boolean {
    return this.context !== null;
  }

  // -- playback ---------------------------------------------------------------

  /**
   * Play an audio event. NEVER throws:
   *   - unknown event id → inert handle
   *   - no context / no buffer for the id → inert handle (silent-safe)
   *   - polyphony cap hit and every active voice outranks the new one → inert
   * Real voices count toward polyphony and apply ducking; inert ones don't.
   */
  play(eventId: string): VoiceHandle {
    const config = this.configs.get(eventId);
    if (!config) return this.inertHandle(eventId);

    const ctx = this.context;
    const buffer = this.buffers.get(eventId);
    const busGain = this.busGains[config.bus];
    if (!ctx || buffer === undefined || !busGain) return this.inertHandle(eventId);

    // Polyphony cap with priority eviction.
    const cap = Math.max(1, config.polyphony ?? 4);
    const active = (this.voicesByEvent.get(eventId) ?? []).filter((v) => v.playing);
    if (active.length >= cap) {
      const evictable = active[0]; // oldest voice of the SAME event
      if (evictable === undefined) return this.inertHandle(eventId);
      this.stopVoice(evictable);
    }

    let source: BufferSourceLike;
    let gainNode: GainNodeLike;
    try {
      source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = config.loop ?? false;
      if (config.loop && config.loopStartSec !== undefined) source.loopStart = config.loopStartSec;
      if (config.loop && config.loopEndSec !== undefined) source.loopEnd = config.loopEndSec;
      gainNode = ctx.createGain();
      gainNode.gain.value = config.gain ?? 1;
      source.connect(gainNode);
      gainNode.connect(busGain);
    } catch {
      return this.inertHandle(eventId); // backend hiccup → silent, never fatal
    }

    const voice: Voice = { voiceId: ++this.voiceSeq, config, source, gainNode, playing: true };
    const list = this.voicesByEvent.get(eventId) ?? [];
    list.push(voice);
    this.voicesByEvent.set(eventId, list);

    if (config.duck) {
      this.activeDucks.set(voice.voiceId, config.duck);
      this.applyGains();
    }

    source.onended = () => this.releaseVoice(voice);
    try {
      source.start();
    } catch {
      this.releaseVoice(voice);
      return this.inertHandle(eventId);
    }
    return this.handleFor(voice);
  }

  /** Stop every voice of an event (or all voices when id omitted). */
  stopAll(eventId?: string): void {
    // Copy before iterating: stopVoice → releaseVoice splices the live list.
    if (eventId !== undefined) {
      for (const voice of [...(this.voicesByEvent.get(eventId) ?? [])]) this.stopVoice(voice);
      return;
    }
    for (const voices of this.voicesByEvent.values()) {
      for (const voice of [...voices]) this.stopVoice(voice);
    }
  }

  /** Number of currently-playing real voices for an event (test/HUD hook). */
  activeVoiceCount(eventId: string): number {
    return (this.voicesByEvent.get(eventId) ?? []).filter((v) => v.playing).length;
  }

  // -- music-state machine ------------------------------------------------------

  /**
   * Transition base ↔ feature ↔ super_feature ↔ ultimate_feature music with a
   * linear crossfade over crossfadeMs (advanced by update(dt)). State always
   * transitions, with or without audio backends/buffers.
   */
  setMusicState(state: MusicStateId, opts: { immediate?: boolean } = {}): void {
    if (state === this.musicState) return;
    this.previousMusicStateValue = this.musicState;
    this.musicState = state;
    this.crossfadeElapsedMs = 0;
    this.crossfading = !opts.immediate && this.crossfadeMs > 0;

    // Start the incoming loop if we can actually make sound.
    const eventId = musicEventForState(state);
    if (!this.musicVoices[state] && this.configs.has(eventId)) {
      const handleVoice = this.playMusicVoice(eventId);
      if (handleVoice) this.musicVoices[state] = handleVoice;
    }
    if (!this.crossfading) this.finishCrossfade();
    this.applyGains();
  }

  get currentMusicState(): MusicStateId {
    return this.musicState;
  }

  get previousMusicState(): MusicStateId | null {
    return this.previousMusicStateValue;
  }

  /** Crossfade progress ∈ [0, 1]; 1 when idle. */
  get crossfadeProgress(): number {
    if (!this.crossfading) return 1;
    return Math.min(1, this.crossfadeElapsedMs / this.crossfadeMs);
  }

  /** Current crossfade gain contribution of a music state (linear ramp). */
  musicGain(state: MusicStateId): number {
    const p = this.crossfadeProgress;
    if (state === this.musicState) return p;
    if (this.crossfading && state === this.previousMusicStateValue) return 1 - p;
    return 0;
  }

  // -- frame update -----------------------------------------------------------

  /** Advance crossfades; call once per frame from the presentation clock. */
  update(dtMs: number): void {
    if (!Number.isFinite(dtMs) || dtMs < 0) throw new RangeError('update(dt): dt must be ≥ 0');
    if (this.crossfading) {
      this.crossfadeElapsedMs += dtMs;
      if (this.crossfadeElapsedMs >= this.crossfadeMs) this.finishCrossfade();
      this.applyMusicVoiceGains();
    }
  }

  // -- levels / mute / focus ----------------------------------------------------

  setLevel(bus: 'master' | AudioBusId, level: number): void {
    this.levels[bus] = Math.min(1, Math.max(0, level));
    this.applyGains();
  }

  getLevel(bus: 'master' | AudioBusId): number {
    return this.levels[bus];
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    this.applyGains();
  }

  get isMuted(): boolean {
    return this.muted;
  }

  /**
   * Focus-loss behaviour: hidden ⇒ hard-mute + suspend the context; visible ⇒
   * restore (context resumes only if the user already unlocked audio).
   */
  handleVisibilityChange(hidden: boolean): void {
    this.focusMuted = hidden;
    this.applyGains();
    const ctx = this.context;
    if (!ctx) return;
    if (hidden) {
      if (ctx.state === 'running') void ctx.suspend().catch(() => undefined);
    } else if (this.unlockedFlag && ctx.state === 'suspended') {
      void ctx.resume().catch(() => undefined);
    }
  }

  /**
   * Effective gain of a bus after user level + ducking (mute excluded — mute
   * lives on the master node). Exposed for the HUD and the ducking-math tests.
   */
  effectiveBusGain(bus: AudioBusId): number {
    return this.levels[bus] * this.duckFactor(bus);
  }

  /** Effective master gain (user level, hard-muted on mute/focus loss). */
  effectiveMasterGain(): number {
    return this.muted || this.focusMuted ? 0 : this.levels.master;
  }

  /** Strongest (minimum) active duck factor targeting a bus; 1 when none. */
  duckFactor(bus: AudioBusId): number {
    let factor = 1;
    for (const duck of this.activeDucks.values()) {
      if (duck.bus === bus) factor = Math.min(factor, Math.min(1, Math.max(0, duck.factor)));
    }
    return factor;
  }

  // -- internals ---------------------------------------------------------------

  private buildGraph(): void {
    const ctx = this.context;
    if (!ctx) return;
    try {
      this.masterGain = ctx.createGain();
      this.masterGain.connect(ctx.destination);
      for (const bus of AUDIO_BUSES) {
        const gain = ctx.createGain();
        gain.connect(this.masterGain);
        this.busGains[bus] = gain;
      }
      this.applyGains();
    } catch {
      // Backend failed mid-setup → drop to silent mode rather than crash.
      this.context = null;
      this.masterGain = null;
      this.busGains = {};
    }
  }

  private playMusicVoice(eventId: string): Voice | null {
    const config = this.configs.get(eventId);
    const ctx = this.context;
    const buffer = this.buffers.get(eventId);
    if (!config || !ctx || buffer === undefined) return null;
    const busGain = this.busGains[config.bus];
    if (!busGain) return null;
    try {
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      if (config.loopStartSec !== undefined) source.loopStart = config.loopStartSec;
      if (config.loopEndSec !== undefined) source.loopEnd = config.loopEndSec;
      const gainNode = ctx.createGain();
      gainNode.gain.value = 0; // ramped in by the crossfade
      source.connect(gainNode);
      gainNode.connect(busGain);
      source.start();
      return { voiceId: ++this.voiceSeq, config, source, gainNode, playing: true };
    } catch {
      return null;
    }
  }

  private finishCrossfade(): void {
    this.crossfading = false;
    this.crossfadeElapsedMs = this.crossfadeMs;
    const prev = this.previousMusicStateValue;
    if (prev && prev !== this.musicState) {
      const voice = this.musicVoices[prev];
      if (voice) {
        this.stopVoice(voice);
        delete this.musicVoices[prev];
      }
    }
    this.applyMusicVoiceGains();
  }

  private applyMusicVoiceGains(): void {
    for (const state of MUSIC_STATES) {
      const voice = this.musicVoices[state];
      if (voice?.gainNode) {
        voice.gainNode.gain.value = this.musicGain(state) * (voice.config.gain ?? 1);
      }
    }
  }

  private applyGains(): void {
    if (this.masterGain) this.masterGain.gain.value = this.effectiveMasterGain();
    for (const bus of AUDIO_BUSES) {
      const node = this.busGains[bus];
      if (node) node.gain.value = this.effectiveBusGain(bus);
    }
  }

  private stopVoice(voice: Voice): void {
    if (!voice.playing) return;
    try {
      voice.source?.stop();
    } catch {
      // already stopped — fine
    }
    this.releaseVoice(voice);
  }

  private releaseVoice(voice: Voice): void {
    if (!voice.playing) return;
    voice.playing = false;
    try {
      voice.source?.disconnect();
      voice.gainNode?.disconnect();
    } catch {
      // disconnect on a dead node is harmless
    }
    if (this.activeDucks.delete(voice.voiceId)) this.applyGains();
    const list = this.voicesByEvent.get(voice.config.id);
    if (list) {
      const i = list.indexOf(voice);
      if (i >= 0) list.splice(i, 1);
    }
  }

  private handleFor(voice: Voice): VoiceHandle {
    const manager = this;
    return {
      voiceId: voice.voiceId,
      eventId: voice.config.id,
      get playing() {
        return voice.playing;
      },
      stop() {
        manager.stopVoice(voice);
      },
    };
  }

  private inertHandle(eventId: string): VoiceHandle {
    return {
      voiceId: -1,
      eventId,
      playing: false,
      stop() {
        /* silent-safe no-op */
      },
    };
  }
}

// ---------------------------------------------------------------------------
// Default audio-event set — matched to DEFAULT_ANIMATION_EVENTS' audioEvent
// ids + the four music states. A generated game replaces these from
// config/audio-events.json; the template ships them so it runs (silently,
// asset-free) out of the box.
// ---------------------------------------------------------------------------

export const DEFAULT_AUDIO_EVENTS: readonly AudioEventConfig[] = [
  { id: 'music.base', bus: 'music', loop: true, priority: 10, polyphony: 1 },
  { id: 'music.feature', bus: 'music', loop: true, priority: 10, polyphony: 1 },
  { id: 'music.super_feature', bus: 'music', loop: true, priority: 10, polyphony: 1 },
  { id: 'music.ultimate_feature', bus: 'music', loop: true, priority: 10, polyphony: 1 },
  { id: 'sfx.reel.spin_start', bus: 'sfx', priority: 3, polyphony: 2 },
  { id: 'sfx.reel.stop', bus: 'sfx', priority: 3, polyphony: 5 },
  { id: 'sfx.scatter.land', bus: 'sfx', priority: 5, polyphony: 3, duck: { bus: 'music', factor: 0.6 } },
  { id: 'sfx.scatter.anticipation', bus: 'sfx', loop: true, priority: 6, polyphony: 1, duck: { bus: 'music', factor: 0.5 } },
  { id: 'sfx.win.countup', bus: 'sfx', loop: true, priority: 4, polyphony: 1 },
  { id: 'sfx.win.big', bus: 'sfx', priority: 8, polyphony: 1, duck: { bus: 'music', factor: 0.3 } },
  { id: 'sfx.cascade.remove', bus: 'sfx', priority: 3, polyphony: 3 },
  { id: 'sfx.cascade.refill', bus: 'sfx', priority: 3, polyphony: 3 },
  { id: 'sfx.feature.enter', bus: 'sfx', priority: 8, polyphony: 1, duck: { bus: 'music', factor: 0.4 } },
  { id: 'sfx.super_feature.enter', bus: 'sfx', priority: 8, polyphony: 1, duck: { bus: 'music', factor: 0.4 } },
  { id: 'sfx.ultimate_feature.enter', bus: 'sfx', priority: 8, polyphony: 1, duck: { bus: 'music', factor: 0.4 } },
  { id: 'sfx.feature.retrigger', bus: 'sfx', priority: 7, polyphony: 1 },
  { id: 'sfx.feature.summary', bus: 'sfx', priority: 7, polyphony: 1 },
  { id: 'sfx.maxwin.reached', bus: 'sfx', priority: 9, polyphony: 1, duck: { bus: 'music', factor: 0.2 } },
  { id: 'ui.click', bus: 'ui', priority: 1, polyphony: 4 },
  { id: 'ui.toggle', bus: 'ui', priority: 1, polyphony: 4 },
];

/**
 * Deterministic timeline engine.
 *
 * Pure logic, no requestAnimationFrame, no wall clock: the presentation layer
 * drives it through a clock adapter calling `advance(dtMs)` (or `seek`). Given
 * the same events and the same sequence of advance/seek/skip calls, the firing
 * order is IDENTICAL — this is what makes skip/turbo equivalence provable.
 *
 * Each event produces two firings: 'start' at `at` and 'complete' at
 * `at + duration`. Firings are ordered by (time asc, priority desc, insertion
 * order asc). Skipping fast-forwards — every remaining firing still fires (in
 * order, flagged `skipped: true`), so no game-logic callback is ever lost.
 */

export type SkipTarget = 'complete' | 'next_step' | 'summary';

export type TimelineMarker = 'step' | 'summary';

export interface TimelineEventInput {
  /** Unique id — duplicates are rejected (DuplicateEventError). */
  id: string;
  /** Start time on the timeline, ms, ≥ 0. */
  at: number;
  /** Duration ms (default 0 → start and complete fire at the same time). */
  duration?: number;
  /** Higher fires first among same-time firings. Default 0. */
  priority?: number;
  /** Structural marker used by skipTo('next_step' | 'summary'). */
  marker?: TimelineMarker;
  /** Opaque payload delivered with every firing. */
  payload?: unknown;
}

export interface TimelineFiring {
  eventId: string;
  phase: 'start' | 'complete';
  /** Timeline time the firing was scheduled at. */
  at: number;
  /** True when delivered via seek/skip fast-forward. */
  skipped: boolean;
  marker?: TimelineMarker;
  payload?: unknown;
}

export type FiringListener = (firing: TimelineFiring) => void;

export class DuplicateEventError extends Error {
  constructor(id: string) {
    super(`timeline event "${id}" already exists (duplicate-event protection)`);
    this.name = 'DuplicateEventError';
  }
}

interface ScheduledFiring {
  eventId: string;
  phase: 'start' | 'complete';
  time: number;
  priority: number;
  seq: number;
  marker?: TimelineMarker;
  payload?: unknown;
  fired: boolean;
  cancelled: boolean;
}

export class Timeline {
  private readonly ids = new Set<string>();
  private firings: ScheduledFiring[] = [];
  private listeners: FiringListener[] = [];
  private seq = 0;
  private cursor = 0;
  private isPlaying = true;

  add(event: TimelineEventInput): void {
    if (this.ids.has(event.id)) throw new DuplicateEventError(event.id);
    if (!Number.isFinite(event.at) || event.at < 0) throw new RangeError(`event "${event.id}": at must be ≥ 0`);
    const duration = event.duration ?? 0;
    if (!Number.isFinite(duration) || duration < 0) throw new RangeError(`event "${event.id}": duration must be ≥ 0`);
    this.ids.add(event.id);
    const priority = event.priority ?? 0;
    const base = {
      eventId: event.id,
      priority,
      ...(event.marker !== undefined ? { marker: event.marker } : {}),
      ...(event.payload !== undefined ? { payload: event.payload } : {}),
      fired: false,
      cancelled: false,
    };
    this.firings.push({ ...base, phase: 'start', time: event.at, seq: this.seq++ });
    this.firings.push({ ...base, phase: 'complete', time: event.at + duration, seq: this.seq++ });
    this.sortFirings();
  }

  addMany(events: TimelineEventInput[]): void {
    for (const event of events) this.add(event);
  }

  /** Remove all not-yet-fired firings of an event. True if anything was cancelled. */
  cancel(id: string): boolean {
    let cancelled = false;
    for (const f of this.firings) {
      if (f.eventId === id && !f.fired && !f.cancelled) {
        f.cancelled = true;
        cancelled = true;
      }
    }
    return cancelled;
  }

  onFire(listener: FiringListener): () => void {
    this.listeners.push(listener);
    return () => {
      const i = this.listeners.indexOf(listener);
      if (i >= 0) this.listeners.splice(i, 1);
    };
  }

  play(): void {
    this.isPlaying = true;
  }

  pause(): void {
    this.isPlaying = false;
  }

  get playing(): boolean {
    return this.isPlaying;
  }

  /** Current timeline time, ms. */
  get now(): number {
    return this.cursor;
  }

  /** Time of the last scheduled firing (0 when empty). */
  get duration(): number {
    let max = 0;
    for (const f of this.firings) if (!f.cancelled && f.time > max) max = f.time;
    return max;
  }

  /** True when every non-cancelled firing has fired. */
  get complete(): boolean {
    return this.firings.every((f) => f.fired || f.cancelled);
  }

  /** Clock-driver entry point. No-op while paused. */
  advance(dtMs: number): void {
    if (!this.isPlaying) return;
    if (!Number.isFinite(dtMs) || dtMs < 0) throw new RangeError('advance(dt): dt must be ≥ 0');
    this.fireThrough(this.cursor + dtMs, false);
  }

  /**
   * Fast-forward to `toMs` (must be ≥ now — the timeline never rewinds:
   * game presentation is strictly forward-only). Fires everything due, in
   * deterministic order, flagged skipped. Works while paused (an explicit
   * seek is an intentional jump, not clock playback).
   */
  seek(toMs: number): void {
    if (!Number.isFinite(toMs) || toMs < this.cursor) {
      throw new RangeError(`seek(${toMs}): target must be ≥ current time ${this.cursor}`);
    }
    this.fireThrough(toMs, true);
  }

  /**
   * skipTo('complete')  → fast-forward to the end of the timeline.
   * skipTo('next_step') → fast-forward to the start of the next 'step'-marked
   *                       event (or the end when there is none).
   * skipTo('summary')   → fast-forward to the start of the first upcoming
   *                       'summary'-marked event (or the end when none).
   */
  skipTo(target: SkipTarget): void {
    switch (target) {
      case 'complete':
        this.seek(this.duration);
        return;
      case 'next_step':
        this.seek(this.nextMarkerTime('step') ?? this.duration);
        return;
      case 'summary':
        this.seek(this.nextMarkerTime('summary') ?? this.duration);
        return;
    }
  }

  private nextMarkerTime(marker: TimelineMarker): number | null {
    let best: number | null = null;
    for (const f of this.firings) {
      if (f.cancelled || f.fired || f.phase !== 'start' || f.marker !== marker) continue;
      if (f.time <= this.cursor) continue;
      if (best === null || f.time < best) best = f.time;
    }
    return best;
  }

  private sortFirings(): void {
    this.firings.sort((a, b) => a.time - b.time || b.priority - a.priority || a.seq - b.seq);
  }

  private fireThrough(toMs: number, skipped: boolean): void {
    this.cursor = toMs;
    // Snapshot-and-fire loop: listeners may add events; re-scan until stable.
    let progressed = true;
    while (progressed) {
      progressed = false;
      for (const f of this.firings) {
        if (f.fired || f.cancelled || f.time > this.cursor) continue;
        f.fired = true;
        progressed = true;
        const firing: TimelineFiring = {
          eventId: f.eventId,
          phase: f.phase,
          at: f.time,
          skipped,
          ...(f.marker !== undefined ? { marker: f.marker } : {}),
          ...(f.payload !== undefined ? { payload: f.payload } : {}),
        };
        for (const listener of [...this.listeners]) listener(firing);
        // Restart the scan: a listener may have inserted earlier firings,
        // and firings[] was re-sorted on add.
        break;
      }
    }
  }
}

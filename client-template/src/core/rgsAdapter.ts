/**
 * Production RGS (Remote Game Server) adapter — INTERFACE ONLY.
 *
 * This template ships no fake server. The concrete adapter is written during
 * operator integration against the real RGS protocol. Until then,
 * `NotImplementedRgsAdapter` throws loudly so nobody mistakes the dev round
 * provider for a production path.
 *
 * ── Integration contract ──────────────────────────────────────────────────
 *
 * 1. Server-authoritative (CONVENTIONS §9.1): every outcome value comes from
 *    the RGS. The client never generates, predicts, or alters results.
 *
 * 2. Idempotency: every wager request carries a client-generated
 *    `idempotencyKey` (`RequestRoundOptions.idempotencyKey`). Retrying after a
 *    network failure MUST reuse the same key; the RGS must treat duplicate
 *    keys as the SAME wager and return the already-committed manifest instead
 *    of debiting again. inputGuard.ts guarantees the client never issues two
 *    concurrent keys for one round.
 *
 * 3. roundId: assigned by the RGS (`rnd_…` per CONVENTIONS §10). It is the
 *    recovery/history/audit handle. The client treats it as opaque.
 *
 * 4. Signature verification: manifests carry a detached signature over the
 *    manifest bytes minus the `signature` field (canonical JSON: UTF-8,
 *    sorted keys, no insignificant whitespace). Implementations receive a
 *    `verifySignature` hook at construction; a manifest failing verification
 *    MUST be rejected before presentation and surfaced as a game error.
 *
 * 5. Recovery: `resume()` asks the RGS for an interrupted committed round.
 *    The RGS returns the ORIGINAL manifest plus a `resumePointer` (stepId).
 *    The client seeks presentation there (recovery.ts) — it never re-requests
 *    the outcome and never re-settles.
 *
 * 6. Validation: even trusted manifests pass `assertValidManifest`
 *    (roundProvider.ts) before presentation; refuse inconsistent rounds.
 */

import type { OutcomeManifest } from './types.js';
import type { RequestRoundOptions, ResumeResult, RoundProvider } from './roundProvider.js';

export interface RgsSessionInfo {
  sessionId: string;
  playerCurrency: string;
  balanceMinor: number;
  /** Jurisdiction id the server resolved for this session. */
  jurisdictionId: string;
}

export interface RgsConnectOptions {
  /** Operator launch token (opaque, from the game URL / lobby handshake). */
  launchToken: string;
  gameVersion: string;
  mathVersion: string;
}

export interface RoundHistoryQuery {
  limit: number;
  beforeRoundId?: string;
}

export interface RoundHistoryEntry {
  roundId: string;
  betMinor: number;
  totalWinMinor: number;
  completedAt: string; // ISO-8601, server clock
}

/**
 * Verifies `signature` over the canonical manifest bytes (manifest minus the
 * signature field). Return false to reject the round.
 */
export type SignatureVerifier = (canonicalManifestBytes: Uint8Array, signature: string) => Promise<boolean>;

/** Production round source. Extends the shared RoundProvider contract. */
export interface RgsAdapter extends RoundProvider {
  connect(opts: RgsConnectOptions): Promise<RgsSessionInfo>;
  disconnect(): Promise<void>;
  /** Committed-round replay data for the game-history UI. */
  history(query: RoundHistoryQuery): Promise<RoundHistoryEntry[]>;
}

export class NotImplementedError extends Error {
  constructor(member: string) {
    super(
      `RgsAdapter.${member} is not implemented in the client template. ` +
        'Implement it against the operator RGS during integration. ' +
        'For local development use DevRoundProvider (dev/test only).',
    );
    this.name = 'NotImplementedError';
  }
}

/**
 * Compile-checked stub. Every method throws — there is intentionally no fake
 * server behaviour here.
 */
export class NotImplementedRgsAdapter implements RgsAdapter {
  constructor(private readonly verifySignature?: SignatureVerifier) {
    void this.verifySignature; // wired by the real implementation
  }

  connect(_opts: RgsConnectOptions): Promise<RgsSessionInfo> {
    return Promise.reject(new NotImplementedError('connect'));
  }

  disconnect(): Promise<void> {
    return Promise.reject(new NotImplementedError('disconnect'));
  }

  requestRound(_betMinor: number, _opts?: RequestRoundOptions): Promise<OutcomeManifest> {
    return Promise.reject(new NotImplementedError('requestRound'));
  }

  resume(): Promise<ResumeResult | null> {
    return Promise.reject(new NotImplementedError('resume'));
  }

  history(_query: RoundHistoryQuery): Promise<RoundHistoryEntry[]> {
    return Promise.reject(new NotImplementedError('history'));
  }
}

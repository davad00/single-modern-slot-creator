# slot-client-template

Deterministic TypeScript client core for the **single-modern-slot-creator**
skill (see `../CONVENTIONS.md` — the binding contract). Bun + strict TS.
The presentation layer (PixiJS v8) is layered on top of the seams described
below; **nothing in `src/core/` touches the DOM, PixiJS, timers, or wall
clocks**, so the whole core is unit-testable with `bun test`.

```
bun install
bun run typecheck   # tsc --noEmit
bun test            # all core behaviour incl. mode-equivalence proof
bun run build       # bundles src/index.ts → dist/ (browser target)
bun run dev         # runs scripts/serve.ts (dev server for the PixiJS layer)
```

Wire-format conformance: `scripts/export-wire-manifests.ts <dir>` exports 20
deterministic manifests in the exact shape of
`../schemas/outcome-manifest.schema.json` (via `toWireManifest`), for external
JSON-Schema validation, e.g.
`uv run --with jsonschema python -c "..."` — see `tests/wireManifest.test.ts`
for the bun-side structural mirror of the same constraints.

## Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│ PRESENTATION (added later: PixiJS v8 renderer, clock, DOM input)   │
│   • drives Timeline via a clock adapter: timeline.advance(dtMs)    │
│   • renders reels/steps from SpinSchedule + TimelineFiring events  │
│   • feeds raw input into InputGuard, renders AutoplayState HUD     │
└──────────────────────────────┬─────────────────────────────────────┘
                               │ pure interfaces (this package)
┌──────────────────────────────┴─────────────────────────────────────┐
│ CORE (src/core — deterministic, zero DOM)                          │
│                                                                    │
│  RoundProvider ◄── DevRoundProvider (DEV ONLY, seeded xoshiro128**)│
│       ▲        ◄── RgsAdapter interface (production, stub only)   │
│       │ OutcomeManifest (server-authoritative, validated)          │
│       ▼                                                            │
│  SlotStateMachine (23 canonical states, guards, typed events)      │
│  spinTiming: (manifest, mode, policy) → SpinSchedule   [pure]      │
│  Timeline: deterministic scheduler (play/pause/seek/skipTo)        │
│  recovery: (manifest, resumePointer) → RecoveryPlan    [pure]      │
│  AutoplayController · InputGuard · money · configLoader            │
└────────────────────────────────────────────────────────────────────┘
```

### The one rule everything enforces

**The client is a pure renderer of the committed `OutcomeManifest`.**
Normal / quick / turbo / skip / autoplay / recovery change *presentation
timing only* — never wins, balances, scatter counts, or settlement.
`tests/equivalence.test.ts` proves it: the same manifest through every mode
and through `skipTo('complete')` and through recovery yields the identical
final win, balance, and terminal state.

## Seams for the presentation layer

| Seam | Contract |
|------|----------|
| **Clock** | Core never reads time. Call `timeline.advance(dtMs)` from your ticker (e.g. Pixi's). `Timeline` fires deterministic `start`/`complete` firings in (time, priority, insertion) order. |
| **Schedules** | `buildSpinSchedule(manifest, mode, policy)` → reel + step timing. `scheduleToTimelineEvents(schedule)` → ready-made timeline events with `'step'`/`'summary'` markers for `skipTo('next_step' | 'summary')`. |
| **State** | Subscribe with `machine.on('transition', …)`, `machine.onEnter(state, …)`. `presentationStatePath(manifest)` gives the legal state walk for a round — it is a pure function of the manifest, so every mode walks the same path. |
| **Input** | Route pointer/touch/space/enter into `InputGuard.handleInput(kind, ctx)` and act on the returned action (`spin` / `stop_reels` / `skip` / `stop_autoplay` / `ignored`). Wager placement must go through `acquireRequestSlot()` (idempotency key + duplicate-request protection). |
| **HUD** | `AutoplayController.getState()`, `formatMinor(...)` (display only — settlement math stays integer). |
| **Recovery** | On boot: `provider.resume()` → `buildRecoveryPlan(manifest, pointer)` → seek presentation to `plan.entryState` / `plan.resumeStepIndex`. Never re-request, never re-settle. |
| **Config** | `loadConfigBundle(readJson)` — inject `fetch`/`Bun.file`; core stays IO-free. |

## DEV-ONLY warnings (read before shipping anything)

- **`DevRoundProvider` is a development/test fixture, not a game server.**
  It fabricates outcomes from a seeded RNG, throws when
  `NODE_ENV === 'production'`, and is exported with `isDevOnly: true`.
  Production outcomes come ONLY from an `RgsAdapter` implementation
  (`src/core/rgsAdapter.ts` documents the integration contract:
  idempotency keys, server-assigned `roundId`, signature verification hook).
- **`Xoshiro128StarStar` is dev/sim RNG** (CONVENTIONS §5) — never used for
  real-money outcomes.
- The dev provider's `forceScatterCount` / `devMarkInterrupted` helpers exist
  so tests can reach tier and recovery paths deterministically; they are not
  part of the production `RoundProvider` contract.
- Unknown jurisdiction ⇒ `MOST_RESTRICTIVE_POLICY` (no autoplay, no
  quick/turbo, no slam stop, no bonus buy, 3 s minimum round duration).

## Money rules (CONVENTIONS §5)

Integer minor units everywhere (`*Minor` fields). Pays are integer hundredths
of a bet (`payX100`). Canonical rule, identical to the Python simulator:
`winMinor = floor(betMinor * payX100 * multiplier / 100)` — multiplier applied
**before** the single floor division. `src/core/money.ts` is the only place
this arithmetic lives.

## Layout

```
src/index.ts            public surface (import from here)
src/core/money.ts       minor-unit helpers, floor rule, display formatting
src/core/types.ts       OutcomeManifest / GameConfig / JurisdictionPolicy / …
src/core/rng.ts         xoshiro128** + splitmix32 seeding (DEV ONLY)
src/core/stateMachine.ts 23 canonical states, transition table, guards, events
src/core/roundProvider.ts RoundProvider contract + shared manifest validation
src/core/devRoundProvider.ts seeded dev outcome generator (DEV ONLY)
src/core/rgsAdapter.ts  production adapter interface + NotImplemented stub
src/core/recovery.ts    committed-manifest replay planning (pure)
src/core/autoplay.ts    finite autoplay + full stop-condition set
src/core/inputGuard.ts  rapid-input protection, skip-vs-stop disambiguation
src/core/spinTiming.ts  (manifest, mode, policy) → presentation schedule (pure)
src/core/timeline.ts    deterministic timeline engine (no rAF — clock injected)
src/core/configLoader.ts structural config validation, IO injected
src/core/wireManifest.ts internal manifest → outcome-manifest.schema.json shape
src/presentation/       PixiJS v8 layer (app, reelView, hud, motionPlayer,
                        audioManager, winPresentation, clock adapter)
scripts/serve.ts        bun dev server (bun run dev)
scripts/export-wire-manifests.ts exports 20 wire manifests for schema validation
tests/                  bun test suite incl. the mode-equivalence proof
```

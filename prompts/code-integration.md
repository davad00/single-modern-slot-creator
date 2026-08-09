# Step 11+12 — Code integration, state machine, spin modes & autoplay

## Role

`agents/mathematician.md` + `agents/skill-orchestrator.md`. You turn the approved
math (steps 5–6) and the UI/motion/audio specs (steps 7–8) into a buildable,
tested client. The one rule everything enforces: **the client is a pure renderer
of the committed `OutcomeManifest`** (CONVENTIONS §7, §9.1–9.2). Nothing you add
may determine, predict, or alter a result.

## Gate

**G11** (code) + **G12** (modes). SKILL.md step 12 points at **§7** of this file.

## Objective

Specialize `client-template/` into `games/<slug>/client/`, wire every config,
implement the game-specific presentation hooks, instantiate the 23-state machine,
configure the dev round provider, document the production RGS contract, and prove
mode equivalence + autoplay + rapid-input protection + recovery with green tests.

## Read first

1. `CONVENTIONS.md` §4.4 (state set), §5 (money/RNG), §7 (outcome manifest), §8 (tooling), §9 (design rules)
2. `client-template/README.md` — architecture, seams, DEV-ONLY warnings
3. `research/07-rgs-architecture.md` — §Design implications (lifecycle, idempotency, signatures, recovery)
4. `schemas/state-machine.schema.json`, `schemas/outcome-manifest.schema.json`, `schemas/jurisdiction-policy.schema.json`
5. Step outputs: all `config/*.json` from steps 5–10; motion spec (step 8); UI spec (step 7)

## Procedure

### 1. Copy and baseline the client

- Copy `client-template/` → `games/<slug>/client/` excluding `node_modules/` and
  `dist/`; keep `bun.lock`. Then, in `games/<slug>/client/`:
  `bun install && bun run typecheck && bun test` — the template suite MUST be
  green before any change. Commit-quality checkpoint; if red, fix the copy, not
  the tests.
- Set the game name/slug/version in `package.json` and the config bundle.

### 2. Wire all configs through `configLoader`

- Place/refresh every `config/*.json` where the client loads it (see
  `src/core/configLoader.ts` — IO is injected via `readJson`; serve `config/`
  through `scripts/serve.ts` in dev and bundle-copy for build).
- Extend `loadConfigBundle` coverage so the client consumes: game-config,
  symbols, paytable, reel-sets, scatter-tiers, features, bonus-buys,
  spin-presentation, autoplay, jurisdiction-policies, state-machine,
  animation-events, audio-events, asset-manifest, device-profiles.
- Loader rule: structural validation with actionable `path: message` issues;
  reject on unknown tier ids, non-integer minor units, or missing tier
  materiality (the template already enforces the scatter-tier checks — keep them).

### 3. Game-specific presentation hooks (never touch core determinism)

- All game specifics live in `src/presentation/`: symbol textures (from
  `config/asset-manifest.json`), reel count/rows (from game-config), win-line /
  ways / cluster highlighting, per-tier feature environments (base,
  `feature`, `super_feature`, `ultimate_feature` — distinct scenes per G6),
  win-tier presentations mapped from `spin-presentation.json` thresholds.
- FORBIDDEN in this step: edits to `src/core/money.ts`, `spinTiming.ts`,
  `timeline.ts`, `stateMachine.ts` transition semantics, or anything that reads
  wall clocks / `Math.random()` on an outcome path. Cosmetic jitter must come
  from a presentation-only RNG that never feeds settlement.
- Every animation hook keys off `animation-events.json` event ids
  (`anim.<context>.<name>`) fired by the state machine's `presentationMap`.

### 4. `config/state-machine.json` instance

- Author the instance with EXACTLY the 23 canonical states (CONVENTIONS §4.4 —
  no renames, additions, or removals), all legal transitions with guard ids,
  guards[], actions[], recoveryRules, terminalStates, invalidTransitionPolicy,
  `presentationMap` (state → animation event ids) and `audioMap` (state →
  `music.*`/`sfx.*` ids covering base + all three tiers).
- Mark server-owned round states vs client presentation states exactly as the
  schema requires; UI overlays (menus, paytable) are NOT states here.
- Validate:

  ```bash
  uv run --with jsonschema python -c "import json,jsonschema; jsonschema.validate(json.load(open('config/state-machine.json')), json.load(open(r'<skill>/schemas/state-machine.schema.json'))); print('state-machine.json OK')"
  ```

- `src/core/stateMachine.ts` must load/assert this instance; `bun test`'s
  state-machine suite must exercise every transition and reject illegal ones.

### 5. Dev round provider config (DEV/TEST ONLY)

- Configure `DevRoundProvider` with a recorded xoshiro128** seed; it stays
  `isDevOnly: true`, throws in production builds, and its `forceScatterCount` /
  `devMarkInterrupted` helpers are for tests only. Log the seed in round headers
  (`rngInfo`). The dev provider must emit manifests that validate against
  `schemas/outcome-manifest.schema.json` — prove it:

  ```bash
  bun run scripts/export-wire-manifests.ts .build/wire-manifests
  uv run --with jsonschema python -c "import json,glob,jsonschema; s=json.load(open(r'<skill>/schemas/outcome-manifest.schema.json')); files=glob.glob('.build/wire-manifests/*.json'); [jsonschema.validate(json.load(open(f)),s) for f in files]; print(f'{len(files)} manifests OK')"
  ```

### 6. Production RGS adapter — interface + documented contract only

Do NOT implement a server. Keep `src/core/rgsAdapter.ts` as a compiling
interface + NotImplemented stub, and document the integration contract
(per research/07) in `games/<slug>/client/README.md`:

- Lifecycle: `authenticate(sessionId) → {balanceMinor, config, activeRound?}`;
  `play({betMinor, mode, roundSeq}) → {round, balanceMinor}`;
  `event({roundId, resumePointer})` checkpoints; `endRound(roundId)`.
  `authenticate` returning an active round FORCES the `recovering` state before
  any new bet.
- IDs: server-issued `roundId` (`^rnd_[A-Za-z0-9_-]{6,}$`); client UUIDv4
  `transactionId` per wallet-affecting call (idempotency key); duplicates must be
  answered with the original result, never re-applied, never silently rejected.
- Signature hook: verify a detached signature (JWS; HMAC placeholder in dev)
  over manifest-bytes-minus-`signature` before commit; refuse unsigned manifests
  outside dev mode. Money fields stay integer minor units end-to-end; document
  the unit scale.
- Recovery endpoint expectation: committed manifest + `resumePointer` are
  re-fetchable for the active round; the server never re-randomizes.

### 7. Spin speed, skip & autoplay (step 12)

- `config/spin-presentation.json`: presentation parameters for `normal`, `quick`,
  `turbo` (reel spin durations, stagger, anticipation hold, win-countup rate,
  cascade fast-forward, feature-transition skip-to points) consumed by
  `spinTiming.ts` `SPIN_MODE_PROFILES`; plus win-tier thresholds
  (small/medium/big/mega/epic/max per CONVENTIONS §4.3). LDW (win < stake) is
  never presented above `small`.
- Jurisdiction gating via `config/jurisdiction-policies.json`
  (validate against `schemas/jurisdiction-policy.schema.json`, same one-liner
  pattern as §4): `quickSpinAllowed`, `turboSpinAllowed`, `slamStopAllowed`,
  `autoplayAllowed`/`autoplayMaxRounds`, `bonusBuyAllowed`, `minRoundDurationMs`,
  `rtpDisplayRequired`, `realityCheckIntervalMs`. `resolveSpinMode` must downgrade
  disallowed modes; unknown jurisdiction ⇒ `MOST_RESTRICTIVE_POLICY`.
- Skip semantics: reel stop (slam), animation skip, cascade fast-forward,
  win-count-up skip, feature-transition skip — all implemented as
  `timeline.skipTo(...)` over the schedule; none may touch manifest values.
- Autoplay (`src/core/autoplay.ts` + `config/autoplay.json`) must implement the
  FULL stop-condition set: finite round count; immediate stop; clear active-state
  display; stop on `feature`; stop on `super_feature`; stop on
  `ultimate_feature`; stop on configurable win threshold; configurable loss
  threshold; configurable profit threshold; balance below threshold;
  insufficient balance; network error; game error; responsible-gaming
  interruption; reality-check presentation; bet change; maximum win. No infinite
  autoplay default, no unbounded queue of pending wagers, no overlapping rounds.
- Rapid-input protection (`inputGuard.ts`) wired for: repeated pointer clicks,
  repeated touch, repeated spacebar, repeated Enter, manual input during
  autoplay, stop-during-presentation, skip-during-feature-transition, delayed
  round responses, reconnection, orientation change, browser backgrounding,
  device sleep. Wagers only via `acquireRequestSlot()` (duplicate-request lock).

### 8. Recovery

On boot/reconnect: `provider.resume()` → committed manifest + `resumePointer` →
`buildRecoveryPlan(...)` → seek presentation instantly to the resume step, then
continue to settlement. Never re-request, never re-randomize, never re-debit.
Add a game-specific test: interrupt mid-`feature_active` (via
`devMarkInterrupted`), recover, assert identical final win/balance.

### 9. Verify (all in `games/<slug>/client/`)

```bash
bun install          # exit 0
bun run typecheck    # exit 0, no errors
bun test             # ALL pass — includes equivalence, autoplay, inputGuard, recovery suites
bun run build        # dist/ produced, exit 0
```

The equivalence test (`tests/equivalence.test.ts`, extended with THIS game's
configs and at least one manifest per tier + one max-win manifest) is the G12
proof: same manifest through normal / quick / turbo / `skipTo('complete')` /
recovered ⇒ identical final win, balance, and terminal state.

## Outputs

`games/<slug>/client/` (buildable, all tests green); `config/state-machine.json`,
`config/spin-presentation.json`, `config/autoplay.json`,
`config/jurisdiction-policies.json` (schema-/loader-valid); RGS contract section
in the client README; exported wire manifests validated against the schema.

## Gate checklist

**G11:**
- [ ] `bun install && bun run typecheck && bun test` all green in `games/<slug>/client/`.
- [ ] `bun run build` succeeds.
- [ ] Dev round provider deterministic (fixed seed → identical manifests, proven
      by test) and dev-only (production guard test passes).
- [ ] RGS adapter interface compiles; no HTTP implementation shipped; contract
      documented in README.
- [ ] `state-machine.json` validates (§4 one-liner prints OK); exactly 23 states.
- [ ] Wire manifests validate against `outcome-manifest.schema.json` (§5 block).
- [ ] Recovery test replays a committed manifest to the correct step.

**G12:**
- [ ] Equivalence test exists, covers normal/quick/turbo/skipped/recovered on
      identical manifests (incl. each tier + max win), and passes.
- [ ] Every §7 autoplay stop condition has an assertion in `bun test` output.
- [ ] Rapid-input tests pass for every §7 input class.
- [ ] Jurisdiction gating test: disallowed mode downgrades; UNKNOWN ⇒ most
      restrictive; `autoplayMaxRounds` finite.

## Failure handling

- Template tests broken after copy → diff against `client-template/`, restore.
- Typecheck/test failures → fix the game code; NEVER weaken a core test,
  NEVER special-case the equivalence test.
- Equivalence mismatch means a presentation path leaked into settlement — find
  and remove the leak; do not clamp results.
- Max 3 attempts per failing check, then record FAILED-GATE with the failing
  command output in `docs/validation-report.md` and stop. Step 13 still runs to
  document the failure honestly.

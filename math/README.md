# slot_math — deterministic slot mathematics template

The math/simulation engine every generated slot specializes. uv-managed; **never** use
bare pip/python.

```
uv sync                      # install (creates .venv + uv.lock)
uv run pytest -q             # full test suite
uv run python -m slot_math.simulate --config tests/fixtures/default-config \
    --rounds 50000 --seed 42 --workers 1 --bet 100 --out reports/smoke-report.json
```

## Modules

| module | purpose |
|---|---|
| `money.py` | integer minor-unit rules: `win = bet * payX100 // 100` (floor) |
| `config.py` | config-bundle loading, validation, canonical `sha256:` config hash |
| `rng.py` | numpy PCG64 seeded RNG + SeedSequence worker spawning (dev/sim ONLY) |
| `reels.py` | uniform strip stops, weighted virtual-reel tables |
| `evaluator.py` | line pays, ways pays, wild substitution, scatter counting |
| `cascades.py` | tumble removal/refill with cap + multiplier progression |
| `features.py` | 3/4/5+ scatter tiers, retrigger caps, max-win termination |
| `engine.py` | `play_round()` → outcome-manifest-shaped dict (CONVENTIONS §7) |
| `simulate.py` | Monte Carlo CLI with full reproducibility provenance |
| `par_sheet.py` | PAR-sheet dict + Markdown renderer |
| `enumerate_lines.py` | exact base-game RTP for line games (uniform stops) |

## Hard rules

- Settlement paths are integer-only; floats appear in statistics/reporting alone.
- `forced=` scenario forcing and this whole outcome generator are DEV/TEST-ONLY.
  Production outcomes come exclusively from the Remote Game Server.
- Tiers `feature` / `super_feature` / `ultimate_feature` must stay materially
  distinct (rounds, multiplier, reel set) — tests assert payout ordering.
- Every simulation report embeds gameVersion, mathVersion, configHash,
  simCodeVersion, lockfile hash, seed policy, seeds, rounds, workers, command.

## Fixture

`tests/fixtures/default-config/` is a minimal 5x3, 10-line game used by the test
suite. It is intentionally NOT tuned to a commercial RTP; the smoke test only
asserts a sane band and reproducibility. Real games get tuned per `prompts/math.md`.

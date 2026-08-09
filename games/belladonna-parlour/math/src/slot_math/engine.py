"""Round engine: one paid round -> outcome-manifest-like internal dict
(step/feature semantics per CONVENTIONS.md §7; the exact wire shape is
schemas/outcome-manifest.schema.json — this simulation shape additionally
carries stepWinMinor and keeps feature steps inline in steps[]).
Deterministic given (config, rng state, bet).

`forced` supports DEV/TEST scenario forcing only (e.g. a fixed scatter
count). It must never exist in a production path; simulators pass None.
"""

from __future__ import annotations

import numpy as np

from .cascades import cascade_multiplier, refill, remove_positions, winning_positions
from .evaluator import SCATTER, count_scatters, evaluate, scatter_win
from .features import play_feature
from .money import win_minor
from .reels import spin_stops, window_from_stops

SCHEMA_VERSION = "1.0.0"


def _force_scatters(config, grid: list[list[str]], n: int) -> list[list[str]]:
    """DEV ONLY: overwrite the top row of the first n reels with scatters and
    scrub extra scatters so the grid contains exactly n."""
    out = [list(col) for col in grid]
    filler = next(s["id"] for s in config.symbols if s["kind"] == "low")
    for c in range(len(out)):
        for r in range(len(out[c])):
            if out[c][r] == SCATTER:
                out[c][r] = filler
    for c in range(min(n, len(out))):
        out[c][0] = SCATTER
    remaining = n - len(out)
    # more scatters than reels: use additional rows
    r = 1
    while remaining > 0 and r < config.rows:
        for c in range(min(remaining, len(out))):
            out[c][r] = SCATTER
        remaining -= min(remaining, len(out))
        r += 1
    return out


def _reduce_step_wins(steps: list[dict], overshoot: int) -> None:
    """Distribute a max-win clamp backwards over steps so that
    totalWinMinor == sum(stepWinMinor) holds exactly."""
    for step in reversed(steps):
        if overshoot <= 0:
            break
        cut = min(step.get("stepWinMinor", 0), overshoot)
        step["stepWinMinor"] -= cut
        overshoot -= cut


def play_round(
    config,
    rng: np.random.Generator,
    bet_minor: int,
    round_id: str = "rnd_dev_0",
    forced: dict | None = None,
) -> dict:
    if config.evaluation == "scatter_pays":
        # Belladonna's Parlour archetype lives in its own module; same
        # manifest contract, same money rules (see scatter_round.py).
        from .scatter_round import play_round_scatter

        return play_round_scatter(config, rng, bet_minor, round_id=round_id, forced=forced)
    if bet_minor <= 0:
        raise ValueError("bet_minor must be a positive integer")
    max_win_minor = win_minor(bet_minor, config.max_win_x_bet * 100)

    strips = config.strips("base")
    stops = spin_stops(rng, strips)
    grid = window_from_stops(strips, stops, config.rows)
    if forced and "scatterCount" in forced:
        grid = _force_scatters(config, grid, int(forced["scatterCount"]))

    steps: list[dict] = []
    total = 0
    step_n = 0

    # --- initial result ---
    wins = evaluate(config, grid, bet_minor)
    sc, _ = count_scatters(grid)
    sc_win = scatter_win(config.scatter_pays, sc, bet_minor)
    base_win = sum(w["winMinor"] for w in wins) + sc_win
    total += base_win
    step_n += 1
    steps.append(
        {
            "stepId": f"step-{step_n}",
            "type": "initial_result",
            "grid": grid,
            "wins": wins,
            "scatterCount": sc,
            "multiplier100": 100,
            "stepWinMinor": base_win,
            "events": ["anim.reel.stop"],
        }
    )

    # --- cascades (initial-grid scatter counting: cascades never add tiers) ---
    cas = config.math_model.get("cascades", {})
    if cas.get("enabled", False):
        cap = int(cas.get("capPerSpin", 20))
        progression = cas.get("multiplierProgression", [])
        fill_offsets = [0] * config.columns
        current = grid
        current_wins = wins
        idx = 0
        while current_wins and idx < cap:
            holes = remove_positions(current, winning_positions(current_wins))
            current, fill_offsets = refill(holes, strips, stops, fill_offsets, config.rows)
            current_wins = evaluate(config, current, bet_minor)
            mult100 = cascade_multiplier(progression, idx)
            # Fold the cascade multiplier into each win with the single floor
            # rule (CONVENTIONS §5; identical to the TS client's winMinor).
            for w in current_wins:
                w["winMinor"] = win_minor(bet_minor, w["payX100"], mult100)
            step_win = sum(w["winMinor"] for w in current_wins)
            total += step_win
            idx += 1
            step_n += 1
            steps.append(
                {
                    "stepId": f"step-{step_n}",
                    "type": "cascade",
                    "grid": current,
                    "wins": current_wins,
                    "scatterCount": 0,
                    "multiplier100": mult100,
                    "stepWinMinor": step_win,
                    "events": ["anim.cascade.refill"],
                }
            )

    # --- feature tiers ---
    feature_block = {
        "triggered": False,
        "tier": None,
        "initialRounds": 0,
        "remainingRounds": 0,
        "steps": [],
        "retriggers": 0,
        "totalWinMinor": 0,
        "maxWinReached": False,
    }
    max_win_reached = total >= max_win_minor
    if max_win_reached:
        overshoot = total - max_win_minor
        total = max_win_minor
        _reduce_step_wins(steps, overshoot)
    tier = config.tier_for_scatters(sc)
    if tier and not max_win_reached:
        step_n += 1
        steps.append(
            {
                "stepId": f"step-{step_n}",
                "type": "feature_trigger",
                "grid": grid,
                "wins": [],
                "scatterCount": sc,
                "multiplier100": 100,
                "stepWinMinor": 0,
                "events": [f"anim.{tier}.enter"],
            }
        )
        result = play_feature(config, rng, tier, bet_minor, total, max_win_minor, step_n)
        steps.extend(result["steps"])
        step_n += len(result["steps"])
        total += result["totalWinMinor"]
        max_win_reached = result["maxWinReached"]
        feature_block = {
            "triggered": True,
            "tier": tier,
            "initialRounds": result["initialRounds"],
            "remainingRounds": 0,
            "steps": [s["stepId"] for s in result["steps"]],
            "retriggers": result["retriggers"],
            "totalWinMinor": result["totalWinMinor"],
            "maxWinReached": result["maxWinReached"],
        }

    # --- settlement ---
    step_n += 1
    steps.append(
        {
            "stepId": f"step-{step_n}",
            "type": "settlement",
            "grid": steps[-1]["grid"],
            "wins": [],
            "scatterCount": 0,
            "multiplier100": 100,
            "stepWinMinor": 0,
            "events": ["anim.win.countup"] if total > 0 else [],
        }
    )

    return {
        "schemaVersion": SCHEMA_VERSION,
        "roundId": round_id,
        "gameId": config.game_id,
        "gameVersion": config.game_version,
        "mathVersion": config.math_version,
        "mathProfileId": config.math_model.get("profileId", "rtp-default"),
        "configHash": config.config_hash,
        "currency": "EUR",
        "wagerMinor": bet_minor,
        "initialGrid": grid,
        "steps": steps,
        "feature": feature_block,
        "totalWinMinor": total,
        "maximumWinReached": max_win_reached,
        "roundComplete": True,
        "signature": "dev-unsigned",
    }

"""Scatter-tier feature engine: 3 scatters -> feature, 4 -> super_feature,
5+ -> ultimate_feature. Tiers are materially different via config (rounds,
starting multiplier, tier-specific reel set). Retriggers are capped and
max-win termination is enforced (CONVENTIONS.md §9)."""

from __future__ import annotations

import numpy as np

from .evaluator import count_scatters, evaluate
from .money import win_minor
from .reels import spin_window


def play_feature(
    config,
    rng: np.random.Generator,
    tier: str,
    bet_minor: int,
    win_so_far_minor: int,
    max_win_minor: int,
    step_offset: int,
) -> dict:
    """Play one full feature of the given tier.

    Returns {tier, initialRounds, retriggers, steps, totalWinMinor,
    maxWinReached}. Steps are outcome-manifest step dicts (feature_round /
    feature_retrigger / max_win_termination).
    """
    fcfg = config.features[tier]
    rounds_remaining = int(fcfg["rounds"])
    initial_rounds = rounds_remaining
    mult100 = int(fcfg.get("startingMult100", 100))
    strips = config.strips(fcfg.get("reelSet", tier))

    rt_cfg = config.scatter_tiers.get("retrigger", {})
    rt_allowed = bool(rt_cfg.get("allowed", False))
    rt_scatters = int(rt_cfg.get("scattersRequired", 3))
    rt_rounds = int(rt_cfg.get("roundsAwarded", 0))
    rt_cap = int(rt_cfg.get("capPerFeature", 0))

    steps: list[dict] = []
    total = 0
    retriggers = 0
    max_win_reached = False
    step_n = step_offset

    while rounds_remaining > 0:
        rounds_remaining -= 1
        grid = spin_window(rng, strips, config.rows)
        wins = evaluate(config, grid, bet_minor)
        # Fold the feature multiplier into each win with the single floor rule
        # (CONVENTIONS §5; identical to the TS client's winMinor).
        for w in wins:
            w["winMinor"] = win_minor(bet_minor, w["payX100"], mult100)
        round_win = sum(w["winMinor"] for w in wins)
        sc, _ = count_scatters(grid)

        events = [f"anim.{tier}.round"]
        if rt_allowed and retriggers < rt_cap and sc >= rt_scatters:
            retriggers += 1
            rounds_remaining += rt_rounds
            events.append("anim.feature.retrigger")

        total += round_win
        step_n += 1
        steps.append(
            {
                "stepId": f"step-{step_n}",
                "type": "feature_retrigger" if "anim.feature.retrigger" in events else "feature_round",
                "grid": grid,
                "wins": wins,
                "scatterCount": sc,
                "multiplier100": mult100,
                "stepWinMinor": round_win,
                "events": events,
            }
        )

        if win_so_far_minor + total >= max_win_minor:
            overshoot = win_so_far_minor + total - max_win_minor
            total -= overshoot  # clamp exactly to the cap
            steps[-1]["stepWinMinor"] = round_win - overshoot
            max_win_reached = True
            step_n += 1
            steps.append(
                {
                    "stepId": f"step-{step_n}",
                    "type": "max_win_termination",
                    "grid": grid,
                    "wins": [],
                    "scatterCount": 0,
                    "multiplier100": mult100,
                    "stepWinMinor": 0,
                    "events": ["anim.maxwin.reached"],
                }
            )
            break

    return {
        "tier": tier,
        "initialRounds": initial_rounds,
        "retriggers": retriggers,
        "steps": steps,
        "totalWinMinor": total,
        "maxWinReached": max_win_reached,
    }

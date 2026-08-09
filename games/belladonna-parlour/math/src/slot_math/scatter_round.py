"""Belladonna's Parlour round engine.

6x5 `scatter_pays` + `cascades` (cap 20/spin) + `summed_orb_multiplier`
(MULT "Essence Orb": integer value 2..100 drawn at land time; a tumble
sequence that wins is multiplied by the SUM of orb values on screen) +
persistent multiplier bank P in features (P0 = 1/2/3 by tier; winning spins
bank their orb sum into P, then wins x P) + `multiplier_doubler`
(FX1 "Prisming Vial", ultimate_feature only: P *= 2 on a winning spin,
after banking, max one doubling per spin) + tier hierarchy 3/4/5+ scatters.

Money rules (CONVENTIONS §5): per-win winMinor = bet * payX100 // 100 (the
only division anywhere); orb sums and the bank P are plain integers, so
sequence multiplication W' = W * O and W' = W * P is EXACT integer math with
zero precision loss — the client replicates it verbatim.

Hard caps (GDD A11): cascades <= 20/spin, P <= multiplierCap (512),
retriggers 3/4/5 by tier, round total clamps exactly at maxWinXBet via a
max_win_termination step. Scatter counting: initial-grid only (GDD §7).
In-feature seal (scatter) pays are flat — never multiplied by O or P.
"""

from __future__ import annotations

import numpy as np

from .evaluator import SCATTER, evaluate_scatter_pays, scatter_win
from .money import win_minor
from .reels import spin_stops

MULT = "MULT"
FX1 = "FX1"
SCHEMA_VERSION = "1.0.0"
TIER_EVENTS = {
    "feature": "anim.feature.enter",
    "super_feature": "anim.super_feature.enter",
    "ultimate_feature": "anim.ultimate_feature.enter",
}


# --------------------------------------------------------------------- cells
# A cell is (symbolId, orbValue|None). Orbs are never removed by cascades;
# they fall with gravity, so values travel with their cells.


def _orb_table(config, context: str) -> dict:
    tables = config.features.get("orbTables", {})
    return tables.get(context) or tables["base"]


def _draw_orb(rng: np.random.Generator, table: dict) -> int:
    vals = sorted(int(k) for k in table)
    w = np.array([float(table[str(v)]) for v in vals], dtype=np.float64)
    return int(vals[int(rng.choice(len(vals), p=w / w.sum()))])


def _cells_from_window(rng, strips, stops, rows, table):
    """Initial drop as value-carrying cells; orbs drawn column-major."""
    cols = []
    for c, (strip, stop) in enumerate(zip(strips, stops)):
        n = len(strip)
        col = []
        for r in range(rows):
            s = strip[(stop + r) % n]
            v = _draw_orb(rng, table) if s == MULT else None
            col.append((s, v))
        cols.append(col)
    return cols


def _symbol_grid(cells) -> list[list[str]]:
    return [[s for s, _ in col] for col in cells]


def _orb_list(cells) -> list[dict]:
    return [
        {"pos": [c, r], "value": v}
        for c, col in enumerate(cells)
        for r, (s, v) in enumerate(col)
        if s == MULT and v is not None
    ]


def _remove_and_refill(cells, removed, strips, stops, fill_offsets, rng, table, rows):
    """Gravity refill preserving orb values; new MULT cells get fresh values."""
    new_cells = []
    new_offsets = list(fill_offsets)
    drawn = []
    removed_set = {(c, r) for c, r in removed}
    for c, col in enumerate(cells):
        survivors = [cell for r, cell in enumerate(col) if (c, r) not in removed_set]
        need = rows - len(survivors)
        strip = strips[c]
        n = len(strip)
        incoming = []
        for _ in range(need):
            new_offsets[c] += 1
            s = strip[(stops[c] - new_offsets[c]) % n]
            v = _draw_orb(rng, table) if s == MULT else None
            incoming.append((s, v))
        new_cells.append(list(reversed(incoming)) + survivors)
    return new_cells, new_offsets


def _reduce_step_wins(steps: list[dict], overshoot: int) -> None:
    for step in reversed(steps):
        if overshoot <= 0:
            break
        cut = min(step.get("stepWinMinor", 0), overshoot)
        step["stepWinMinor"] -= cut
        overshoot -= cut


def _scrub_and_force_scatters(cells, n: int, config, rng):
    """DEV/buy-entry ONLY: force exactly n scatters (one per reel, middle row)."""
    rows = config.rows
    filler = ("L4", None)
    out = []
    for col in cells:
        out.append([filler if s == SCATTER else (s, v) for s, v in col])
    mid = rows // 2
    for c in range(min(n, len(out))):
        out[c][mid] = (SCATTER, None)
    return out


def _play_sequence(config, rng, strips, table, bet_minor, forced_sc=None):
    """One full drop + cascade sequence. Returns a dict:
    steps (raw, first typed later), payWinRaw, scatterCount, scatterPayMinor,
    orbSum, fx1Seen, cells(final)."""
    rows = config.rows
    cap = int(config.math_model.get("cascades", {}).get("capPerSpin", 20))
    stops = spin_stops(rng, strips)
    cells = _cells_from_window(rng, strips, stops, rows, table)
    if forced_sc is not None:
        cells = _scrub_and_force_scatters(cells, forced_sc, config, rng)

    grid = _symbol_grid(cells)
    sc_count = sum(1 for col in grid for s in col if s == SCATTER)
    sc_pay = scatter_win(config.scatter_pays, sc_count, bet_minor)

    steps = []
    pay_total = 0
    orb_sum = sum(o["value"] for o in _orb_list(cells))
    fx1_seen = any(s == FX1 for col in grid for s in col)
    fill_offsets = [0] * config.columns

    wins = evaluate_scatter_pays(grid, config.paytable, bet_minor)
    step_win = sum(w["winMinor"] for w in wins)
    pay_total += step_win
    steps.append(
        {
            "type": "initial_result",  # retyped by caller inside features
            "grid": grid,
            "wins": wins,
            "scatterCount": sc_count,
            "multiplier100": 100,
            "stepWinMinor": step_win + sc_pay,
            "events": ["anim.reel.stop"],
            "ext": {"orbGrid": _orb_list(cells)},
        }
    )

    idx = 0
    while wins and idx < cap:
        removed = sorted({(c, r) for w in wins for c, r in w["positions"]})
        cells, fill_offsets = _remove_and_refill(
            cells, removed, strips, stops, fill_offsets, rng, table, rows
        )
        grid = _symbol_grid(cells)
        orb_sum = sum(o["value"] for o in _orb_list(cells))  # orbs never removed
        fx1_seen = fx1_seen or any(s == FX1 for col in grid for s in col)
        wins = evaluate_scatter_pays(grid, config.paytable, bet_minor)
        step_win = sum(w["winMinor"] for w in wins)
        pay_total += step_win
        idx += 1
        steps.append(
            {
                "type": "cascade",
                "grid": grid,
                "wins": wins,
                "scatterCount": 0,
                "multiplier100": 100,
                "stepWinMinor": step_win,
                "events": ["anim.cascade.remove", "anim.cascade.refill"],
                "ext": {"orbGrid": _orb_list(cells), "cascadeIndex": idx},
            }
        )

    return {
        "steps": steps,
        "payWinRaw": pay_total,
        "scatterCount": sc_count,
        "scatterPayMinor": sc_pay,
        "orbSum": orb_sum,
        "fx1Seen": fx1_seen,
        "cells": cells,
    }


def play_round_scatter(
    config,
    rng: np.random.Generator,
    bet_minor: int,
    round_id: str = "rnd_dev_0",
    forced: dict | None = None,
) -> dict:
    if bet_minor <= 0:
        raise ValueError("bet_minor must be a positive integer")
    cap_minor = win_minor(bet_minor, config.max_win_x_bet * 100)
    pcap = int(config.features.get("multiplierCap", 512))
    rt = config.scatter_tiers.get("retrigger", {})
    rt_required = int(rt.get("scattersRequired", 3))
    rt_award = int(rt.get("roundsAwarded", 5))

    active_set = config.raw.get("gameConfig", {}).get("activeReelSet", "base")
    base_strips = config.strips(active_set)
    base_table = _orb_table(config, "base")

    forced_sc = None
    if forced and "scatterCount" in forced:
        forced_sc = int(forced["scatterCount"])

    steps: list[dict] = []
    total = 0
    step_n = 0

    def push(step):
        nonlocal step_n, total
        step_n += 1
        step["stepId"] = f"step-{step_n}"
        steps.append(step)
        total += step.get("stepWinMinor", 0)

    # ---------------- base sequence ----------------
    seq = _play_sequence(config, rng, base_strips, base_table, bet_minor, forced_sc)
    for s in seq["steps"]:
        push(s)
    initial_grid = seq["steps"][0]["grid"]
    sc_count = seq["scatterCount"]

    w, o = seq["payWinRaw"], seq["orbSum"]
    if w > 0 and o > 0:
        push(
            {
                "type": "cascade",
                "grid": _symbol_grid(seq["cells"]),
                "wins": [],
                "scatterCount": 0,
                "multiplier100": o * 100,
                "stepWinMinor": w * o - w,
                "events": ["anim.orb.apply"],
                "ext": {"multiplierApply": {"orbSum": o, "before": w, "after": w * o}},
            }
        )

    max_win_reached = False

    def clamp() -> bool:
        nonlocal total, max_win_reached
        if total >= cap_minor:
            overshoot = total - cap_minor
            total = cap_minor
            _reduce_step_wins(steps, overshoot)
            max_win_reached = True
            push(
                {
                    "type": "max_win_termination",
                    "grid": steps[-1]["grid"],
                    "wins": [],
                    "scatterCount": 0,
                    "multiplier100": 100,
                    "stepWinMinor": 0,
                    "events": ["anim.maxwin.reached"],
                    "ext": {},
                }
            )
            return True
        return False

    hit_cap = clamp()

    # ---------------- feature tiers ----------------
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
    tier = config.tier_for_scatters(sc_count)
    if tier and not hit_cap:
        fcfg = config.features[tier]
        rounds = int(fcfg["rounds"])
        p_bank = int(fcfg.get("startingBank", 1))
        rt_cap = int(fcfg.get("retriggerCap", 3))
        tier_strips = config.strips(fcfg.get("reelSet", tier))
        tier_table = _orb_table(config, tier)
        doubler = bool(fcfg.get("doubler", False))

        push(
            {
                "type": "feature_trigger",
                "grid": initial_grid,
                "wins": [],
                "scatterCount": sc_count,
                "multiplier100": 100,
                "stepWinMinor": 0,
                "events": [TIER_EVENTS[tier]],
                "ext": {"tier": tier, "multiplierBank": p_bank},
            }
        )
        f_first_id = len(steps)  # index of first feature step (after trigger)
        f_total = 0
        retrigs = 0
        spins_left = rounds

        while spins_left > 0 and not max_win_reached:
            spins_left -= 1
            fseq = _play_sequence(config, rng, tier_strips, tier_table, bet_minor)
            retrig = fseq["scatterCount"] >= rt_required and retrigs < rt_cap
            if retrig:
                retrigs += 1
                spins_left += rt_award

            fw, fo = fseq["payWinRaw"], fseq["orbSum"]
            prismed = False
            if fw > 0:
                if fo > 0:
                    p_bank = min(p_bank + fo, pcap)
                if doubler and fseq["fx1Seen"]:
                    p_bank = min(p_bank * 2, pcap)
                    prismed = True

            fseq["steps"][0]["type"] = "feature_retrigger" if retrig else "feature_round"
            if retrig:
                fseq["steps"][0]["events"].append("anim.feature.retrigger")
            for s in fseq["steps"]:
                push(s)
                f_total += s["stepWinMinor"]

            if fw > 0 and p_bank > 1:
                delta = fw * p_bank - fw
                events = ["anim.orb.collect", "anim.orb.apply"]
                if prismed:
                    events.insert(0, "anim.ultimate_feature.prisming")
                push(
                    {
                        "type": "cascade",
                        "grid": _symbol_grid(fseq["cells"]),
                        "wins": [],
                        "scatterCount": 0,
                        "multiplier100": p_bank * 100,
                        "stepWinMinor": delta,
                        "events": events,
                        "ext": {
                            "multiplierApply": {
                                "orbSum": fo,
                                "before": fw,
                                "after": fw * p_bank,
                            },
                            "multiplierBank": p_bank,
                            "prisming": prismed,
                        },
                    }
                )
                f_total += delta
            # serialize the bank after every spin on the spin's last step
            steps[-1].setdefault("ext", {})["multiplierBank"] = p_bank

            if clamp():
                # recompute feature total after backward clamp reduction
                f_total = sum(
                    s["stepWinMinor"] for s in steps[f_first_id:] if s["type"] != "max_win_termination"
                )
                break

        feature_block = {
            "triggered": True,
            "tier": tier,
            "initialRounds": rounds,
            "remainingRounds": 0,
            "steps": [s["stepId"] for s in steps[f_first_id:]],
            "retriggers": retrigs,
            "totalWinMinor": f_total,
            "maxWinReached": max_win_reached,
        }

    # ---------------- settlement ----------------
    push(
        {
            "type": "settlement",
            "grid": steps[-1]["grid"],
            "wins": [],
            "scatterCount": 0,
            "multiplier100": 100,
            "stepWinMinor": 0,
            "events": ["anim.win.countup"] if total > 0 else [],
            "ext": {},
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
        "initialGrid": initial_grid,
        "steps": steps,
        "feature": feature_block,
        "totalWinMinor": total,
        "maximumWinReached": max_win_reached,
        "roundComplete": True,
        "signature": "dev-unsigned",
    }

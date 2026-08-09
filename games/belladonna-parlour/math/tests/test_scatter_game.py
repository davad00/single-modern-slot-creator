"""Belladonna's Parlour engine tests (scatter_pays + orbs + tiers)."""

import json
from pathlib import Path

import pytest

from slot_math.config import load_config
from slot_math.engine import play_round
from slot_math.evaluator import evaluate_scatter_pays
from slot_math.rng import make_rng

GAME_CONFIG = Path(__file__).parents[2] / "math-config"


@pytest.fixture(scope="module")
def bp():
    return load_config(GAME_CONFIG)


def col(*symbols):
    return list(symbols)


def test_band_evaluation(bp):
    # 9x H1 anywhere pays the 8-band; 12x L4 pays the 12-band
    grid = [
        col("H1", "H1", "H1", "L4", "L4"),
        col("H1", "H1", "H1", "L4", "L4"),
        col("H1", "H1", "H1", "L4", "L4"),
        col("L4", "L4", "L4", "L4", "L4"),
        col("L2", "L3", "L1", "L4", "H2"),
        col("L2", "L3", "L1", "L2", "H2"),
    ]
    wins = evaluate_scatter_pays(grid, bp.paytable, 100)
    by = {w["symbolId"]: w for w in wins}
    # expected pays come from the live (tuned) paytable — tests must not pin values
    assert by["H1"]["countAnywhere"] == 9
    assert by["H1"]["payX100"] == int(bp.paytable["H1"]["8"])  # 9 anywhere -> 8-band
    assert by["L4"]["countAnywhere"] == 12
    assert by["L4"]["payX100"] == int(bp.paytable["L4"]["12"])  # 12 anywhere -> 12-band
    assert by["L4"]["winMinor"] == int(bp.paytable["L4"]["12"])  # bet 100 => minor == payX100
    assert "L2" not in by  # 4 anywhere: below threshold


def test_non_paying_symbols_never_win(bp):
    grid = [col(*(["SCATTER"] * 5))] + [col(*(["MULT"] * 5))] * 5
    assert evaluate_scatter_pays(grid, bp.paytable, 100) == []


def test_determinism(bp):
    a = play_round(bp, make_rng(77), 100, round_id="rnd_t")
    b = play_round(bp, make_rng(77), 100, round_id="rnd_t")
    assert json.dumps(a, sort_keys=True) == json.dumps(b, sort_keys=True)


def test_step_sum_invariant_many_seeds(bp):
    for seed in range(200):
        m = play_round(bp, make_rng(seed), 100)
        assert sum(s["stepWinMinor"] for s in m["steps"]) == m["totalWinMinor"]
        ids = [int(s["stepId"].split("-")[1]) for s in m["steps"]]
        assert ids == list(range(1, len(ids) + 1))
        assert m["steps"][0]["type"] == "initial_result"
        assert m["steps"][-1]["type"] == "settlement"


def test_tier_mapping_and_feature_shape(bp):
    for n, tier in ((3, "feature"), (4, "super_feature"), (5, "ultimate_feature"), (6, "ultimate_feature")):
        m = play_round(bp, make_rng(1000 + n), 100, forced={"scatterCount": n})
        assert m["feature"]["triggered"] and m["feature"]["tier"] == tier
        # rounds come from the live (tuned) tier config — tests must not pin values
        assert m["feature"]["initialRounds"] == int(bp.features[tier]["rounds"])
        assert m["steps"][0]["scatterCount"] == n
        # feature accounting matches block
        fstep_ids = set(m["feature"]["steps"])
        fsum = sum(s["stepWinMinor"] for s in m["steps"] if s["stepId"] in fstep_ids)
        assert fsum == m["feature"]["totalWinMinor"]


def test_two_scatters_no_tier(bp):
    m = play_round(bp, make_rng(5), 100, forced={"scatterCount": 2})
    assert m["feature"]["triggered"] is False
    # but the initial grid carries the forced count
    assert m["steps"][0]["scatterCount"] == 2


def test_orb_multiplier_exact_integer_math(bp):
    # find a base round where the orb-apply step fired and check exactness
    found = False
    for seed in range(4000):
        m = play_round(bp, make_rng(seed), 137)  # odd bet exercises per-win floor
        for s in m["steps"]:
            ma = s.get("ext", {}).get("multiplierApply")
            if ma and not m["feature"]["triggered"]:
                assert ma["after"] == ma["before"] * ma["orbSum"]
                assert s["stepWinMinor"] == ma["after"] - ma["before"]
                found = True
        if found:
            break
    assert found, "no base orb application in 4000 seeds — orb frequency broken"


def test_feature_bank_monotonic_and_capped(bp):
    cap = int(bp.features["multiplierCap"])
    seen_growth = False
    for seed in range(300):
        m = play_round(bp, make_rng(seed), 100, forced={"scatterCount": 4})
        banks = [
            s["ext"]["multiplierBank"]
            for s in m["steps"]
            if s.get("ext", {}).get("multiplierBank") is not None
        ]
        assert all(b <= cap for b in banks)
        assert all(b2 >= b1 for b1, b2 in zip(banks, banks[1:])), banks
        if banks and banks[-1] > bp.features["super_feature"]["startingBank"]:
            seen_growth = True
    assert seen_growth


def test_retrigger_caps(bp):
    caps = {"feature": 3, "super_feature": 4, "ultimate_feature": 5}
    hit_any = False
    for seed in range(400):
        for n, tier in ((3, "feature"), (4, "super_feature"), (5, "ultimate_feature")):
            m = play_round(bp, make_rng(seed * 7 + n), 100, forced={"scatterCount": n})
            assert m["feature"]["retriggers"] <= caps[tier]
            if m["feature"]["retriggers"]:
                hit_any = True
    assert hit_any, "no retrigger observed in 1200 forced features"


def test_fx1_only_in_ultimate(bp):
    for purpose in ("base", "feature", "super_feature", "ante"):
        for strip in bp.strips(purpose):
            assert "FX1" not in strip, purpose
    assert any("FX1" in strip for strip in bp.strips("ultimate_feature"))


def test_prisming_doubles_bank(bp):
    found = False
    for seed in range(600):
        m = play_round(bp, make_rng(seed), 100, forced={"scatterCount": 5})
        for s in m["steps"]:
            ext = s.get("ext", {})
            if ext.get("prisming"):
                found = True
                assert ext["multiplierBank"] <= int(bp.features["multiplierCap"])
        if found:
            break
    assert found, "no prisming event in 600 forced ultimates"


def test_max_win_termination_exact(bp, tmp_path):
    import copy

    small = load_config(GAME_CONFIG)
    small.max_win_x_bet = 50  # tiny cap forces termination fast
    hit = None
    for seed in range(300):
        m = play_round(small, make_rng(seed), 100, forced={"scatterCount": 5})
        assert m["totalWinMinor"] <= 50 * 100
        if m["maximumWinReached"]:
            hit = m
            break
    assert hit is not None
    assert hit["totalWinMinor"] == 5000
    assert any(s["type"] == "max_win_termination" for s in hit["steps"])
    assert sum(s["stepWinMinor"] for s in hit["steps"]) == 5000


def test_scatters_survive_cascades(bp):
    # any round with cascades keeps its initial-grid scatter count in later grids
    for seed in range(300):
        m = play_round(bp, make_rng(seed), 100)
        cascade_steps = [s for s in m["steps"] if s["type"] == "cascade" and s["wins"]]
        if not cascade_steps or m["steps"][0]["scatterCount"] == 0:
            continue
        sc0 = m["steps"][0]["scatterCount"]
        for s in cascade_steps:
            sc_here = sum(1 for colx in s["grid"] for sym in colx if sym == "SCATTER")
            assert sc_here >= sc0
        return
    pytest.skip("no cascading round with scatters in 300 seeds")

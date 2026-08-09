from hypothesis import given, settings
from hypothesis import strategies as st

from slot_math.engine import play_round
from slot_math.money import win_minor
from slot_math.rng import make_rng


@settings(max_examples=60, deadline=None)
@given(seed=st.integers(min_value=0, max_value=2**31 - 1), bet=st.sampled_from([40, 100, 250, 1000]))
def test_round_invariants(config, seed, bet):
    m = play_round(config, make_rng(seed), bet, round_id=f"rnd_p_{seed}")
    cap = win_minor(bet, config.max_win_x_bet * 100)

    assert m["totalWinMinor"] >= 0
    assert m["totalWinMinor"] <= cap
    assert m["maximumWinReached"] == (m["totalWinMinor"] == cap) or not m["maximumWinReached"]

    # exact accounting: settled total equals the sum of per-step settled wins
    assert sum(s["stepWinMinor"] for s in m["steps"]) == m["totalWinMinor"]

    # steps are strictly ordered step-1..step-n
    ids = [int(s["stepId"].split("-")[1]) for s in m["steps"]]
    assert ids == list(range(1, len(ids) + 1))

    # every step win is a non-negative integer
    for s in m["steps"]:
        assert isinstance(s["stepWinMinor"], int) and s["stepWinMinor"] >= 0
        for w in s["wins"]:
            assert w["winMinor"] >= 0 and isinstance(w["winMinor"], int)

    # feature accounting matches the block
    if m["feature"]["triggered"]:
        feature_steps = {sid for sid in m["feature"]["steps"]}
        fsum = sum(s["stepWinMinor"] for s in m["steps"] if s["stepId"] in feature_steps)
        assert fsum == m["feature"]["totalWinMinor"]
    assert m["roundComplete"] is True

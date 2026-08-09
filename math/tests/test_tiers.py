import statistics

from slot_math.engine import play_round
from slot_math.rng import make_rng


def test_scatter_tier_mapping(config):
    for n, tier in ((3, "feature"), (4, "super_feature"), (5, "ultimate_feature"), (6, "ultimate_feature")):
        m = play_round(config, make_rng(10 + n), 100, forced={"scatterCount": n})
        assert m["feature"]["triggered"] is True
        assert m["feature"]["tier"] == tier
        assert m["feature"]["initialRounds"] == config.features[tier]["rounds"]
        assert m["steps"][0]["scatterCount"] == n


def test_two_scatters_no_feature(config):
    m = play_round(config, make_rng(3), 100, forced={"scatterCount": 2})
    assert m["feature"]["triggered"] is False


def _mean_feature_win(config, scatters: int, n: int = 250) -> float:
    total = []
    for seed in range(n):
        m = play_round(config, make_rng(seed), 100, forced={"scatterCount": scatters})
        total.append(m["feature"]["totalWinMinor"])
    return statistics.mean(total)


def test_tiers_materially_ordered(config):
    f = _mean_feature_win(config, 3)
    s = _mean_feature_win(config, 4)
    u = _mean_feature_win(config, 5)
    # material ordering, not marginal: each tier at least 1.5x the previous
    assert s > f * 1.5, (f, s, u)
    assert u > s * 1.5, (f, s, u)


def test_retrigger_cap(config):
    cap = config.scatter_tiers["retrigger"]["capPerFeature"]
    saw_retrigger = False
    for seed in range(400):
        m = play_round(config, make_rng(seed), 100, forced={"scatterCount": 3})
        assert m["feature"]["retriggers"] <= cap
        if m["feature"]["retriggers"] > 0:
            saw_retrigger = True
    assert saw_retrigger, "fixture should produce at least one retrigger in 400 features"


def test_max_win_termination_in_feature(fresh_config):
    fresh_config.max_win_x_bet = 15  # tiny cap: scatter pay 10x + feature exceeds it
    hit = None
    for seed in range(200):
        m = play_round(fresh_config, make_rng(seed), 100, forced={"scatterCount": 4})
        assert m["totalWinMinor"] <= 1500
        if m["maximumWinReached"]:
            hit = m
            break
    assert hit is not None, "expected a max-win hit with a 15x cap"
    assert hit["totalWinMinor"] == 1500
    assert any(s["type"] == "max_win_termination" for s in hit["steps"])
    assert sum(s["stepWinMinor"] for s in hit["steps"]) == hit["totalWinMinor"]


def test_max_win_clamp_at_base(fresh_config):
    fresh_config.max_win_x_bet = 8  # below the 4-scatter pay of 10x
    m = play_round(fresh_config, make_rng(1), 100, forced={"scatterCount": 4})
    assert m["maximumWinReached"] is True
    assert m["totalWinMinor"] == 800
    assert m["feature"]["triggered"] is False  # round terminated at the cap
    assert sum(s["stepWinMinor"] for s in m["steps"]) == 800

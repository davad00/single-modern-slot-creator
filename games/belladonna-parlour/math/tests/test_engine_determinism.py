import json

from slot_math.engine import play_round
from slot_math.rng import make_rng


def test_same_seed_identical_manifest(config):
    a = play_round(config, make_rng(1234), 100, round_id="rnd_t_1")
    b = play_round(config, make_rng(1234), 100, round_id="rnd_t_1")
    assert json.dumps(a, sort_keys=True) == json.dumps(b, sort_keys=True)


def test_different_seed_differs(config):
    a = play_round(config, make_rng(1), 100)
    b = play_round(config, make_rng(2), 100)
    assert json.dumps(a["initialGrid"]) != json.dumps(b["initialGrid"])


def test_manifest_shape(config):
    m = play_round(config, make_rng(99), 100, round_id="rnd_t_2")
    for key in (
        "schemaVersion", "roundId", "gameId", "gameVersion", "mathVersion",
        "mathProfileId", "configHash", "currency", "wagerMinor", "initialGrid",
        "steps", "feature", "totalWinMinor", "maximumWinReached",
        "roundComplete", "signature",
    ):
        assert key in m, key
    assert m["configHash"].startswith("sha256:")
    assert m["roundId"] == "rnd_t_2"
    assert m["steps"][0]["type"] == "initial_result"
    assert m["steps"][-1]["type"] == "settlement"
    assert m["roundComplete"] is True


def test_sequential_rounds_share_rng_stream(config):
    rng = make_rng(5)
    a = play_round(config, rng, 100)
    b = play_round(config, rng, 100)
    assert json.dumps(a["initialGrid"]) != json.dumps(b["initialGrid"])

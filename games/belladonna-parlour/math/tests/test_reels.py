import numpy as np

from slot_math.reels import (
    sample_weighted,
    spin_stops,
    spin_window,
    symbol_probabilities,
    window_from_stops,
)
from slot_math.rng import make_rng, spawn_worker_seeds


def test_stop_determinism(config):
    strips = config.strips("base")
    a = [spin_stops(make_rng(42), strips) for _ in range(3)]
    assert a[0] == a[1] == a[2]
    assert spin_stops(make_rng(43), strips) != a[0]


def test_window_wraps(config):
    strips = config.strips("base")
    n = len(strips[0])
    grid = window_from_stops(strips, [n - 1] * len(strips), config.rows)
    assert grid[0][0] == strips[0][n - 1]
    assert grid[0][1] == strips[0][0]  # wrap-around
    assert len(grid) == config.columns
    assert all(len(col) == config.rows for col in grid)


def test_spin_window_shape(config):
    grid = spin_window(make_rng(1), config.strips("base"), config.rows)
    assert len(grid) == config.columns and all(len(c) == config.rows for c in grid)


def test_symbol_probabilities_sum_to_one(config):
    for strip in config.strips("base"):
        assert abs(sum(symbol_probabilities(strip).values()) - 1.0) < 1e-12


def test_weighted_sampling_distribution():
    rng = make_rng(7)
    table = {"A": 90, "B": 10}
    draws = [sample_weighted(rng, table) for _ in range(2000)]
    share_a = draws.count("A") / len(draws)
    assert 0.85 < share_a < 0.95


def test_worker_seeds_independent_and_deterministic():
    s1 = spawn_worker_seeds(42, 4)
    s2 = spawn_worker_seeds(42, 4)
    assert s1 == s2
    assert len(set(s1)) == 4
    assert np.all(np.array(s1) >= 0)

from slot_math.evaluator import (
    count_scatters,
    evaluate_lines,
    evaluate_ways,
    scatter_win,
)

MIDDLE = [[1, 1, 1, 1, 1]]


def col(top, mid, bot):
    return [top, mid, bot]


def test_five_of_a_kind_middle_line(config):
    grid = [col("L4", "H1", "L3")] * 5
    wins = evaluate_lines(grid, MIDDLE, config.paytable, 100)
    assert len(wins) == 1
    w = wins[0]
    assert w["symbolId"] == "H1" and w["payX100"] == 12000 and w["winMinor"] == 12000
    assert w["positions"] == [[c, 1] for c in range(5)]


def test_wild_substitutes(config):
    grid = [col("L4", "H1", "L3"), col("L4", "WILD", "L3")] + [col("L4", "H1", "L3")] * 3
    wins = evaluate_lines(grid, MIDDLE, config.paytable, 100)
    assert wins[0]["symbolId"] == "H1" and wins[0]["payX100"] == 12000


def test_two_of_a_kind_pays_nothing(config):
    grid = [col("L4", "H1", "L3"), col("L4", "H1", "L3")] + [col("L4", "L2", "L3")] * 3
    assert evaluate_lines(grid, MIDDLE, config.paytable, 100) == []


def test_pure_wild_prefix_takes_best_interpretation(config):
    # WILD WILD WILD H2 L4 -> H2 x4 (1500) beats any 3-kind interpretation
    grid = (
        [col("L4", "WILD", "L3")] * 3
        + [col("L4", "H2", "L3"), col("L4", "L4", "L3")]
    )
    wins = evaluate_lines(grid, MIDDLE, config.paytable, 100)
    assert wins[0]["symbolId"] == "H2" and wins[0]["payX100"] == 1500


def test_scatter_blocks_line_and_counts(config):
    grid = [col("L4", "SCATTER", "L3")] + [col("L4", "H1", "L3")] * 4
    assert evaluate_lines(grid, MIDDLE, config.paytable, 100) == []
    n, pos = count_scatters(grid)
    assert n == 1 and pos == [[0, 1]]


def test_scatter_win_bands(config):
    assert scatter_win(config.scatter_pays, 2, 100) == 0
    assert scatter_win(config.scatter_pays, 3, 100) == 200
    assert scatter_win(config.scatter_pays, 5, 100) == 5000
    assert scatter_win(config.scatter_pays, 7, 100) == 5000  # 6+ uses top band


def test_floor_rule_applies_to_odd_bets(config):
    grid = [col("L4", "H3", "L3")] * 3 + [col("L4", "L2", "L3")] * 2
    wins = evaluate_lines(grid, MIDDLE, config.paytable, 33)
    # H3 x3 pays 300 -> 33 * 300 // 100 = 99
    assert wins[0]["winMinor"] == 99


def test_ways_evaluation(config):
    grid = [
        col("H1", "H1", "L3"),
        col("H1", "L2", "L4"),
        col("WILD", "L2", "L3"),
        col("L1", "L2", "L4"),
        col("L1", "L2", "L4"),
    ]
    wins = evaluate_ways(grid, config.paytable, 100)
    h1 = next(w for w in wins if w["symbolId"] == "H1")
    # reels: 2 matches x 1 x 1(wild), reel 3 breaks -> count 3, ways 2
    assert h1["waysCount"] == 2
    assert h1["payX100"] == 600 * 2

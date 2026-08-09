import json

from slot_math.enumerate_lines import theoretical_base_rtp
from slot_math.par_sheet import build_par_sheet, render_markdown
from slot_math.simulate import run_simulation


def test_rtp_smoke_and_report_shape(fixture_dir, config):
    report = run_simulation(fixture_dir, rounds=20_000, seed=7, workers=1, bet_minor=100)

    r = report["results"]
    assert 0.4 < r["rtp"] < 1.15, r["rtp"]
    assert 0.05 < r["hitFrequency"] < 0.9

    p = report["provenance"]
    for key in (
        "gameVersion", "mathVersion", "configHash", "simCodeVersion",
        "seedPolicy", "seeds", "rounds", "workers", "command", "startedAt", "durationS",
    ):
        assert key in p, key
    assert p["rounds"] == 20_000
    assert p["configHash"].startswith("sha256:")

    for key in (
        "rtp", "rtpCi95", "hitFrequency", "contributions", "featureFreq",
        "retriggerRate", "avgCascades", "payoutPercentiles", "maxWinHits",
        "maxWinProb", "variance", "stddev", "volatilityIndex",
    ):
        assert key in r, key
    assert len(report["perTier"]) == 3
    for row in report["perTier"]:
        for key in (
            "tierId", "triggers", "freqOneInN", "rtpContribution", "avgPayX",
            "medianPayX", "p99PayX", "maxPayX", "avgRounds", "retriggerRate",
        ):
            assert key in row, key

    # contributions decompose the total
    total = sum(report["results"]["contributions"].values())
    assert abs(total - r["rtp"]) < 1e-9

    # exact theory vs simulated base contribution (line + scatter pays)
    theory = theoretical_base_rtp(config)
    simulated_base = r["contributions"]["base"] + r["contributions"]["scatter_pay"]
    assert abs(theory - simulated_base) < 0.08, (theory, simulated_base)

    # the report is JSON-serializable
    json.dumps(report)


def test_simulation_reproducible(fixture_dir):
    a = run_simulation(fixture_dir, rounds=3_000, seed=11, workers=1, bet_minor=100)
    b = run_simulation(fixture_dir, rounds=3_000, seed=11, workers=1, bet_minor=100)
    assert json.dumps(a["results"], sort_keys=True) == json.dumps(b["results"], sort_keys=True)


def test_par_sheet_renders(config, fixture_dir):
    report = run_simulation(fixture_dir, rounds=2_000, seed=3, workers=1, bet_minor=100)
    par = build_par_sheet(config, report)
    md = render_markdown(par)
    assert "PAR Sheet" in md and "sha256:" in md
    assert "theoreticalBaseRtp" in par
    assert par["simulation"]["results"]["rtp"] > 0

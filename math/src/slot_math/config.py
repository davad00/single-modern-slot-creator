"""Config bundle loading + canonical hashing (CONVENTIONS.md §5).

A config directory contains the game's JSON files. configHash is
"sha256:" + sha256 over the canonical JSON (UTF-8, sorted keys, no
insignificant whitespace) of every *.json file in the directory,
concatenated in filename-alphabetical order.
"""

from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


def canonical_json(obj: Any) -> str:
    return json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def config_hash(config_dir: str | Path) -> str:
    h = hashlib.sha256()
    for path in sorted(Path(config_dir).glob("*.json"), key=lambda p: p.name):
        with open(path, encoding="utf-8") as f:
            h.update(canonical_json(json.load(f)).encode("utf-8"))
    return "sha256:" + h.hexdigest()


TIER_BY_MIN_SCATTERS = (
    (5, "ultimate_feature"),
    (4, "super_feature"),
    (3, "feature"),
)


@dataclass
class GameConfig:
    """Parsed, validated config bundle."""

    game_id: str
    game_name: str
    game_version: str
    math_version: str
    columns: int
    rows: int
    evaluation: str  # "lines" | "ways"
    lines: list[list[int]]
    max_win_x_bet: int
    symbols: list[dict]
    paytable: dict  # symbolId -> {count(str): payX100}
    scatter_pays: dict  # count(str) -> payX100 of total bet (optional, may be {})
    reel_sets: dict  # purpose -> list[list[symbolId]] (strips per reel)
    scatter_tiers: dict
    features: dict  # tierId -> {rounds, startingMult100, reelSet}
    math_model: dict
    config_hash: str = ""
    raw: dict = field(default_factory=dict)

    @property
    def wild_id(self) -> str:
        return "WILD"

    @property
    def scatter_id(self) -> str:
        return "SCATTER"

    def strips(self, purpose: str) -> list[list[str]]:
        if purpose in self.reel_sets:
            return self.reel_sets[purpose]
        return self.reel_sets["base"]

    def tier_for_scatters(self, n: int) -> str | None:
        st = self.scatter_tiers
        # Canonical config shape (schemas/scatter-tiers.schema.json): tiers[]
        # with tierId + scattersRequired. The flat *Scatters keys are the
        # skill-INPUT vocabulary (schemas/skill-input.schema.json) and are
        # accepted as a fallback for hand-written dev configs.
        thresholds = {
            t["tierId"]: int(t["scattersRequired"]) for t in st.get("tiers", [])
        } or {
            "feature": int(st.get("featureBonusScatters", 3)),
            "super_feature": int(st.get("superFeatureScatters", 4)),
            "ultimate_feature": int(st.get("ultimateFeatureScatters", 5)),
        }
        if n >= thresholds["ultimate_feature"]:
            return "ultimate_feature"
        if n >= thresholds["super_feature"]:
            return "super_feature"
        if n >= thresholds["feature"]:
            return "feature"
        return None


def _read(config_dir: Path, name: str) -> dict:
    with open(config_dir / name, encoding="utf-8") as f:
        return json.load(f)


def load_config(config_dir: str | Path) -> GameConfig:
    d = Path(config_dir)
    gc = _read(d, "game-config.json")
    symbols = _read(d, "symbols.json")
    paytable = _read(d, "paytable.json")
    reel_sets_raw = _read(d, "reel-sets.json")
    scatter_tiers = _read(d, "scatter-tiers.json")
    features = _read(d, "features.json")
    math_model = _read(d, "math-model.json")

    reel_sets: dict[str, list[list[str]]] = {}
    for s in reel_sets_raw["sets"]:
        strips = s["strips"]
        # shorthand: a single strip with "replicate": true is used for every reel
        if s.get("replicate") and len(strips) == 1:
            strips = [list(strips[0]) for _ in range(int(gc["grid"]["columns"]))]
        reel_sets[s["purpose"]] = strips
    if "base" not in reel_sets:
        raise ValueError("reel-sets.json must contain a set with purpose 'base'")

    cfg = GameConfig(
        game_id=gc["gameId"],
        game_name=gc["gameName"],
        game_version=gc["gameVersion"],
        math_version=gc["mathVersion"],
        columns=int(gc["grid"]["columns"]),
        rows=int(gc["grid"]["rows"]),
        evaluation=gc.get("evaluation", "lines"),
        lines=gc.get("lines", []),
        max_win_x_bet=int(gc["maxWinXBet"]),
        symbols=symbols,
        paytable=paytable.get("linePays", paytable),
        scatter_pays=paytable.get("scatterPays", {}),
        reel_sets=reel_sets,
        scatter_tiers=scatter_tiers,
        features=features,
        math_model=math_model,
        raw={"gameConfig": gc},
    )
    cfg.config_hash = config_hash(d)

    _validate(cfg)
    return cfg


def _validate(cfg: GameConfig) -> None:
    ids = {s["id"] for s in cfg.symbols}
    for purpose, strips in cfg.reel_sets.items():
        if len(strips) != cfg.columns:
            raise ValueError(f"reel set '{purpose}': expected {cfg.columns} strips")
        for i, strip in enumerate(strips):
            if len(strip) < cfg.rows:
                raise ValueError(f"reel set '{purpose}' strip {i} shorter than window")
            unknown = set(strip) - ids
            if unknown:
                raise ValueError(f"reel set '{purpose}' strip {i} has unknown symbols {unknown}")
    if cfg.evaluation == "lines" and not cfg.lines:
        raise ValueError("evaluation 'lines' requires at least one line definition")
    for line in cfg.lines:
        if len(line) != cfg.columns:
            raise ValueError("every line must have one row index per column")
        if any(r < 0 or r >= cfg.rows for r in line):
            raise ValueError("line row index out of range")
    for sym, pays in cfg.paytable.items():
        if sym not in ids:
            raise ValueError(f"paytable references unknown symbol {sym}")
        for k, v in pays.items():
            if not isinstance(v, int):
                raise ValueError(f"paytable {sym}[{k}] must be integer payX100")
    for tier in ("feature", "super_feature", "ultimate_feature"):
        if tier not in cfg.features:
            raise ValueError(f"features.json missing tier '{tier}'")

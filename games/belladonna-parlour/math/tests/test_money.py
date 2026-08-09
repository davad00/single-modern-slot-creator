import pytest

from slot_math.money import apply_multiplier, win_minor


def test_floor_rule():
    assert win_minor(100, 250) == 250
    assert win_minor(33, 250) == 82  # 33*250/100 = 82.5 -> floor 82
    assert win_minor(1, 50) == 0  # 0.5 -> floor 0
    assert win_minor(0, 12000) == 0
    assert win_minor(100, 0) == 0


def test_large_values_exact():
    # int arithmetic must stay exact far beyond float precision
    assert win_minor(10**15, 12345) == 10**15 * 12345 // 100


def test_rejects_floats():
    with pytest.raises(TypeError):
        win_minor(100.0, 250)  # type: ignore[arg-type]
    with pytest.raises(TypeError):
        win_minor(100, 250.0)  # type: ignore[arg-type]


def test_rejects_negative():
    with pytest.raises(ValueError):
        win_minor(-1, 100)
    with pytest.raises(ValueError):
        apply_multiplier(100, -100)


def test_apply_multiplier_floor():
    assert apply_multiplier(333, 150) == 499  # 333*1.5 = 499.5 -> 499
    assert apply_multiplier(100, 300) == 300

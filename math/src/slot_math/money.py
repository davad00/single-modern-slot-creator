"""Integer-minor-unit money rules (CONVENTIONS.md §5)."""


def win_minor(bet_minor: int, pay_x100: int, mult100: int = 100) -> int:
    """Floor rule, single division: winMinor = betMinor * payX100 * mult100 // 10000.

    With mult100 = 100 (1x) this is exactly the CONVENTIONS §5 rule
    winMinor = betMinor * payX100 // 100. Any step/feature multiplier is folded
    in BEFORE the single floor division so Python and the TypeScript client
    (client-template/src/core/money.ts `winMinor`) settle identical values —
    flooring first and multiplying after would lose up to multiplier−1 minor
    units per win and desynchronise model and client.

    All operands must be non-negative ints; result is an exact int.
    """
    if bet_minor < 0 or pay_x100 < 0 or mult100 < 0:
        raise ValueError("bet_minor, pay_x100 and mult100 must be non-negative")
    if not isinstance(bet_minor, int) or not isinstance(pay_x100, int) or not isinstance(mult100, int):
        raise TypeError("money values must be int (no floats in settlement)")
    return bet_minor * pay_x100 * mult100 // 10000


def apply_multiplier(amount_minor: int, mult100: int) -> int:
    """Apply an x100 fixed-point multiplier to a whole amount, floor rule.

    NOT for per-win settlement: there the multiplier must be folded into the
    single floor division via win_minor(bet, pay, mult100).
    """
    if amount_minor < 0 or mult100 < 0:
        raise ValueError("amount_minor and mult100 must be non-negative")
    return amount_minor * mult100 // 100

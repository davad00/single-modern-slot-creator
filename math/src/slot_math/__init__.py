"""slot_math — deterministic slot mathematics engine template.

Money is ALWAYS integer minor units. Paytable pays are integer hundredths of a
bet (payX100); win = bet_minor * payX100 // 100 (floor). Settlement paths use
integer arithmetic only; floats are permitted in statistics/reporting alone.
"""

SIM_CODE_VERSION = "1.0.0"

__all__ = ["SIM_CODE_VERSION"]

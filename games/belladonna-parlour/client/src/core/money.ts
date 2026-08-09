/**
 * Money helpers — CONVENTIONS §5.
 *
 * ALL settlement math is done in integer minor units (fields suffixed `Minor`).
 * Never binary floats for settlement. Paytable pays are x-bet stored as integer
 * hundredths of a bet (`payX100`, e.g. 2.5x → 250).
 *
 * Canonical win rule (identical in the Python math model / simulator):
 *
 *     winMinor = (betMinor * payX100 * multiplier) // 100   (floor, single division)
 *
 * The step multiplier is applied to payX100 BEFORE the single floor division so
 * that `winMinor(bet, pay, m)` and a math model computing
 * `floor(bet * pay * m / 100)` agree exactly. Flooring first and multiplying
 * after would lose up to `multiplier - 1` minor units and desynchronise client
 * and simulator.
 */

/** Throws unless `value` is a non-negative safe integer. */
export function assertMinor(value: number, label = 'amount'): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${label} must be a non-negative safe integer (minor units), got ${value}`);
  }
}

/** Throws unless `value` is a positive safe integer. */
export function assertPositiveInt(value: number, label = 'value'): void {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new RangeError(`${label} must be a positive safe integer, got ${value}`);
  }
}

/**
 * Canonical floor rule: winMinor = floor(betMinor * payX100 * multiplier / 100).
 * `multiplier` is an integer step/feature multiplier (default 1).
 * Uses BigInt internally so intermediate products can never lose precision.
 */
export function winMinor(betMinor: number, payX100: number, multiplier = 1): number {
  assertMinor(betMinor, 'betMinor');
  assertMinor(payX100, 'payX100');
  assertPositiveInt(multiplier, 'multiplier');
  const result = (BigInt(betMinor) * BigInt(payX100) * BigInt(multiplier)) / 100n;
  if (result > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new RangeError(`winMinor overflow: ${result} exceeds MAX_SAFE_INTEGER`);
  }
  return Number(result);
}

/** Max win cap in minor units: betMinor * maxWinXBet (integer x-bet cap). */
export function maxWinCapMinor(betMinor: number, maxWinXBet: number): number {
  assertMinor(betMinor, 'betMinor');
  assertPositiveInt(maxWinXBet, 'maxWinXBet');
  const cap = BigInt(betMinor) * BigInt(maxWinXBet);
  if (cap > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new RangeError(`maxWinCapMinor overflow: ${cap} exceeds MAX_SAFE_INTEGER`);
  }
  return Number(cap);
}

/** ISO-4217 minor-unit exponents that differ from the default of 2. */
const MINOR_EXPONENT_EXCEPTIONS: Readonly<Record<string, number>> = {
  JPY: 0,
  KRW: 0,
  VND: 0,
  CLP: 0,
  ISK: 0,
  BHD: 3,
  KWD: 3,
  OMR: 3,
  TND: 3,
};

/** Number of minor-unit digits for a currency code (default 2). */
export function minorExponent(currency: string): number {
  return MINOR_EXPONENT_EXCEPTIONS[currency.toUpperCase()] ?? 2;
}

const CURRENCY_SYMBOLS: Readonly<Record<string, string>> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
};

export interface FormatMinorOptions {
  /** Show the currency symbol/code prefix. Default true. */
  withCurrency?: boolean;
  /** Thousands separator. Default ','. */
  groupSeparator?: string;
  /** Decimal separator. Default '.'. */
  decimalSeparator?: string;
}

/**
 * Display-only formatting (HUD, history). Pure integer string construction —
 * no float division, so it is exact for any safe-integer amount.
 * Settlement never depends on this function.
 */
export function formatMinor(amountMinor: number, currency: string, options: FormatMinorOptions = {}): string {
  assertMinor(amountMinor, 'amountMinor');
  const { withCurrency = true, groupSeparator = ',', decimalSeparator = '.' } = options;
  const exp = minorExponent(currency);
  const digits = String(amountMinor).padStart(exp + 1, '0');
  const intPart = exp === 0 ? digits : digits.slice(0, -exp);
  const fracPart = exp === 0 ? '' : digits.slice(-exp);
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, groupSeparator);
  const body = fracPart === '' ? grouped : `${grouped}${decimalSeparator}${fracPart}`;
  if (!withCurrency) return body;
  const symbol = CURRENCY_SYMBOLS[currency.toUpperCase()];
  return symbol !== undefined ? `${symbol}${body}` : `${currency.toUpperCase()} ${body}`;
}

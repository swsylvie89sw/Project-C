/** Display-only formatting. Never use these results in calculations. */

export function formatNumber(value: number, locale: string, maxFractionDigits = 2): string {
  if (!Number.isFinite(value)) return '–'
  return new Intl.NumberFormat(locale, { maximumFractionDigits: maxFractionDigits }).format(value)
}

/**
 * Money with the currency symbol. Amounts of 1 or more use the currency's normal decimals;
 * smaller non-zero amounts keep 3 significant digits so per-request costs do not show as 0.
 */
export function formatMoney(value: number, currency: string, locale: string, precise = false): string {
  if (!Number.isFinite(value)) return '–'
  const abs = Math.abs(value)
  const options: Intl.NumberFormatOptions = { style: 'currency', currency }
  if (precise && abs >= 1) {
    // Unit prices inside formulas: keep up to 4 decimals so the shown formula multiplies out.
    options.maximumFractionDigits = 4
  } else if (abs > 0 && abs < 1) {
    // About 3 significant digits, at least 2 decimals: $0.20, $0.075, $0.000375
    const digits = Math.min(20, Math.max(2, 2 - Math.floor(Math.log10(abs))))
    options.minimumFractionDigits = 2
    options.maximumFractionDigits = digits
  }
  return new Intl.NumberFormat(locale, options).format(value)
}

/** A fraction (0.25) as a percentage (+25%). */
export function formatPercentChange(fraction: number, locale: string): string {
  if (!Number.isFinite(fraction)) return '–'
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: 1,
    signDisplay: 'exceptZero',
  }).format(fraction)
}

/** A fraction (0.25) as a plain percentage (25%), no sign. */
export function formatPercent(fraction: number, locale: string): string {
  if (!Number.isFinite(fraction)) return '–'
  return new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 }).format(fraction)
}

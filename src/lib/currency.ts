import { parsePositive } from './parse'

export const CURRENCIES = ['USD', 'TWD', 'EUR', 'JPY', 'GBP'] as const
export type CurrencyCode = (typeof CURRENCIES)[number]

export interface RateEntry {
  /** As typed by the user, so partial input is not lost. */
  rate: string
  asOf: string
}

export interface CurrencySettings {
  code: CurrencyCode
  rates: Partial<Record<CurrencyCode, RateEntry>>
}

export const DEFAULT_CURRENCY: CurrencySettings = { code: 'USD', rates: {} }

export function isCurrency(value: unknown): value is CurrencyCode {
  return typeof value === 'string' && (CURRENCIES as readonly string[]).includes(value)
}

/** Rate for the chosen currency: 1 for USD, null when missing or invalid. */
export function activeRate(settings: CurrencySettings): number | null {
  if (settings.code === 'USD') return 1
  const entry = settings.rates[settings.code]
  return entry ? parsePositive(entry.rate) : null
}

/** Keeps only well-formed settings from untrusted storage data. */
export function cleanCurrencySettings(raw: unknown): CurrencySettings {
  if (!raw || typeof raw !== 'object') return DEFAULT_CURRENCY
  const r = raw as { code?: unknown; rates?: unknown }
  const rates: CurrencySettings['rates'] = {}
  if (r.rates && typeof r.rates === 'object') {
    for (const [code, entry] of Object.entries(r.rates as Record<string, unknown>)) {
      const e = entry as Partial<RateEntry> | null
      if (isCurrency(code) && e && typeof e.rate === 'string' && typeof e.asOf === 'string') {
        rates[code] = { rate: e.rate, asOf: e.asOf }
      }
    }
  }
  return { code: isCurrency(r.code) ? r.code : 'USD', rates }
}

import { convertFromUsd } from '../engine/costEngine'
import { activeRate, type CurrencySettings } from '../lib/currency'
import { formatMoney } from '../lib/format'
import { useI18n } from '../i18n'

export interface Money {
  /** Null when a non-USD currency has no usable rate. */
  rate: number | null
  code: CurrencySettings['code']
  /** Formats a USD amount in the display currency, or returns null when there is no rate. */
  format: (usd: number, precise?: boolean) => string | null
}

export function useMoney(settings: CurrencySettings): Money {
  const { locale } = useI18n()
  const rate = activeRate(settings)
  return {
    rate,
    code: settings.code,
    format: (usd, precise = false) => {
      const converted = convertFromUsd(usd, rate)
      return converted === null ? null : formatMoney(converted, settings.code, locale, precise)
    },
  }
}

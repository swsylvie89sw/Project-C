import { useI18n } from '../i18n'
import { CURRENCIES, isCurrency, type CurrencySettings } from '../lib/currency'
import { parsePositive } from '../lib/parse'
import { Card, inputClass, invalidInputClass, Notice } from './ui'

interface Props {
  settings: CurrencySettings
  onChange: (settings: CurrencySettings) => void
}

export function CurrencySection({ settings, onChange }: Props) {
  const { t } = useI18n()
  const code = settings.code
  const entry = settings.rates[code] ?? { rate: '', asOf: '' }
  const rateInvalid = code !== 'USD' && parsePositive(entry.rate) === null

  const updateEntry = (patch: Partial<typeof entry>) =>
    onChange({ ...settings, rates: { ...settings.rates, [code]: { ...entry, ...patch } } })

  return (
    <Card title={t('currency.heading')}>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="currency" className="mb-1 block text-sm font-medium text-slate-700">
            {t('currency.label')}
          </label>
          <select
            id="currency"
            value={code}
            onChange={(e) => isCurrency(e.target.value) && onChange({ ...settings, code: e.target.value })}
            className={inputClass}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {t(`currency.${c}`)}
              </option>
            ))}
          </select>
        </div>
        {code !== 'USD' && (
          <>
            <div>
              <label htmlFor="rate" className="mb-1 block text-sm font-medium text-slate-700">
                {t('currency.rate', { currency: code })}
              </label>
              <input
                id="rate"
                type="text"
                inputMode="decimal"
                value={entry.rate}
                onChange={(e) => updateEntry({ rate: e.target.value })}
                aria-invalid={rateInvalid || undefined}
                className={`${inputClass} ${rateInvalid ? invalidInputClass : ''}`}
              />
            </div>
            <div>
              <label htmlFor="rateAsOf" className="mb-1 block text-sm font-medium text-slate-700">
                {t('currency.asOf')}
              </label>
              <input
                id="rateAsOf"
                type="date"
                value={entry.asOf}
                onChange={(e) => updateEntry({ asOf: e.target.value })}
                className={inputClass}
              />
            </div>
          </>
        )}
      </div>
      <div className="mt-3 space-y-2">
        {rateInvalid && <Notice>{t('results.needRate', { currency: t(`currency.${code}`) })}</Notice>}
        <p className="text-xs text-slate-500">{t('currency.note')}</p>
      </div>
    </Card>
  )
}

import { IconTag } from './icons'
import { useState } from 'react'
import { useI18n } from '../i18n'
import { parseNonNegative } from '../lib/parse'
import type { PriceOverride, PricedModel } from '../lib/prices'
import { buttonClass, Card, inputClass, invalidInputClass, Tag } from './ui'

interface Props {
  models: PricedModel[]
  onChange: (id: string, override: PriceOverride) => void
  onReset: (id: string) => void
  onResetAll: () => void
}

/** Keeps the typed text locally and only commits valid numbers, so partial input like "2." is not lost. */
function PriceInput({ value, label, onCommit }: { value: number; label: string; onCommit: (v: number) => void }) {
  const [draft, setDraft] = useState(String(value))
  const [lastValue, setLastValue] = useState(value)
  // When the committed price changes from outside (reset), show it unless the draft already means the same number.
  if (value !== lastValue) {
    setLastValue(value)
    if (parseNonNegative(draft) !== value) setDraft(String(value))
  }
  const invalid = parseNonNegative(draft) === null
  return (
    <input
      type="text"
      inputMode="decimal"
      aria-label={label}
      aria-invalid={invalid || undefined}
      value={draft}
      onChange={(e) => {
        setDraft(e.target.value)
        const parsed = parseNonNegative(e.target.value)
        if (parsed !== null) onCommit(parsed)
      }}
      className={`${inputClass} w-24 text-right tabular-nums ${invalid ? invalidInputClass : ''}`}
    />
  )
}

export function PriceTable({ models, onChange, onReset, onResetAll }: Props) {
  const { t } = useI18n()
  const anyEdited = models.some((m) => m.edited)
  return (
    <Card
      title={t('prices.heading')}
      icon={<IconTag />}
      aside={
        <button type="button" className={buttonClass} onClick={onResetAll} disabled={!anyEdited}>
          {t('prices.resetAll')}
        </button>
      }
    >
      <p className="mb-3 text-xs text-slate-600">{t('prices.note')}</p>
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:overflow-hidden sm:rounded-xl sm:border sm:border-slate-200/80 sm:bg-white/60 sm:px-0">
        <table className="w-full min-w-[640px] text-sm sm:[&_td:first-child]:pl-4 sm:[&_th:first-child]:pl-4 sm:[&_td:last-child]:pr-4 sm:[&_th:last-child]:pr-4">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              <th className="py-2 pr-3 font-medium">{t('prices.provider')}</th>
              <th className="py-2 pr-3 font-medium">{t('prices.model')}</th>
              <th className="py-2 pr-3 text-right font-medium">{t('prices.input')}</th>
              <th className="py-2 pr-3 text-right font-medium">{t('prices.output')}</th>
              <th className="py-2 pr-3 font-medium">{t('prices.asOf')}</th>
              <th className="py-2 pr-3 font-medium">{t('prices.source')}</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {models.map((m) => (
              <tr key={m.id} className="border-b border-slate-100 transition-colors duration-150 last:border-0 hover:bg-blue-50/50">
                <td className="py-2 pr-3 text-slate-700">{m.provider}</td>
                <td className="py-2 pr-3">
                  <span className="font-medium text-slate-900">{m.model}</span>{' '}
                  {m.edited && <Tag tone="amber">{t('prices.edited')}</Tag>}
                </td>
                <td className="py-2 pr-3 text-right">
                  <PriceInput
                    value={m.inputPricePer1M}
                    label={`${m.model} ${t('prices.input')}`}
                    onCommit={(v) => onChange(m.id, { inputPricePer1M: v, outputPricePer1M: m.outputPricePer1M })}
                  />
                </td>
                <td className="py-2 pr-3 text-right">
                  <PriceInput
                    value={m.outputPricePer1M}
                    label={`${m.model} ${t('prices.output')}`}
                    onCommit={(v) => onChange(m.id, { inputPricePer1M: m.inputPricePer1M, outputPricePer1M: v })}
                  />
                </td>
                <td className="py-2 pr-3 whitespace-nowrap text-slate-600">{m.priceAsOf}</td>
                <td className="py-2 pr-3">
                  <a href={m.source} target="_blank" rel="noreferrer" className="text-blue-600 underline hover:text-blue-500">
                    {t('prices.sourceLink')}
                  </a>
                </td>
                <td className="py-2 text-right">
                  <button type="button" className={buttonClass} onClick={() => onReset(m.id)} disabled={!m.edited}>
                    {t('prices.reset')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

import { compareCosts, estimateCost } from '../engine/costEngine'
import type { UsageInput } from '../engine/types'
import { useI18n } from '../i18n'
import { formatPercentChange } from '../lib/format'
import type { PricedModel } from '../lib/prices'
import type { Money } from './useMoney'
import { buttonClass, Card, inputClass, Notice, Tag } from './ui'

export const MIN_COMPARE = 2
export const MAX_COMPARE = 4

interface Props {
  models: PricedModel[]
  ids: string[]
  onChange: (ids: string[]) => void
  usage: UsageInput
  money: Money
}

export function ComparisonSection({ models, ids, onChange, usage, money }: Props) {
  const { t, locale } = useI18n()
  const byId = new Map(models.map((m) => [m.id, m]))
  const chosen = ids.map((id) => byId.get(id)).filter((m): m is PricedModel => m !== undefined)
  const rows = compareCosts(chosen.map((m) => ({ id: m.id, monthlyCost: estimateCost(usage, m).monthlyCost })))
  const missing = '—'

  const replace = (index: number, id: string) => onChange(ids.map((old, i) => (i === index ? id : old)))
  const remove = (index: number) => onChange(ids.filter((_, i) => i !== index))
  const add = () => {
    const next = models.find((m) => !ids.includes(m.id)) ?? models[0]
    onChange([...ids, next.id])
  }

  return (
    <Card
      title={t('compare.heading')}
      aside={<span className="text-xs text-slate-500">{t('compare.hint')}</span>}
    >
      {money.rate === null && (
        <div className="mb-3">
          <Notice>{t('results.needRate', { currency: t(`currency.${money.code}`) })}</Notice>
        </div>
      )}
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="py-2 pr-3 font-medium">{t('compare.model')}</th>
              <th className="py-2 pr-3 text-right font-medium">{t('compare.monthly')}</th>
              <th className="py-2 pr-3 text-right font-medium">{t('compare.annual')}</th>
              <th className="py-2 pr-3 text-right font-medium">{t('compare.diff')}</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.id}-${index}`} className="border-b border-slate-100 last:border-0">
                <td className="py-2 pr-3">
                  <label className="sr-only" htmlFor={`compare-${index}`}>
                    {t('compare.pick', { n: index + 1 })}
                  </label>
                  <select
                    id={`compare-${index}`}
                    value={row.id}
                    onChange={(e) => replace(index, e.target.value)}
                    className={`${inputClass} min-w-[12rem]`}
                  >
                    {models.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.provider} · {m.model}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-2 pr-3 text-right tabular-nums">{money.format(row.monthlyCost) ?? missing}</td>
                <td className="py-2 pr-3 text-right tabular-nums">{money.format(row.annualCost) ?? missing}</td>
                <td className="py-2 pr-3 text-right tabular-nums">
                  {row.isCheapest ? (
                    <Tag tone="emerald">{t('compare.cheapest')}</Tag>
                  ) : row.differenceVsCheapest === null ? (
                    t('compare.notApplicable')
                  ) : (
                    formatPercentChange(row.differenceVsCheapest, locale)
                  )}
                </td>
                <td className="py-2 text-right">
                  <button
                    type="button"
                    className={buttonClass}
                    onClick={() => remove(index)}
                    disabled={ids.length <= MIN_COMPARE}
                  >
                    {t('compare.remove')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3">
        <button type="button" className={buttonClass} onClick={add} disabled={ids.length >= MAX_COMPARE}>
          + {t('compare.add')}
        </button>
      </div>
    </Card>
  )
}

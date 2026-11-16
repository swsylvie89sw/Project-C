import { IconCpu } from './icons'
import { useI18n } from '../i18n'
import { formatMoney } from '../lib/format'
import { providers, type PricedModel } from '../lib/prices'
import { Card, inputClass, Tag } from './ui'

interface Props {
  models: PricedModel[]
  selected: PricedModel
  onSelect: (id: string) => void
}

export function ModelSection({ models, selected, onSelect }: Props) {
  const { t, locale } = useI18n()
  const providerList = providers(models)
  const modelsForProvider = models.filter((m) => m.provider === selected.provider)

  const changeProvider = (provider: string) => {
    const first = models.find((m) => m.provider === provider)
    if (first) onSelect(first.id)
  }

  return (
    <Card title={t('model.heading')} icon={<IconCpu />}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="provider" className="mb-1 block text-sm font-medium text-slate-700">
            {t('model.provider')}
          </label>
          <select id="provider" value={selected.provider} onChange={(e) => changeProvider(e.target.value)} className={inputClass}>
            {providerList.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="model" className="mb-1 block text-sm font-medium text-slate-700">
            {t('model.model')}
          </label>
          <select id="model" value={selected.id} onChange={(e) => onSelect(e.target.value)} className={inputClass}>
            {modelsForProvider.map((m) => (
              <option key={m.id} value={m.id}>
                {m.model}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
        <span>
          {t('model.priceLine', {
            input: formatMoney(selected.inputPricePer1M, 'USD', locale),
            output: formatMoney(selected.outputPricePer1M, 'USD', locale),
            date: selected.priceAsOf,
          })}
        </span>
        {selected.edited && <Tag tone="amber">{t('prices.edited')}</Tag>}
      </p>
    </Card>
  )
}

import { effectiveTokenAdjust } from '../engine/costEngine'
import type { CostEstimate, UsageInput } from '../engine/types'
import { useI18n } from '../i18n'
import type { CurrencySettings } from '../lib/currency'
import { formatNumber } from '../lib/format'
import type { PricedModel } from '../lib/prices'
import type { UseCase } from './UseCaseSection'
import type { Money } from './useMoney'
import { Card, Notice } from './ui'

interface Props {
  useCase: UseCase
  model: PricedModel
  usage: UsageInput
  estimate: CostEstimate
  hasInvalidUsage: boolean
  money: Money
  currency: CurrencySettings
}

function Row({ label, value, formula, strong }: { label: string; value: string; formula: string; strong?: boolean }) {
  return (
    <div className={`border-t border-slate-100 py-2.5 first:border-t-0 ${strong ? 'bg-indigo-50/60 -mx-2 rounded px-2' : ''}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <dt className={`text-sm ${strong ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>{label}</dt>
        <dd className={`tabular-nums ${strong ? 'text-lg font-bold text-indigo-700' : 'font-medium text-slate-900'}`}>{value}</dd>
      </div>
      <p className="mt-0.5 break-words text-xs text-slate-500">
        = {formula}
      </p>
    </div>
  )
}

export function ResultsSection({ useCase, model, usage, estimate, hasInvalidUsage, money, currency }: Props) {
  const { t, locale } = useI18n()
  const n = (v: number, maxFractionDigits = 2) => formatNumber(v, locale, maxFractionDigits)
  const missing = '—'
  const m = (usd: number) => money.format(usd) ?? missing
  const unitPrice = (usd: number) => money.format(usd, true) ?? missing
  const rateEntry = currency.rates[currency.code]

  return (
    <Card title={t('results.heading')}>
      <div className="mb-3">
        <p className="text-base font-semibold text-slate-900 break-words">{useCase.name.trim() || t('results.untitled')}</p>
        {useCase.description.trim() && <p className="mt-0.5 text-sm text-slate-600 break-words whitespace-pre-line">{useCase.description}</p>}
        <p className="mt-1 text-xs text-slate-500">{t('results.forModel', { provider: model.provider, model: model.model })}</p>
      </div>

      <div className="space-y-2">
        {hasInvalidUsage && <Notice>{t('results.invalidInputs')}</Notice>}
        {money.rate === null && <Notice>{t('results.needRate', { currency: t(`currency.${money.code}`) })}</Notice>}
      </div>

      <dl className="mt-2">
        <Row
          label={t('results.monthlyInteractions')}
          value={n(estimate.monthlyInteractions)}
          formula={t('formula.interactions', { users: n(usage.monthlyUsers), perUser: n(usage.interactionsPerUser) })}
        />
        <Row
          label={t('results.monthlyInputTokens')}
          value={n(estimate.monthlyInputTokens)}
          formula={t('formula.inputTokens', {
            interactions: n(estimate.monthlyInteractions),
            avg: n(usage.avgInputTokens),
            adjust: n(effectiveTokenAdjust(model.tokenAdjust), 4),
          })}
        />
        <Row
          label={t('results.monthlyOutputTokens')}
          value={n(estimate.monthlyOutputTokens)}
          formula={t('formula.outputTokens', { interactions: n(estimate.monthlyInteractions), avg: n(usage.avgOutputTokens) })}
        />
        <Row
          label={t('results.inputCost')}
          value={m(estimate.inputCost)}
          formula={t('formula.inputCost', { tokens: n(estimate.monthlyInputTokens), price: unitPrice(model.inputPricePer1M) })}
        />
        <Row
          label={t('results.outputCost')}
          value={m(estimate.outputCost)}
          formula={t('formula.outputCost', { tokens: n(estimate.monthlyOutputTokens), price: unitPrice(model.outputPricePer1M) })}
        />
        <Row
          strong
          label={t('results.monthlyCost')}
          value={m(estimate.monthlyCost)}
          formula={t('formula.monthlyCost', { input: m(estimate.inputCost), output: m(estimate.outputCost) })}
        />
        <Row
          strong
          label={t('results.annualCost')}
          value={m(estimate.annualCost)}
          formula={t('formula.annualCost', { monthly: m(estimate.monthlyCost) })}
        />
      </dl>

      {currency.code !== 'USD' && money.rate !== null && (
        <p className="mt-3 text-xs text-slate-500">
          {t('results.currencyNote', {
            currency: currency.code,
            rate: formatNumber(money.rate, locale, 6),
            date: rateEntry?.asOf || missing,
          })}
        </p>
      )}
    </Card>
  )
}

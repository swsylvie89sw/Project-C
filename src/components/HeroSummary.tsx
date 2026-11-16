import type { ReactNode } from 'react'
import { costShare } from '../engine/costEngine'
import type { CostEstimate } from '../engine/types'
import { useI18n } from '../i18n'
import { formatNumber, formatPercent } from '../lib/format'
import type { PricedModel } from '../lib/prices'
import { IconActivity, IconLanguages, IconMonitor, IconShield, IconSigma, IconUserOff } from './icons'
import type { Money } from './useMoney'

interface Props {
  model: PricedModel
  estimate: CostEstimate
  hasInvalidUsage: boolean
  money: Money
}

function Kpi({ label, value, sub, emphasis }: { label: string; value: string; sub?: string; emphasis?: boolean }) {
  return (
    <div className={`glass-strong rounded-xl p-3 sm:p-4 ${emphasis ? 'ring-1 ring-blue-600/25' : ''}`}>
      <p className="text-xs font-medium text-slate-600">{label}</p>
      <p
        className={`mt-1 font-bold tabular-nums tracking-tight [overflow-wrap:anywhere] ${
          emphasis ? 'text-lg text-blue-700 min-[400px]:text-xl sm:text-3xl' : 'text-lg text-slate-900 sm:text-2xl'
        }`}
      >
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-slate-600">{sub}</p>}
    </div>
  )
}

function Badge({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/60 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">
      <span className="text-blue-700">{icon}</span>
      {children}
    </li>
  )
}

/** Top band: live headline numbers for the current estimate, plus factual product badges. */
export function HeroSummary({ model, estimate, hasInvalidUsage, money }: Props) {
  const { t, locale } = useI18n()
  const missing = '—'
  const m = (usd: number) => (hasInvalidUsage ? missing : (money.format(usd) ?? missing))
  const n = (v: number) => (hasInvalidUsage ? missing : formatNumber(v, locale, 0))
  const share = costShare(estimate)
  const hasSplit = !hasInvalidUsage && share.inputShare + share.outputShare > 0
  const icon = 'h-3.5 w-3.5'

  return (
    <section aria-labelledby="hero-heading" className="glass relative overflow-hidden rounded-3xl p-5 sm:p-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-blue-500/25 to-sky-400/10 blur-3xl"
      />
      <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-center">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-blue-600/10 px-2.5 py-1 text-xs font-semibold text-blue-800 ring-1 ring-blue-600/20">
            <IconActivity className={icon} />
            {t('hero.live')}
          </p>
          <h2 id="hero-heading" className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {t('hero.headline')}
          </h2>
          <p className="mt-2 max-w-prose text-sm text-slate-700 sm:text-base">{t('hero.lead')}</p>
          <ul className="mt-5 flex flex-wrap gap-2" aria-label={t('badges.label')}>
            <Badge icon={<IconMonitor className={icon} />}>{t('badges.browser')}</Badge>
            <Badge icon={<IconUserOff className={icon} />}>{t('badges.noSignup')}</Badge>
            <Badge icon={<IconShield className={icon} />}>{t('badges.private')}</Badge>
            <Badge icon={<IconSigma className={icon} />}>{t('badges.formulas')}</Badge>
            <Badge icon={<IconLanguages className={icon} />}>{t('badges.bilingual')}</Badge>
          </ul>
        </div>

        <div className="min-w-0">
          <p className="mb-2 text-xs text-slate-600">{t('results.forModel', { provider: model.provider, model: model.model })}</p>
          <div className="grid grid-cols-2 gap-3" aria-live="polite">
            <Kpi emphasis label={t('results.monthlyCost')} value={m(estimate.monthlyCost)} />
            <Kpi emphasis label={t('results.annualCost')} value={m(estimate.annualCost)} />
            <Kpi label={t('results.monthlyInteractions')} value={n(estimate.monthlyInteractions)} />
            <Kpi
              label={t('hero.monthlyTokens')}
              value={n(estimate.monthlyInputTokens + estimate.monthlyOutputTokens)}
              sub={
                hasInvalidUsage
                  ? undefined
                  : t('hero.tokensSplit', { input: n(estimate.monthlyInputTokens), output: n(estimate.monthlyOutputTokens) })
              }
            />
          </div>

          <div className="glass-strong mt-3 rounded-xl p-3 sm:p-4">
            <p className="text-xs font-medium text-slate-600">{t('hero.split')}</p>
            <div
              className="mt-2 flex h-3 w-full overflow-hidden rounded-full bg-slate-200"
              role="img"
              aria-label={
                hasSplit
                  ? t('hero.splitAria', {
                      input: formatPercent(share.inputShare, locale),
                      output: formatPercent(share.outputShare, locale),
                    })
                  : t('hero.splitEmpty')
              }
            >
              {hasSplit && (
                <>
                  <div className="h-full bg-blue-600 transition-[width] duration-300" style={{ width: `${share.inputShare * 100}%` }} />
                  <div className="h-full bg-orange-500 transition-[width] duration-300" style={{ width: `${share.outputShare * 100}%` }} />
                </>
              )}
            </div>
            <div className="mt-2 flex flex-wrap justify-between gap-x-4 gap-y-1 text-xs text-slate-700">
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm bg-blue-600" />
                {t('results.inputCost')}: <span className="font-semibold tabular-nums">{m(estimate.inputCost)}</span>
                {hasSplit && <span className="text-slate-600">({formatPercent(share.inputShare, locale)})</span>}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm bg-orange-500" />
                {t('results.outputCost')}: <span className="font-semibold tabular-nums">{m(estimate.outputCost)}</span>
                {hasSplit && <span className="text-slate-600">({formatPercent(share.outputShare, locale)})</span>}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

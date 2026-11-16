import { useMemo, useState } from 'react'
import baseModels from './data/models.json'
import { estimateCost } from './engine/costEngine'
import type { ModelInfo, UsageInput } from './engine/types'
import { useI18n } from './i18n'
import { cleanCurrencySettings, type CurrencySettings } from './lib/currency'
import { parseNonNegative } from './lib/parse'
import { applyOverrides, cleanOverrides, type PriceOverride, type PriceOverrides } from './lib/prices'
import { isStorageAvailable, readJson, writeJson } from './lib/storage'
import { ComparisonSection } from './components/ComparisonSection'
import { CurrencySection } from './components/CurrencySection'
import { GuidePanel } from './components/GuidePanel'
import { LanguageToggle } from './components/LanguageToggle'
import { ModelSection } from './components/ModelSection'
import { PriceTable } from './components/PriceTable'
import { ResultsSection } from './components/ResultsSection'
import { UseCaseSection, type UseCase } from './components/UseCaseSection'
import { UsageSection, type UsageField, type UsageText } from './components/UsageSection'
import { Notice } from './components/ui'
import { HeroSummary } from './components/HeroSummary'
import { IconBars } from './components/icons'
import { useMoney } from './components/useMoney'

const PRICES_KEY = 'roiSim.priceOverrides'
const CURRENCY_KEY = 'roiSim.currency'

const models = baseModels as ModelInfo[]

const DEFAULT_USAGE: UsageText = {
  monthlyUsers: '1000',
  interactionsPerUser: '20',
  avgInputTokens: '500',
  avgOutputTokens: '200',
}

function App() {
  const { t } = useI18n()
  const [storageOk] = useState(isStorageAvailable)

  const [useCase, setUseCase] = useState<UseCase>({ name: '', description: '' })
  const [overrides, setOverrides] = useState<PriceOverrides>(() => cleanOverrides(readJson(PRICES_KEY, {})))
  const pricedModels = useMemo(() => applyOverrides(models, overrides), [overrides])
  const [selectedId, setSelectedId] = useState(pricedModels[0].id)
  const selected = pricedModels.find((m) => m.id === selectedId) ?? pricedModels[0]

  const [usageText, setUsageText] = useState<UsageText>(DEFAULT_USAGE)
  const [fromGuide, setFromGuide] = useState<ReadonlySet<UsageField>>(new Set())
  const [compareIds, setCompareIds] = useState<string[]>(() => pricedModels.slice(0, 2).map((m) => m.id))
  const [currency, setCurrencyState] = useState<CurrencySettings>(() =>
    cleanCurrencySettings(readJson(CURRENCY_KEY, null)),
  )
  const money = useMoney(currency)

  const parsed = {
    monthlyUsers: parseNonNegative(usageText.monthlyUsers),
    interactionsPerUser: parseNonNegative(usageText.interactionsPerUser),
    avgInputTokens: parseNonNegative(usageText.avgInputTokens),
    avgOutputTokens: parseNonNegative(usageText.avgOutputTokens),
  }
  const hasInvalidUsage = Object.values(parsed).some((v) => v === null)
  const usage: UsageInput = {
    monthlyUsers: parsed.monthlyUsers ?? 0,
    interactionsPerUser: parsed.interactionsPerUser ?? 0,
    avgInputTokens: parsed.avgInputTokens ?? 0,
    avgOutputTokens: parsed.avgOutputTokens ?? 0,
  }
  const estimate = estimateCost(usage, selected)

  /** A manual edit always wins: it removes the "from guide" tag for that field. */
  const editUsage = (field: UsageField, value: string) => {
    setUsageText((prev) => ({ ...prev, [field]: value }))
    setFromGuide((prev) => {
      if (!prev.has(field)) return prev
      const next = new Set(prev)
      next.delete(field)
      return next
    })
  }

  /** The guided panel fills all four fields and tags them; later manual edits remove the tag. */
  const applyGuide = (filled: UsageInput) => {
    setUsageText({
      monthlyUsers: String(filled.monthlyUsers),
      interactionsPerUser: String(filled.interactionsPerUser),
      avgInputTokens: String(filled.avgInputTokens),
      avgOutputTokens: String(filled.avgOutputTokens),
    })
    setFromGuide(new Set<UsageField>(['monthlyUsers', 'interactionsPerUser', 'avgInputTokens', 'avgOutputTokens']))
  }

  const saveOverrides = (next: PriceOverrides) => {
    setOverrides(next)
    writeJson(PRICES_KEY, next)
  }
  const changePrice = (id: string, override: PriceOverride) => saveOverrides({ ...overrides, [id]: override })
  const resetPrice = (id: string) => {
    const next = { ...overrides }
    delete next[id]
    saveOverrides(next)
  }

  const setCurrency = (next: CurrencySettings) => {
    setCurrencyState(next)
    writeJson(CURRENCY_KEY, next)
  }

  return (
    <div className="min-h-screen font-sans text-slate-900">
      <header className="glass sticky top-0 z-20 border-x-0 border-t-0">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3">
          <LanguageToggle />
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              aria-hidden="true"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 text-white shadow-md shadow-blue-600/25"
            >
              <IconBars className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h1 className="text-lg font-bold leading-tight tracking-tight sm:text-xl">{t('app.title')}</h1>
              <p className="text-xs text-slate-600 sm:text-sm">{t('app.subtitle')}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-5 px-4 py-6 sm:py-8">
        {!storageOk && <Notice>{t('app.storageUnavailable')}</Notice>}

        <HeroSummary model={selected} estimate={estimate} hasInvalidUsage={hasInvalidUsage} money={money} />

        <GuidePanel model={selected} money={money} onApply={applyGuide} />

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-5">
            <UseCaseSection value={useCase} onChange={setUseCase} />
            <ModelSection models={pricedModels} selected={selected} onSelect={setSelectedId} />
            <UsageSection usage={usageText} fromGuide={fromGuide} onChange={editUsage} />
          </div>
          <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <ResultsSection
              useCase={useCase}
              model={selected}
              usage={usage}
              estimate={estimate}
              hasInvalidUsage={hasInvalidUsage}
              money={money}
              currency={currency}
            />
          </div>
        </div>

        <ComparisonSection models={pricedModels} ids={compareIds} onChange={setCompareIds} usage={usage} money={money} />
        <CurrencySection settings={currency} onChange={setCurrency} />
        <PriceTable models={pricedModels} onChange={changePrice} onReset={resetPrice} onResetAll={() => saveOverrides({})} />
      </main>
    </div>
  )
}

export default App

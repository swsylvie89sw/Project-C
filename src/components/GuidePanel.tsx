import { useEffect, useId, useMemo, useState } from 'react'
import { estimateCost } from '../engine/costEngine'
import type { UsageInput } from '../engine/types'
import { useI18n } from '../i18n'
import { formatNumber } from '../lib/format'
import { capText, guideToUsage, inputTokensPerRequest, outputTokensFromLength, type VolumeMode } from '../lib/guide'
import {
  CONTEXT_PRESETS,
  DEFAULT_DAYS_PER_MONTH,
  DEFAULT_TOKENS_PER_UNIT,
  EXAMPLES,
  LENGTH_UNIT,
  MAX_TOKENIZER_CHARS,
  TASK_LENGTH,
  TASK_TYPES,
  type ContentLang,
  type ContextPreset,
  type TaskType,
} from '../lib/guideConfig'
import { parseNonNegative } from '../lib/parse'
import type { PricedModel } from '../lib/prices'
import { loadTokenizer, type CountTokens } from '../lib/tokenizer'
import type { Money } from './useMoney'
import { buttonClass, inputClass, Notice, NumberField, primaryButtonClass, Tag } from './ui'

interface Props {
  model: PricedModel
  money: Money
  onApply: (usage: UsageInput) => void
}

type TokenizerState = { status: 'idle' | 'error' } | { status: 'ready'; count: CountTokens }

function StepHeading({ children }: { children: string }) {
  return <h3 className="mb-3 text-base font-semibold text-slate-900">{children}</h3>
}

function PartLabel({ htmlFor, label, kind, hint }: { htmlFor: string; label: string; kind: 'input' | 'output'; hint: string }) {
  const { t } = useI18n()
  return (
    <div className="mb-1">
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
          {label}
        </label>
        <Tag tone={kind === 'input' ? 'indigo' : 'emerald'}>{t(kind === 'input' ? 'guide.part.input' : 'guide.part.output')}</Tag>
      </div>
      <p className="text-xs text-slate-500">{hint}</p>
    </div>
  )
}

export function GuidePanel({ model, money, onApply }: Props) {
  const { t, lang, locale } = useI18n()
  const panelId = useId()
  const [open, setOpen] = useState(true)
  const [contentLang, setContentLang] = useState<ContentLang>(lang)
  const [tokenizer, setTokenizer] = useState<TokenizerState>({ status: 'idle' })

  const [systemPrompt, setSystemPrompt] = useState('')
  const [userInput, setUserInput] = useState('')
  const [contextPreset, setContextPreset] = useState<ContextPreset>('none')
  const [customContext, setCustomContext] = useState('1000')
  const [taskType, setTaskType] = useState<TaskType>('chat')
  const [responseLength, setResponseLength] = useState(String(TASK_LENGTH[lang].chat))
  const [tokensPerUnit, setTokensPerUnit] = useState(String(DEFAULT_TOKENS_PER_UNIT[lang]))

  const [volumeMode, setVolumeMode] = useState<VolumeMode>('daily')
  const [people, setPeople] = useState('50')
  const [requestsPerDay, setRequestsPerDay] = useState('10')
  const [daysPerMonth, setDaysPerMonth] = useState(String(DEFAULT_DAYS_PER_MONTH))
  const [requestsPerMonth, setRequestsPerMonth] = useState('200')
  const [applied, setApplied] = useState(false)

  // Load the tokenizer only once the panel is open ("idle" while open is shown as loading).
  useEffect(() => {
    if (!open || tokenizer.status !== 'idle') return
    let cancelled = false
    loadTokenizer().then(
      (count) => !cancelled && setTokenizer({ status: 'ready', count }),
      () => !cancelled && setTokenizer({ status: 'error' }),
    )
    return () => {
      cancelled = true
    }
  }, [open, tokenizer.status])

  const count = tokenizer.status === 'ready' ? tokenizer.count : null
  const system = capText(systemPrompt)
  const user = capText(userInput)
  const systemTokens = useMemo(() => (count ? count(system.text) : 0), [count, system.text])
  const userTokens = useMemo(() => (count ? count(user.text) : 0), [count, user.text])

  const contextTokens = contextPreset === 'custom' ? (parseNonNegative(customContext) ?? 0) : CONTEXT_PRESETS[contextPreset]
  const unit = LENGTH_UNIT[contentLang]
  const lengthValue = parseNonNegative(responseLength)
  const perUnitValue = parseNonNegative(tokensPerUnit)

  const inputTokens = inputTokensPerRequest({ systemPrompt: systemTokens, userInput: userTokens, context: contextTokens })
  const outputTokens = outputTokensFromLength(lengthValue ?? 0, perUnitValue ?? 0)
  const perRequest = estimateCost(
    { monthlyUsers: 1, interactionsPerUser: 1, avgInputTokens: inputTokens, avgOutputTokens: outputTokens },
    model,
  )

  const volume = {
    people: parseNonNegative(people),
    requestsPerDay: parseNonNegative(requestsPerDay),
    daysPerMonth: parseNonNegative(daysPerMonth),
    requestsPerMonth: parseNonNegative(requestsPerMonth),
  }
  const volumeFields = volumeMode === 'daily' ? [volume.people, volume.requestsPerDay, volume.daysPerMonth] : [volume.people, volume.requestsPerMonth]
  const volumeValid = volumeFields.every((v) => v !== null)
  const responseValid = lengthValue !== null && perUnitValue !== null
  const customContextValid = contextPreset !== 'custom' || parseNonNegative(customContext) !== null
  const canApply = volumeValid && responseValid && customContextValid && tokenizer.status === 'ready'

  const usage = guideToUsage(inputTokens, outputTokens, volumeMode, {
    people: volume.people ?? 0,
    requestsPerDay: volume.requestsPerDay ?? 0,
    daysPerMonth: volume.daysPerMonth ?? 0,
    requestsPerMonth: volume.requestsPerMonth ?? 0,
  })

  const changeContentLang = (next: ContentLang) => {
    setContentLang(next)
    setResponseLength(String(TASK_LENGTH[next][taskType]))
    setTokensPerUnit(String(DEFAULT_TOKENS_PER_UNIT[next]))
  }
  const changeTask = (next: TaskType) => {
    setTaskType(next)
    setResponseLength(String(TASK_LENGTH[contentLang][next]))
  }
  const loadExample = () => {
    setSystemPrompt(EXAMPLES[contentLang].systemPrompt)
    setUserInput(EXAMPLES[contentLang].userInput)
  }
  // Any change after applying hides the "Applied" message.
  const touch = <T,>(setter: (v: T) => void) => (v: T) => {
    setApplied(false)
    setter(v)
  }

  const n = (v: number) => formatNumber(v, locale)
  const m = (usd: number) => money.format(usd) ?? '—'
  const tokensLabel = (v: number) => t('guide.tokens', { count: n(v) })

  return (
    <section className="rounded-xl border border-indigo-200 bg-indigo-50/40 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-slate-900">{t('guide.heading')}</h2>
          <p className="text-sm text-slate-600">{t('guide.intro')}</p>
        </div>
        <button type="button" className={buttonClass} aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(!open)}>
          {open ? t('guide.hide') : t('guide.show')}
        </button>
      </div>

      {open && (
        <div id={panelId} className="space-y-5 border-t border-indigo-100 p-4 sm:p-5">
          <Notice tone="slate">{t('guide.accuracyNote')}</Notice>

          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label htmlFor="contentLang" className="mb-1 block text-sm font-medium text-slate-700">
                {t('guide.contentLanguage')}
              </label>
              <select
                id="contentLang"
                value={contentLang}
                onChange={(e) => touch(changeContentLang)(e.target.value as ContentLang)}
                className={inputClass}
              >
                <option value="en">{t('guide.contentLanguage.en')}</option>
                <option value="zh-TW">{t('guide.contentLanguage.zh-TW')}</option>
              </select>
            </div>
            <button type="button" className={buttonClass} onClick={() => touch(loadExample)(undefined)}>
              {t('guide.loadExample')}
            </button>
            <p className="w-full text-xs text-slate-500">{t('guide.contentLanguageHint')}</p>
          </div>

          {tokenizer.status === 'idle' &&<Notice tone="slate">{t('guide.tokenizerLoading')}</Notice>}
          {tokenizer.status === 'error' && <Notice>{t('guide.tokenizerError')}</Notice>}

          {/* Step 1 */}
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <StepHeading>{t('guide.step1')}</StepHeading>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <PartLabel htmlFor="systemPrompt" label={t('guide.systemPrompt')} kind="input" hint={t('guide.systemPromptHint')} />
                <textarea
                  id="systemPrompt"
                  rows={5}
                  lang={contentLang === 'en' ? 'en' : 'zh-Hant-TW'}
                  value={systemPrompt}
                  onChange={(e) => touch(setSystemPrompt)(e.target.value)}
                  className={inputClass}
                />
                <p className="mt-1 text-xs text-slate-600 tabular-nums">{tokensLabel(systemTokens)}</p>
                {system.truncated && <p className="text-xs text-amber-700">{t('guide.truncated', { max: n(MAX_TOKENIZER_CHARS) })}</p>}
              </div>
              <div>
                <PartLabel htmlFor="userInput" label={t('guide.userInput')} kind="input" hint={t('guide.userInputHint')} />
                <textarea
                  id="userInput"
                  rows={5}
                  lang={contentLang === 'en' ? 'en' : 'zh-Hant-TW'}
                  value={userInput}
                  onChange={(e) => touch(setUserInput)(e.target.value)}
                  className={inputClass}
                />
                <p className="mt-1 text-xs text-slate-600 tabular-nums">{tokensLabel(userTokens)}</p>
                {user.truncated && <p className="text-xs text-amber-700">{t('guide.truncated', { max: n(MAX_TOKENIZER_CHARS) })}</p>}
              </div>
              <div>
                <PartLabel htmlFor="contextPreset" label={t('guide.context')} kind="input" hint={t('guide.contextHint')} />
                <select
                  id="contextPreset"
                  value={contextPreset}
                  onChange={(e) => touch(setContextPreset)(e.target.value as ContextPreset)}
                  className={inputClass}
                >
                  <option value="none">{t('guide.contextPreset.none')}</option>
                  <option value="small">{t('guide.contextPreset.small', { tokens: n(CONTEXT_PRESETS.small) })}</option>
                  <option value="medium">{t('guide.contextPreset.medium', { tokens: n(CONTEXT_PRESETS.medium) })}</option>
                  <option value="large">{t('guide.contextPreset.large', { tokens: n(CONTEXT_PRESETS.large) })}</option>
                  <option value="custom">{t('guide.contextPreset.custom')}</option>
                </select>
                {contextPreset === 'custom' && (
                  <div className="mt-2">
                    <NumberField
                      id="customContext"
                      label={t('guide.contextCustom')}
                      value={customContext}
                      onChange={touch(setCustomContext)}
                      invalid={!customContextValid}
                      errorText={t('usage.invalid')}
                    />
                  </div>
                )}
                <p className="mt-1 text-xs text-slate-600 tabular-nums">{tokensLabel(contextTokens)}</p>
              </div>
              <div>
                <PartLabel htmlFor="taskType" label={t('guide.response')} kind="output" hint={t('guide.responseHint')} />
                <select id="taskType" value={taskType} onChange={(e) => touch(changeTask)(e.target.value as TaskType)} className={inputClass}>
                  {TASK_TYPES.map((task) => (
                    <option key={task} value={task}>
                      {t(`guide.task.${task}`)}
                    </option>
                  ))}
                </select>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <NumberField
                    id="responseLength"
                    label={t(`guide.responseLength.${unit}`)}
                    value={responseLength}
                    onChange={touch(setResponseLength)}
                    invalid={lengthValue === null}
                    errorText={t('usage.invalid')}
                  />
                  <NumberField
                    id="tokensPerUnit"
                    label={t(`guide.tokensPerUnit.${unit}`)}
                    value={tokensPerUnit}
                    onChange={touch(setTokensPerUnit)}
                    invalid={perUnitValue === null}
                    errorText={t('usage.invalid')}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-600 tabular-nums">{tokensLabel(outputTokens)}</p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <StepHeading>{t('guide.step2')}</StepHeading>
            <p className="mb-3 text-xs text-slate-500">{t('guide.forModel', { provider: model.provider, model: model.model })}</p>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md bg-indigo-50 p-3">
                <dt className="text-xs font-medium text-indigo-800">{t('guide.inputTokens')}</dt>
                <dd className="text-lg font-semibold tabular-nums text-slate-900">{n(perRequest.monthlyInputTokens)}</dd>
                <dt className="mt-2 text-xs font-medium text-indigo-800">{t('guide.inputCostPerRequest')}</dt>
                <dd className="tabular-nums text-slate-900">{m(perRequest.inputCost)}</dd>
              </div>
              <div className="rounded-md bg-emerald-50 p-3">
                <dt className="text-xs font-medium text-emerald-800">{t('guide.outputTokens')}</dt>
                <dd className="text-lg font-semibold tabular-nums text-slate-900">{n(perRequest.monthlyOutputTokens)}</dd>
                <dt className="mt-2 text-xs font-medium text-emerald-800">{t('guide.outputCostPerRequest')}</dt>
                <dd className="tabular-nums text-slate-900">{m(perRequest.outputCost)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-sm text-slate-700">
              {t('guide.costPerRequest')}: <span className="font-semibold tabular-nums">{m(perRequest.monthlyCost)}</span>
            </p>
          </div>

          {/* Step 3 */}
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <StepHeading>{t('guide.step3')}</StepHeading>
            <fieldset className="mb-3">
              <legend className="mb-1 text-sm font-medium text-slate-700">{t('guide.volumeMode')}</legend>
              <div className="inline-flex rounded-md border border-slate-300 bg-white p-0.5">
                {(['daily', 'monthly'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    aria-pressed={volumeMode === mode}
                    onClick={() => touch(setVolumeMode)(mode)}
                    className={`rounded px-3 py-1 text-sm ${volumeMode === mode ? 'bg-indigo-600 font-semibold text-white' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    {t(`guide.volumeMode.${mode}`)}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="grid gap-3 sm:grid-cols-3">
              <NumberField id="people" label={t('guide.people')} value={people} onChange={touch(setPeople)} invalid={volume.people === null} errorText={t('usage.invalid')} />
              {volumeMode === 'daily' ? (
                <>
                  <NumberField
                    id="requestsPerDay"
                    label={t('guide.requestsPerDay')}
                    value={requestsPerDay}
                    onChange={touch(setRequestsPerDay)}
                    invalid={volume.requestsPerDay === null}
                    errorText={t('usage.invalid')}
                  />
                  <NumberField
                    id="daysPerMonth"
                    label={t('guide.daysPerMonth')}
                    value={daysPerMonth}
                    onChange={touch(setDaysPerMonth)}
                    invalid={volume.daysPerMonth === null}
                    errorText={t('usage.invalid')}
                  />
                </>
              ) : (
                <NumberField
                  id="requestsPerMonth"
                  label={t('guide.requestsPerMonth')}
                  value={requestsPerMonth}
                  onChange={touch(setRequestsPerMonth)}
                  invalid={volume.requestsPerMonth === null}
                  errorText={t('usage.invalid')}
                />
              )}
            </div>
            <p className="mt-3 text-sm text-slate-700 tabular-nums">
              = {t('guide.volumeResult', { users: n(usage.monthlyUsers), perUser: n(usage.interactionsPerUser) })}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className={primaryButtonClass}
              disabled={!canApply}
              onClick={() => {
                onApply(usage)
                setApplied(true)
              }}
            >
              {t('guide.apply')}
            </button>
            {applied && <p className="text-sm text-emerald-700" role="status">{t('guide.applied')}</p>}
          </div>
        </div>
      )}
    </section>
  )
}

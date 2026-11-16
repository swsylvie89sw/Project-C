import { describe, expect, it } from 'vitest'
import { capText, guideToUsage, inputTokensPerRequest, outputTokensFromLength, volumeToUsage } from './guide'
import { CONTEXT_PRESETS, DEFAULT_TOKENS_PER_UNIT, LENGTH_UNIT, MAX_TOKENIZER_CHARS, TASK_LENGTH, TASK_TYPES } from './guideConfig'

describe('capText', () => {
  it('keeps short text as is', () => {
    expect(capText('hello')).toEqual({ text: 'hello', truncated: false })
  })
  it('cuts text at the 200,000 character limit', () => {
    const long = 'a'.repeat(MAX_TOKENIZER_CHARS + 10)
    const result = capText(long)
    expect(result.truncated).toBe(true)
    expect(result.text.length).toBe(200_000)
  })
})

describe('inputTokensPerRequest', () => {
  it('sums system prompt, user input and context', () => {
    expect(inputTokensPerRequest({ systemPrompt: 120, userInput: 30, context: 2000 })).toBe(2150)
  })
  it('ignores negative or invalid parts', () => {
    expect(inputTokensPerRequest({ systemPrompt: -5, userInput: Number.NaN, context: 500 })).toBe(500)
  })
})

describe('outputTokensFromLength', () => {
  it('converts words to tokens', () => {
    expect(outputTokensFromLength(150, 1.33)).toBeCloseTo(199.5, 10)
  })
  it('converts Chinese characters to tokens', () => {
    expect(outputTokensFromLength(300, 1)).toBe(300)
  })
  it('zero or invalid gives 0', () => {
    expect(outputTokensFromLength(0, 1.33)).toBe(0)
    expect(outputTokensFromLength(100, Number.NaN)).toBe(0)
  })
})

describe('volumeToUsage', () => {
  it('daily: people x requests per day x days per month', () => {
    expect(volumeToUsage('daily', { people: 40, requestsPerDay: 5, daysPerMonth: 22, requestsPerMonth: 0 })).toEqual({
      monthlyUsers: 40,
      interactionsPerUser: 110,
    })
  })
  it('monthly: requests per person per month', () => {
    expect(volumeToUsage('monthly', { people: 40, requestsPerDay: 5, daysPerMonth: 22, requestsPerMonth: 60 })).toEqual({
      monthlyUsers: 40,
      interactionsPerUser: 60,
    })
  })
})

describe('guideToUsage', () => {
  it('fills all four estimator fields with whole tokens', () => {
    expect(
      guideToUsage(2150, 199.5, 'daily', { people: 40, requestsPerDay: 5, daysPerMonth: 22, requestsPerMonth: 0 }),
    ).toEqual({ monthlyUsers: 40, interactionsPerUser: 110, avgInputTokens: 2150, avgOutputTokens: 200 })
  })
})

describe('guide config', () => {
  it('has a length for every task type in both content languages', () => {
    for (const lang of ['en', 'zh-TW'] as const) {
      for (const task of TASK_TYPES) expect(TASK_LENGTH[lang][task]).toBeGreaterThan(0)
      expect(DEFAULT_TOKENS_PER_UNIT[lang]).toBeGreaterThan(0)
    }
    expect(LENGTH_UNIT).toEqual({ en: 'words', 'zh-TW': 'chars' })
    expect(CONTEXT_PRESETS.none).toBe(0)
  })
})

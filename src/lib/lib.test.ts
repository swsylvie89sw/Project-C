import { describe, expect, it } from 'vitest'
import { parseNonNegative, parsePositive } from './parse'
import { applyOverrides, cleanOverrides, modelId, providers } from './prices'
import { formatMoney, formatPercentChange } from './format'
import { activeRate, cleanCurrencySettings } from './currency'

const models = [
  { provider: 'A', model: 'a1', inputPricePer1M: 1, outputPricePer1M: 2, priceAsOf: '2026-01-01', source: 'https://a' },
  { provider: 'B', model: 'b1', inputPricePer1M: 3, outputPricePer1M: 4, priceAsOf: '2026-01-01', source: 'https://b' },
  { provider: 'A', model: 'a2', inputPricePer1M: 5, outputPricePer1M: 6, priceAsOf: '2026-01-01', source: 'https://a' },
]

describe('parseNonNegative', () => {
  it('accepts plain and comma-grouped numbers', () => {
    expect(parseNonNegative('1000')).toBe(1000)
    expect(parseNonNegative('1,000')).toBe(1000)
    expect(parseNonNegative(' 2.5 ')).toBe(2.5)
    expect(parseNonNegative('0')).toBe(0)
    expect(parseNonNegative('.5')).toBe(0.5)
  })
  it('rejects empty, negative and non-numbers', () => {
    expect(parseNonNegative('')).toBeNull()
    expect(parseNonNegative('-1')).toBeNull()
    expect(parseNonNegative('abc')).toBeNull()
    expect(parseNonNegative('1e3')).toBeNull()
    expect(parseNonNegative('Infinity')).toBeNull()
  })
  it('parsePositive rejects 0', () => {
    expect(parsePositive('0')).toBeNull()
    expect(parsePositive('32.5')).toBe(32.5)
  })
})

describe('prices', () => {
  it('applies valid overrides and marks them edited', () => {
    const priced = applyOverrides(models, { 'A/a1': { inputPricePer1M: 9, outputPricePer1M: 2 } })
    expect(priced[0]).toMatchObject({ id: 'A/a1', inputPricePer1M: 9, edited: true })
    expect(priced[1]).toMatchObject({ id: 'B/b1', inputPricePer1M: 3, edited: false })
  })
  it('an override equal to the default is not marked edited', () => {
    const priced = applyOverrides(models, { 'A/a1': { inputPricePer1M: 1, outputPricePer1M: 2 } })
    expect(priced[0].edited).toBe(false)
  })
  it('cleanOverrides drops malformed storage data', () => {
    expect(cleanOverrides(null)).toEqual({})
    expect(cleanOverrides('x')).toEqual({})
    expect(
      cleanOverrides({
        ok: { inputPricePer1M: 1, outputPricePer1M: 2 },
        neg: { inputPricePer1M: -1, outputPricePer1M: 2 },
        str: { inputPricePer1M: '1', outputPricePer1M: 2 },
      }),
    ).toEqual({ ok: { inputPricePer1M: 1, outputPricePer1M: 2 } })
  })
  it('lists providers once, in order', () => {
    expect(providers(models)).toEqual(['A', 'B'])
    expect(modelId(models[0])).toBe('A/a1')
  })
})

describe('currency settings', () => {
  it('USD always has rate 1', () => {
    expect(activeRate({ code: 'USD', rates: {} })).toBe(1)
  })
  it('missing or invalid rate gives null, valid rate is parsed', () => {
    expect(activeRate({ code: 'TWD', rates: {} })).toBeNull()
    expect(activeRate({ code: 'TWD', rates: { TWD: { rate: '0', asOf: '' } } })).toBeNull()
    expect(activeRate({ code: 'TWD', rates: { TWD: { rate: '32.5', asOf: '2026-11-16' } } })).toBe(32.5)
  })
  it('cleanCurrencySettings rejects malformed data', () => {
    expect(cleanCurrencySettings(null)).toEqual({ code: 'USD', rates: {} })
    expect(cleanCurrencySettings({ code: 'XXX', rates: { TWD: { rate: 5 } } })).toEqual({ code: 'USD', rates: {} })
    expect(cleanCurrencySettings({ code: 'EUR', rates: { EUR: { rate: '0.9', asOf: 'x' } } })).toEqual({
      code: 'EUR',
      rates: { EUR: { rate: '0.9', asOf: 'x' } },
    })
  })
})

describe('format', () => {
  it('formats money per locale', () => {
    expect(formatMoney(1020, 'USD', 'en-US')).toBe('$1,020.00')
    expect(formatMoney(0.000375, 'USD', 'en-US')).toBe('$0.000375')
    expect(formatMoney(0.2, 'USD', 'en-US')).toBe('$0.20')
    expect(formatMoney(0.075, 'USD', 'en-US')).toBe('$0.075')
    expect(formatMoney(0.0000002, 'USD', 'en-US')).toBe('$0.0000002')
    expect(formatMoney(1234.5, 'TWD', 'zh-TW')).toBe('$1,234.50')
    expect(formatMoney(40.625, 'TWD', 'en-US', true)).toBe('NT$40.625')
    expect(formatMoney(40.625, 'TWD', 'en-US')).toBe('NT$40.63')
    expect(formatMoney(Number.NaN, 'USD', 'en-US')).toBe('–')
  })
  it('formats percent change with a sign', () => {
    expect(formatPercentChange(0.25, 'en-US')).toBe('+25%')
    expect(formatPercentChange(0, 'en-US')).toBe('0%')
  })
})

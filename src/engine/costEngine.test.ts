import { describe, expect, it } from 'vitest'
import { compareCosts, convertFromUsd, estimateCost, MAX_INPUT } from './costEngine'
import models from '../data/models.json'

const allFinite = (obj: object) =>
  Object.values(obj).every((v) => typeof v !== 'number' || Number.isFinite(v))

describe('estimateCost: hand-calculated scenarios', () => {
  it('scenario A: 1,000 users x 20 interactions, 500 in / 200 out at $2.50 / $15', () => {
    const r = estimateCost(
      { monthlyUsers: 1000, interactionsPerUser: 20, avgInputTokens: 500, avgOutputTokens: 200 },
      { inputPricePer1M: 2.5, outputPricePer1M: 15 },
    )
    expect(r.monthlyInteractions).toBe(20_000)
    expect(r.monthlyInputTokens).toBe(10_000_000)
    expect(r.monthlyOutputTokens).toBe(4_000_000)
    expect(r.inputCost).toBeCloseTo(25, 10)
    expect(r.outputCost).toBeCloseTo(60, 10)
    expect(r.monthlyCost).toBeCloseTo(85, 10)
    expect(r.annualCost).toBeCloseTo(1020, 10)
  })

  it('scenario B: 50 users x 100 interactions, 1,200 in / 400 out at $0.20 / $1.25', () => {
    const r = estimateCost(
      { monthlyUsers: 50, interactionsPerUser: 100, avgInputTokens: 1200, avgOutputTokens: 400 },
      { inputPricePer1M: 0.2, outputPricePer1M: 1.25 },
    )
    // 5,000 interactions; 6,000,000 in -> $1.20; 2,000,000 out -> $2.50
    expect(r.monthlyInteractions).toBe(5000)
    expect(r.inputCost).toBeCloseTo(1.2, 10)
    expect(r.outputCost).toBeCloseTo(2.5, 10)
    expect(r.monthlyCost).toBeCloseTo(3.7, 10)
    expect(r.annualCost).toBeCloseTo(44.4, 10)
  })

  it('scenario C: tokenAdjust 1.2 scales input tokens only', () => {
    const r = estimateCost(
      { monthlyUsers: 10_000, interactionsPerUser: 5, avgInputTokens: 2000, avgOutputTokens: 500 },
      { inputPricePer1M: 4, outputPricePer1M: 20, tokenAdjust: 1.2 },
    )
    // 50,000 interactions; 100M in x 1.2 = 120M -> $480; 25M out -> $500
    expect(r.monthlyInputTokens).toBeCloseTo(120_000_000, 4)
    expect(r.monthlyOutputTokens).toBe(25_000_000)
    expect(r.inputCost).toBeCloseTo(480, 8)
    expect(r.outputCost).toBeCloseTo(500, 8)
    expect(r.monthlyCost).toBeCloseTo(980, 8)
    expect(r.annualCost).toBeCloseTo(11_760, 8)
  })

  it('does not round inside the calculation', () => {
    const r = estimateCost(
      { monthlyUsers: 1, interactionsPerUser: 1, avgInputTokens: 1, avgOutputTokens: 0 },
      { inputPricePer1M: 0.2, outputPricePer1M: 0 },
    )
    expect(r.monthlyCost).toBeCloseTo(0.0000002, 15)
  })
})

describe('estimateCost: edge cases', () => {
  const price = { inputPricePer1M: 2.5, outputPricePer1M: 15 }

  it('zero users or zero tokens give zero cost, not NaN', () => {
    const zeroUsers = estimateCost(
      { monthlyUsers: 0, interactionsPerUser: 20, avgInputTokens: 500, avgOutputTokens: 200 },
      price,
    )
    const zeroTokens = estimateCost(
      { monthlyUsers: 100, interactionsPerUser: 20, avgInputTokens: 0, avgOutputTokens: 0 },
      price,
    )
    expect(zeroUsers.monthlyCost).toBe(0)
    expect(zeroTokens.monthlyCost).toBe(0)
    expect(allFinite(zeroUsers) && allFinite(zeroTokens)).toBe(true)
  })

  it('negative, NaN and Infinity inputs are treated as 0', () => {
    const r = estimateCost(
      {
        monthlyUsers: -5,
        interactionsPerUser: Number.NaN,
        avgInputTokens: Number.POSITIVE_INFINITY,
        avgOutputTokens: 100,
      },
      price,
    )
    expect(r.monthlyCost).toBe(0)
    expect(allFinite(r)).toBe(true)
  })

  it('very large volumes stay finite', () => {
    const r = estimateCost(
      { monthlyUsers: 1e15, interactionsPerUser: 1e15, avgInputTokens: 1e15, avgOutputTokens: 1e15 },
      { inputPricePer1M: 1e15, outputPricePer1M: 1e15, tokenAdjust: 1e15 },
    )
    expect(allFinite(r)).toBe(true)
    expect(r.monthlyInteractions).toBe(MAX_INPUT * MAX_INPUT)
  })

  it('missing or invalid tokenAdjust means 1', () => {
    const usage = { monthlyUsers: 10, interactionsPerUser: 10, avgInputTokens: 100, avgOutputTokens: 0 }
    const base = estimateCost(usage, price).monthlyInputTokens
    expect(estimateCost(usage, { ...price, tokenAdjust: 0 }).monthlyInputTokens).toBe(base)
    expect(estimateCost(usage, { ...price, tokenAdjust: Number.NaN }).monthlyInputTokens).toBe(base)
  })
})

describe('compareCosts', () => {
  it('computes % difference vs the cheapest', () => {
    const rows = compareCosts([
      { id: 'a', monthlyCost: 85 },
      { id: 'b', monthlyCost: 3.7 },
      { id: 'c', monthlyCost: 7.4 },
    ])
    expect(rows[1].isCheapest).toBe(true)
    expect(rows[1].differenceVsCheapest).toBe(0)
    expect(rows[2].differenceVsCheapest).toBeCloseTo(1, 10)
    expect(rows[0].differenceVsCheapest).toBeCloseTo((85 - 3.7) / 3.7, 10)
    expect(rows[0].annualCost).toBeCloseTo(1020, 10)
  })

  it('cheapest at 0 gives null difference for others instead of Infinity', () => {
    const rows = compareCosts([
      { id: 'a', monthlyCost: 0 },
      { id: 'b', monthlyCost: 10 },
    ])
    expect(rows[0].differenceVsCheapest).toBe(0)
    expect(rows[1].differenceVsCheapest).toBeNull()
  })

  it('all zero costs are all cheapest', () => {
    const rows = compareCosts([
      { id: 'a', monthlyCost: 0 },
      { id: 'b', monthlyCost: 0 },
    ])
    expect(rows.every((r) => r.isCheapest && r.differenceVsCheapest === 0)).toBe(true)
  })

  it('totals are consistent with estimateCost', () => {
    const usage = { monthlyUsers: 1000, interactionsPerUser: 20, avgInputTokens: 500, avgOutputTokens: 200 }
    const a = estimateCost(usage, { inputPricePer1M: 2.5, outputPricePer1M: 15 })
    const b = estimateCost(usage, { inputPricePer1M: 0.75, outputPricePer1M: 4.5 })
    const rows = compareCosts([
      { id: 'a', monthlyCost: a.monthlyCost },
      { id: 'b', monthlyCost: b.monthlyCost },
    ])
    expect(rows[0].annualCost).toBeCloseTo(a.annualCost, 10)
    expect(rows[1].annualCost).toBeCloseTo(b.annualCost, 10)
  })

  it('empty input gives empty output', () => {
    expect(compareCosts([])).toEqual([])
  })
})

describe('convertFromUsd', () => {
  it('multiplies by the manual rate', () => {
    expect(convertFromUsd(85, 32.5)).toBeCloseTo(2762.5, 10)
  })
  it('returns null when there is no usable rate', () => {
    expect(convertFromUsd(85, null)).toBeNull()
    expect(convertFromUsd(85, undefined)).toBeNull()
    expect(convertFromUsd(85, 0)).toBeNull()
    expect(convertFromUsd(85, -1)).toBeNull()
    expect(convertFromUsd(85, Number.NaN)).toBeNull()
  })
  it('rate 1 returns the USD amount unchanged', () => {
    expect(convertFromUsd(85, 1)).toBe(85)
  })
})

describe('models.json', () => {
  it('every row has the required fields with valid prices', () => {
    expect(models.length).toBeGreaterThan(0)
    for (const m of models as Record<string, unknown>[]) {
      expect(typeof m.provider).toBe('string')
      expect(typeof m.model).toBe('string')
      expect(typeof m.priceAsOf).toBe('string')
      expect(String(m.source)).toMatch(/^https:\/\//)
      expect(Number(m.inputPricePer1M)).toBeGreaterThanOrEqual(0)
      expect(Number(m.outputPricePer1M)).toBeGreaterThanOrEqual(0)
    }
  })
  it('provider/model pairs are unique', () => {
    const keys = models.map((m) => `${m.provider}/${m.model}`)
    expect(new Set(keys).size).toBe(keys.length)
  })
})

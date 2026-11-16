import type { ComparisonRow, CostEstimate, ModelPrice, UsageInput } from './types'

const TOKENS_PER_PRICE_UNIT = 1_000_000
const MONTHS_PER_YEAR = 12
/** Upper bound for any single input, so products of very large inputs stay finite. */
export const MAX_INPUT = 1e12

/** Non-finite or negative values become 0; huge values are capped at MAX_INPUT. */
export function sanitize(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0
  return Math.min(value, MAX_INPUT)
}

/** tokenAdjust defaults to 1; a missing, zero, negative or non-finite value also means 1. */
export function effectiveTokenAdjust(tokenAdjust: number | undefined): number {
  if (tokenAdjust === undefined || !Number.isFinite(tokenAdjust) || tokenAdjust <= 0) return 1
  return Math.min(tokenAdjust, MAX_INPUT)
}

export function estimateCost(usage: UsageInput, price: ModelPrice): CostEstimate {
  const monthlyUsers = sanitize(usage.monthlyUsers)
  const interactionsPerUser = sanitize(usage.interactionsPerUser)
  const avgInputTokens = sanitize(usage.avgInputTokens)
  const avgOutputTokens = sanitize(usage.avgOutputTokens)
  const inputPrice = sanitize(price.inputPricePer1M)
  const outputPrice = sanitize(price.outputPricePer1M)
  const tokenAdjust = effectiveTokenAdjust(price.tokenAdjust)

  const monthlyInteractions = monthlyUsers * interactionsPerUser
  const monthlyInputTokens = monthlyInteractions * avgInputTokens * tokenAdjust
  const monthlyOutputTokens = monthlyInteractions * avgOutputTokens
  const inputCost = (monthlyInputTokens / TOKENS_PER_PRICE_UNIT) * inputPrice
  const outputCost = (monthlyOutputTokens / TOKENS_PER_PRICE_UNIT) * outputPrice
  const monthlyCost = inputCost + outputCost

  return {
    monthlyInteractions,
    monthlyInputTokens,
    monthlyOutputTokens,
    inputCost,
    outputCost,
    monthlyCost,
    annualCost: monthlyCost * MONTHS_PER_YEAR,
  }
}

/** Compares already-estimated models. Works for any count; the UI limits it to 2-4. */
export function compareCosts(rows: { id: string; monthlyCost: number }[]): ComparisonRow[] {
  if (rows.length === 0) return []
  const costs = rows.map((row) => sanitize(row.monthlyCost))
  const cheapest = Math.min(...costs)

  return rows.map((row, index) => {
    const monthlyCost = costs[index]
    let differenceVsCheapest: number | null
    if (monthlyCost === cheapest) differenceVsCheapest = 0
    else if (cheapest === 0) differenceVsCheapest = null
    else differenceVsCheapest = (monthlyCost - cheapest) / cheapest

    return {
      id: row.id,
      monthlyCost,
      annualCost: monthlyCost * MONTHS_PER_YEAR,
      differenceVsCheapest,
      isCheapest: monthlyCost === cheapest,
    }
  })
}

/** USD amount in the display currency. Returns null when there is no usable rate (missing, 0, negative, NaN). */
export function convertFromUsd(amountUsd: number, rate: number | null | undefined): number | null {
  if (rate === null || rate === undefined || !Number.isFinite(rate) || rate <= 0) return null
  if (!Number.isFinite(amountUsd)) return null
  return amountUsd * rate
}

/**
 * Share of the monthly cost that comes from input and from output tokens, as fractions (0 to 1).
 * Both are 0 when the total is 0 or not finite, so the UI never divides by zero.
 */
export function costShare(estimate: Pick<CostEstimate, 'inputCost' | 'outputCost'>): {
  inputShare: number
  outputShare: number
} {
  const input = sanitize(estimate.inputCost)
  const output = sanitize(estimate.outputCost)
  const total = input + output
  if (!(total > 0) || !Number.isFinite(total)) return { inputShare: 0, outputShare: 0 }
  return { inputShare: input / total, outputShare: output / total }
}

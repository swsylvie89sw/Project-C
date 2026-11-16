/** One row of src/data/models.json. Prices are USD per 1M tokens. */
export interface ModelInfo {
  provider: string
  model: string
  inputPricePer1M: number
  outputPricePer1M: number
  priceAsOf: string
  source: string
  /** Multiplier on input tokens for providers whose tokenizer counts differently. Default 1. */
  tokenAdjust?: number
}

export interface ModelPrice {
  inputPricePer1M: number
  outputPricePer1M: number
  tokenAdjust?: number
}

export interface UsageInput {
  monthlyUsers: number
  interactionsPerUser: number
  avgInputTokens: number
  avgOutputTokens: number
}

export interface CostEstimate {
  monthlyInteractions: number
  monthlyInputTokens: number
  monthlyOutputTokens: number
  inputCost: number
  outputCost: number
  monthlyCost: number
  annualCost: number
}

export interface ComparisonRow {
  id: string
  monthlyCost: number
  annualCost: number
  /** (cost - cheapest) / cheapest as a fraction; null when the cheapest costs 0 and this one does not. */
  differenceVsCheapest: number | null
  isCheapest: boolean
}

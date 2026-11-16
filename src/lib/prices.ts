import type { ModelInfo } from '../engine/types'

export interface PriceOverride {
  inputPricePer1M: number
  outputPricePer1M: number
}

export type PriceOverrides = Record<string, PriceOverride>

export interface PricedModel extends ModelInfo {
  id: string
  edited: boolean
}

export function modelId(model: Pick<ModelInfo, 'provider' | 'model'>): string {
  return `${model.provider}/${model.model}`
}

function isValidPrice(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

/** Default prices with the user's saved overrides applied. Invalid overrides are ignored. */
export function applyOverrides(models: ModelInfo[], overrides: PriceOverrides): PricedModel[] {
  return models.map((model) => {
    const id = modelId(model)
    const override = overrides[id]
    if (override && isValidPrice(override.inputPricePer1M) && isValidPrice(override.outputPricePer1M)) {
      const edited =
        override.inputPricePer1M !== model.inputPricePer1M ||
        override.outputPricePer1M !== model.outputPricePer1M
      return { ...model, ...override, id, edited }
    }
    return { ...model, id, edited: false }
  })
}

/** Keeps only well-formed overrides from untrusted storage data. */
export function cleanOverrides(raw: unknown): PriceOverrides {
  if (!raw || typeof raw !== 'object') return {}
  const result: PriceOverrides = {}
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    const v = value as Partial<PriceOverride> | null
    if (v && isValidPrice(v.inputPricePer1M) && isValidPrice(v.outputPricePer1M)) {
      result[id] = { inputPricePer1M: v.inputPricePer1M, outputPricePer1M: v.outputPricePer1M }
    }
  }
  return result
}

export function providers(models: ModelInfo[]): string[] {
  return [...new Set(models.map((m) => m.provider))]
}

import type { UsageInput } from '../engine/types'
import { MAX_TOKENIZER_CHARS } from './guideConfig'

const safe = (value: number) => (Number.isFinite(value) && value > 0 ? value : 0)

/** Text actually sent to the tokenizer: the first MAX_TOKENIZER_CHARS characters. */
export function capText(text: string, max = MAX_TOKENIZER_CHARS): { text: string; truncated: boolean } {
  return text.length > max ? { text: text.slice(0, max), truncated: true } : { text, truncated: false }
}

/** Input tokens per request = system prompt + user input + background context. */
export function inputTokensPerRequest(parts: { systemPrompt: number; userInput: number; context: number }): number {
  return safe(parts.systemPrompt) + safe(parts.userInput) + safe(parts.context)
}

/** Output tokens per request = response length (words or characters) x tokens per unit. */
export function outputTokensFromLength(length: number, tokensPerUnit: number): number {
  return safe(length) * safe(tokensPerUnit)
}

export type VolumeMode = 'daily' | 'monthly'

export interface VolumeInput {
  people: number
  requestsPerDay: number
  daysPerMonth: number
  requestsPerMonth: number
}

/**
 * Daily: monthly users = people; interactions per user = requests per day x days per month.
 * Monthly: monthly users = people; interactions per user = requests per month.
 */
export function volumeToUsage(
  mode: VolumeMode,
  volume: VolumeInput,
): Pick<UsageInput, 'monthlyUsers' | 'interactionsPerUser'> {
  const monthlyUsers = safe(volume.people)
  const interactionsPerUser =
    mode === 'daily' ? safe(volume.requestsPerDay) * safe(volume.daysPerMonth) : safe(volume.requestsPerMonth)
  return { monthlyUsers, interactionsPerUser }
}

/**
 * The four estimator fields filled by "Apply to estimator". Token counts are rounded up to whole
 * tokens here because they are handed to the form as whole numbers; nothing downstream re-rounds.
 */
export function guideToUsage(
  inputTokens: number,
  outputTokens: number,
  mode: VolumeMode,
  volume: VolumeInput,
): UsageInput {
  return {
    ...volumeToUsage(mode, volume),
    avgInputTokens: Math.ceil(safe(inputTokens)),
    avgOutputTokens: Math.ceil(safe(outputTokens)),
  }
}

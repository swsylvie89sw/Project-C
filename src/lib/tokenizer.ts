/** Lazy-loads gpt-tokenizer so it is only downloaded when the guided panel needs it. */
export type CountTokens = (text: string) => number

let pending: Promise<CountTokens> | null = null

export function loadTokenizer(): Promise<CountTokens> {
  if (!pending) {
    pending = import('gpt-tokenizer')
      .then((mod) => (text: string) => (text ? mod.countTokens(text) : 0))
      .catch((error: unknown) => {
        pending = null
        throw error
      })
  }
  return pending
}

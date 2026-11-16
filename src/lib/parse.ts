/** Parses a user-typed number. Returns null when empty, not a number, negative or not finite. */
export function parseNonNegative(text: string): number | null {
  const cleaned = text.trim().replace(/,/g, '')
  if (cleaned === '') return null
  if (!/^\d*\.?\d+$|^\d+\.$/.test(cleaned)) return null
  const value = Number(cleaned)
  return Number.isFinite(value) && value >= 0 ? value : null
}

/** Like parseNonNegative but 0 is also rejected (exchange rates). */
export function parsePositive(text: string): number | null {
  const value = parseNonNegative(text)
  return value !== null && value > 0 ? value : null
}

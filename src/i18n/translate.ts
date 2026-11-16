import { en, type MessageKey } from './en'
import { zhTW } from './zhTW'

export type Lang = 'en' | 'zh-TW'
export type Vars = Record<string, string | number>

export const LANGS: Lang[] = ['en', 'zh-TW']

export const dictionaries: Record<Lang, Record<MessageKey, string>> = { en, 'zh-TW': zhTW }

/** Locale used for number and currency formatting. */
export const numberLocale: Record<Lang, string> = { en: 'en-US', 'zh-TW': 'zh-TW' }

/** Value for <html lang>. */
export const htmlLang: Record<Lang, string> = { en: 'en', 'zh-TW': 'zh-Hant-TW' }

export function isLang(value: unknown): value is Lang {
  return value === 'en' || value === 'zh-TW'
}

/** Looks up a key and fills {placeholders}. Falls back to English, then to the key itself. */
export function translate(lang: Lang, key: MessageKey, vars?: Vars): string {
  const template = dictionaries[lang][key] ?? en[key] ?? key
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  )
}

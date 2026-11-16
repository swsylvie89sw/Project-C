import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { MessageKey } from './en'
import { htmlLang, isLang, numberLocale, translate, type Lang, type Vars } from './translate'
import { readJson, writeJson } from '../lib/storage'

export type { Lang, MessageKey }

const LANG_KEY = 'roiSim.lang'

interface I18nValue {
  lang: Lang
  locale: string
  setLang: (lang: Lang) => void
  t: (key: MessageKey, vars?: Vars) => string
}

const I18nContext = createContext<I18nValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = readJson<unknown>(LANG_KEY, 'en')
    return isLang(saved) ? saved : 'en'
  })

  useEffect(() => {
    document.documentElement.lang = htmlLang[lang]
    document.title = translate(lang, 'app.title')
  }, [lang])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    writeJson(LANG_KEY, next)
  }, [])

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      locale: numberLocale[lang],
      setLang,
      t: (key, vars) => translate(lang, key, vars),
    }),
    [lang, setLang],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext)
  if (!value) throw new Error('useI18n must be used inside I18nProvider')
  return value
}

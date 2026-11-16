import { useI18n, type Lang } from '../i18n'

// The toggle labels are the language names themselves, shown the same in both interfaces.
const OPTIONS: { lang: Lang; label: string }[] = [
  { lang: 'en', label: 'EN' },
  { lang: 'zh-TW', label: '繁中' },
]

export function LanguageToggle() {
  const { lang, setLang, t } = useI18n()
  return (
    <div role="group" aria-label={t('lang.label')} className="inline-flex items-center text-sm">
      {OPTIONS.map((option, index) => (
        <span key={option.lang} className="inline-flex items-center">
          {index > 0 && <span className="px-1 text-slate-400" aria-hidden="true">|</span>}
          <button
            type="button"
            onClick={() => setLang(option.lang)}
            aria-pressed={lang === option.lang}
            lang={option.lang === 'en' ? 'en' : 'zh-Hant-TW'}
            className={`rounded px-1.5 py-0.5 ${
              lang === option.lang ? 'font-semibold text-indigo-700 underline underline-offset-4' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {option.label}
          </button>
        </span>
      ))}
    </div>
  )
}

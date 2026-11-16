import { useI18n, type Lang } from '../i18n'

// The toggle labels are the language names themselves, shown the same in both interfaces.
const OPTIONS: { lang: Lang; label: string }[] = [
  { lang: 'en', label: 'EN' },
  { lang: 'zh-TW', label: '繁中' },
]

export function LanguageToggle() {
  const { lang, setLang, t } = useI18n()
  return (
    <div role="group" aria-label={t('lang.label')} className="glass-strong inline-flex items-center rounded-full p-0.5 text-sm">
      {OPTIONS.map((option, index) => (
        <span key={option.lang} className="inline-flex items-center">
          {index > 0 && <span className="px-0.5 text-slate-400" aria-hidden="true">|</span>}
          <button
            type="button"
            onClick={() => setLang(option.lang)}
            aria-pressed={lang === option.lang}
            lang={option.lang === 'en' ? 'en' : 'zh-Hant-TW'}
            className={`min-h-8 cursor-pointer rounded-full px-3 py-1 transition-colors duration-150 ${
              lang === option.lang ? 'bg-blue-600 font-semibold text-white shadow-sm' : 'text-slate-700 hover:bg-white hover:text-slate-900'
            }`}
          >
            {option.label}
          </button>
        </span>
      ))}
    </div>
  )
}

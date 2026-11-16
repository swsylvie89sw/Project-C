import { useI18n } from '../i18n'
import { Card, inputClass, invalidInputClass } from './ui'

export interface UseCase {
  name: string
  description: string
}

export function UseCaseSection({ value, onChange }: { value: UseCase; onChange: (value: UseCase) => void }) {
  const { t } = useI18n()
  const missingName = value.name.trim() === ''
  return (
    <Card title={t('useCase.heading')}>
      <div className="space-y-3">
        <div>
          <label htmlFor="useCaseName" className="mb-1 block text-sm font-medium text-slate-700">
            {t('useCase.name')} <span className="text-red-600" aria-hidden="true">*</span>
          </label>
          <input
            id="useCaseName"
            required
            value={value.name}
            placeholder={t('useCase.namePlaceholder')}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
            aria-invalid={missingName || undefined}
            className={`${inputClass} ${missingName ? invalidInputClass : ''}`}
          />
          {missingName && <p className="mt-1 text-xs text-red-600">{t('useCase.nameRequired')}</p>}
        </div>
        <div>
          <label htmlFor="useCaseDescription" className="mb-1 block text-sm font-medium text-slate-700">
            {t('useCase.description')}
          </label>
          <textarea
            id="useCaseDescription"
            rows={2}
            value={value.description}
            placeholder={t('useCase.descriptionPlaceholder')}
            onChange={(e) => onChange({ ...value, description: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>
    </Card>
  )
}

import type { UsageInput } from '../engine/types'
import { useI18n, type MessageKey } from '../i18n'
import { parseNonNegative } from '../lib/parse'
import { Card, NumberField, Tag } from './ui'

export type UsageField = keyof UsageInput
export type UsageText = Record<UsageField, string>

export const USAGE_FIELDS: { field: UsageField; label: MessageKey }[] = [
  { field: 'monthlyUsers', label: 'usage.monthlyUsers' },
  { field: 'interactionsPerUser', label: 'usage.interactionsPerUser' },
  { field: 'avgInputTokens', label: 'usage.avgInputTokens' },
  { field: 'avgOutputTokens', label: 'usage.avgOutputTokens' },
]

interface Props {
  usage: UsageText
  fromGuide: ReadonlySet<UsageField>
  onChange: (field: UsageField, value: string) => void
}

export function UsageSection({ usage, fromGuide, onChange }: Props) {
  const { t } = useI18n()
  return (
    <Card title={t('usage.heading')}>
      <div className="grid gap-3 sm:grid-cols-2">
        {USAGE_FIELDS.map(({ field, label }) => (
          <NumberField
            key={field}
            id={field}
            label={t(label)}
            value={usage[field]}
            onChange={(value) => onChange(field, value)}
            invalid={parseNonNegative(usage[field]) === null}
            errorText={t('usage.invalid')}
            tag={fromGuide.has(field) ? <Tag>{t('guide.fromGuide')}</Tag> : undefined}
          />
        ))}
      </div>
    </Card>
  )
}

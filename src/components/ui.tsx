import type { ReactNode } from 'react'

export const inputClass =
  'w-full rounded-lg border border-slate-300/80 bg-white/90 px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors duration-150 placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100'

export const invalidInputClass = 'border-red-500 focus:border-red-600 focus:ring-red-100'

export const buttonClass =
  'inline-flex min-h-9 cursor-pointer items-center justify-center rounded-lg border border-slate-300/80 bg-white/80 px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-colors duration-150 hover:border-slate-400 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50'

export const primaryButtonClass =
  'inline-flex min-h-10 cursor-pointer items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-colors duration-150 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50'

export function Card({
  title,
  children,
  aside,
  icon,
}: {
  title: string
  children: ReactNode
  aside?: ReactNode
  icon?: ReactNode
}) {
  return (
    <section className="glass rounded-2xl p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2.5 text-lg font-semibold tracking-tight text-slate-900">
          {icon && (
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600/10 text-blue-700 ring-1 ring-blue-600/15">
              {icon}
            </span>
          )}
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  )
}

export function Tag({ children, tone = 'indigo' }: { children: ReactNode; tone?: 'indigo' | 'amber' | 'emerald' }) {
  const tones = {
    indigo: 'bg-blue-50 text-blue-700 ring-blue-200',
    amber: 'bg-amber-50 text-amber-800 ring-amber-200',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${tones[tone]}`}>
      {children}
    </span>
  )
}

export function Notice({ children, tone = 'amber' }: { children: ReactNode; tone?: 'amber' | 'slate' }) {
  const tones = {
    amber: 'border-amber-200 bg-amber-50/90 text-amber-900',
    slate: 'border-slate-200 bg-slate-50/80 text-slate-700',
  }
  return <p className={`rounded-lg border px-3 py-2 text-sm ${tones[tone]}`}>{children}</p>
}

interface NumberFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  invalid?: boolean
  errorText?: string
  tag?: ReactNode
  hint?: string
}

export function NumberField({ id, label, value, onChange, invalid, errorText, tag, hint }: NumberFieldProps) {
  return (
    <div>
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
        </label>
        {tag}
      </div>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `${id}-error` : undefined}
        className={`${inputClass} ${invalid ? invalidInputClass : ''}`}
      />
      {hint && !invalid && <p className="mt-1 text-xs text-slate-600">{hint}</p>}
      {invalid && errorText && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-600">
          {errorText}
        </p>
      )}
    </div>
  )
}

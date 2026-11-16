import type { ReactNode } from 'react'

export const inputClass =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-slate-100'

export const invalidInputClass = 'border-red-400 focus:border-red-500 focus:ring-red-200'

export const buttonClass =
  'inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'

export const primaryButtonClass =
  'inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50'

export function Card({ title, children, aside }: { title: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  )
}

export function Tag({ children, tone = 'indigo' }: { children: ReactNode; tone?: 'indigo' | 'amber' | 'emerald' }) {
  const tones = {
    indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
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
    amber: 'border-amber-200 bg-amber-50 text-amber-900',
    slate: 'border-slate-200 bg-slate-50 text-slate-700',
  }
  return <p className={`rounded-md border px-3 py-2 text-sm ${tones[tone]}`}>{children}</p>
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
      {hint && !invalid && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {invalid && errorText && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-600">
          {errorText}
        </p>
      )}
    </div>
  )
}

import { sanitizeDecimalTyping } from '../lib/decimalInput'

interface NumberFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  min?: number
  max?: number
  step?: number
  unit?: string
  id?: string
}

export function NumberField({
  label,
  value,
  onChange,
  required,
  min,
  max,
  step: _step = 0.1,
  unit,
  id,
}: NumberFieldProps) {
  const inputId = id ?? label.replace(/\s+/g, '-').toLowerCase()
  return (
    <label htmlFor={inputId} className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
        {required ? ' *' : ''}
        {unit ? ` (${unit})` : ''}
      </span>
      <input
        id={inputId}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        enterKeyHint="done"
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
        value={value}
        onChange={(e) => onChange(sanitizeDecimalTyping(e.target.value))}
        required={required}
        aria-valuemin={min}
        aria-valuemax={max}
        placeholder="0"
      />
    </label>
  )
}

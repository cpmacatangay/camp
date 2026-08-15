import { useId } from 'react'
import RequiredBadge from '../RequiredBadge'

export default function TextAreaField({ label, value, onChange, onBlur, error, required, rows = 2, showBadge = true }) {
  const id = useId()
  const inputClass = `w-full border rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-pine-500 ${
    error ? 'border-red-400 bg-red-50' : 'border-gray-300'
  }`

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && showBadge && !value && <RequiredBadge />}
      </label>
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={inputClass}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && <p id={`${id}-error`} className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  )
}

import RequiredBadge from '../RequiredBadge'

export default function TextAreaField({ label, value, onChange, error, required, rows = 2 }) {
  const inputClass = `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
    error ? 'border-red-400 bg-red-50' : 'border-gray-300'
  }`

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <RequiredBadge />}
      </label>
      <textarea
        rows={rows}
        value={value}
        onChange={onChange}
        className={inputClass}
        required={required}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

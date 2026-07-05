export default function DateField({ label, value, onChange, error, required }) {
  const inputClass = `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
    error ? 'border-red-400 bg-red-50' : 'border-gray-300'
  }`

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && !value && <span className="text-[10px] leading-none font-medium text-rose-500 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-full ml-1.5 align-middle">Required</span>}
      </label>
      <input
        type="date"
        value={value}
        onChange={onChange}
        className={inputClass}
        required={required}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

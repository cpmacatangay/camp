import TextField from './TextField'

export default function ParentsFieldset({ values, onChange, errors, onBlur }) {
  const fields = [
    { name: 'fatherName', label: "Father's Name" },
    { name: 'fatherContact', label: "Father's Contact" },
    { name: 'motherName', label: "Mother's Name" },
    { name: 'motherContact', label: "Mother's Contact" },
  ]

  return (
    <div>
      <p className="text-base font-semibold text-gray-800 mb-3">Parents / Guardian Information</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((f) => (
          <TextField
            key={f.name}
            label={f.label}
            value={values[f.name]}
            onChange={onChange(f.name)}
            onBlur={onBlur ? () => onBlur(f.name) : undefined}
            error={errors?.[f.name]}
            required
          />
        ))}
      </div>
    </div>
  )
}

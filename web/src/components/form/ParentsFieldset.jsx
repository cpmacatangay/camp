import TextField from './TextField'

export default function ParentsFieldset({ values, onChange, errors, onBlur }) {
  const fields = [
    { name: 'fatherName', label: "Father's Name" },
    { name: 'fatherContact', label: "Father's Contact" },
    { name: 'motherName', label: "Mother's Name" },
    { name: 'motherContact', label: "Mother's Contact" },
  ]

  return (
    <fieldset className="border rounded-lg p-4">
      <legend className="text-sm font-medium text-gray-700 px-2">Parents / Guardian Information</legend>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
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
    </fieldset>
  )
}

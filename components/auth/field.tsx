type FieldProps = {
  label: string
  type?: string
  required?: boolean
}

export default function Field({
  label,
  type = 'text',
  required = true,
}: FieldProps) {
  return (
    <label className="block text-sm font-semibold text-primary">
      {label}

      <input
        required={required}
        type={type}
        className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-3 font-normal outline-none ring-accent focus:ring-2"
      />
    </label>
  )
}

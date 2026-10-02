// Label + input + error, all linked for screen readers
export default function FormField({ id, label, type = "text", value, onChange, error, ...rest }) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block font-medium mb-1">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${id}-error` : undefined}
        className="w-full border border-gray-500 rounded px-3 py-2 min-h-11 bg-white"
        {...rest}
      />
      {error && (
        <p id={`${id}-error`} className="text-red-700 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}

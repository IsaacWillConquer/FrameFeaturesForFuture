// Label + input + error, all linked for screen readers
export default function FormField({ id, label, type = "text", value, onChange, error, hint, ...rest }) {
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block font-medium mb-1 text-fg">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={describedBy}
        className="w-full rounded-lg border border-border bg-surface px-3 py-2 min-h-11 text-fg placeholder:text-fg-muted"
        {...rest}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-sm text-fg-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

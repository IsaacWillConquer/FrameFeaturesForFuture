// Zero-dependency bar chart (flex divs, no chart library). Data: [{ label, value }].
// Rendered as role="img" with a text summary so screen readers get the numbers too.
export default function BarChart({ data, height = 140, title = "Bar chart" }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const summary = data.map((d) => `${d.label}: ${d.value}`).join(", ");
  return (
    <div>
      <div
        role="img"
        aria-label={`${title}. ${summary}`}
        className="flex items-end gap-2"
        style={{ height }}
      >
        {data.map((d) => (
          <div key={d.label} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
            <span className="text-xs text-fg-muted">{d.value}</span>
            <div
              className="w-full rounded-t bg-primary"
              style={{ height: `${Math.max((d.value / max) * 100, d.value > 0 ? 4 : 1)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-2">
        {data.map((d) => (
          <span key={d.label} className="min-w-0 flex-1 truncate text-center text-xs text-fg-muted">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

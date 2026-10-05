import { cx } from "./cx";

// Tabs with proper ARIA roles. tabs: [{ id, label, content }]
export default function Tabs({ tabs, active, onChange, className }) {
  const current = active ?? tabs[0]?.id;
  return (
    <div className={className}>
      <div role="tablist" aria-label="Sections" className="flex flex-wrap gap-1 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={current === t.id}
            aria-controls={`panel-${t.id}`}
            onClick={() => onChange?.(t.id)}
            className={cx(
              "-mb-px border-b-2 px-4 py-2 min-h-11 text-sm font-medium",
              current === t.id ? "border-primary text-primary" : "border-transparent text-fg-muted hover:text-fg"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t) =>
        current === t.id ? (
          <div key={t.id} role="tabpanel" id={`panel-${t.id}`} aria-labelledby={`tab-${t.id}`} className="pt-4">
            {t.content}
          </div>
        ) : null
      )}
    </div>
  );
}

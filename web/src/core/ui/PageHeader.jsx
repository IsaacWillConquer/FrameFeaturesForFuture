import { cx } from "./cx";

// Page heading used at the top of every screen. optional actions on the right.
export default function PageHeader({ title, description, actions, className }) {
  return (
    <div className={cx("mb-6 flex flex-wrap items-start justify-between gap-3", className)}>
      <div>
        <h1 className="text-2xl font-bold text-fg">{title}</h1>
        {description && <p className="mt-1 text-fg-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

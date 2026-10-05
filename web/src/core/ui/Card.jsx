import { cx } from "./cx";

export default function Card({ children, className, as: Tag = "section" }) {
  return (
    <Tag className={cx("rounded-xl border border-border bg-surface shadow-sm", className)}>{children}</Tag>
  );
}

export function CardHeader({ title, description, actions, className }) {
  return (
    <div className={cx("flex flex-wrap items-start justify-between gap-3 border-b border-border p-4", className)}>
      <div>
        <h2 className="text-base font-semibold text-fg">{title}</h2>
        {description && <p className="text-sm text-fg-muted mt-0.5">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function CardBody({ children, className }) {
  return <div className={cx("p-4", className)}>{children}</div>;
}

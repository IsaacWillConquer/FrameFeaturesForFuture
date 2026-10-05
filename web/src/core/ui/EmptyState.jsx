import { cx } from "./cx";

export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cx("flex flex-col items-center justify-center gap-2 p-8 text-center", className)}>
      {Icon && <Icon aria-hidden="true" className="h-8 w-8 text-fg-muted" />}
      <p className="font-medium text-fg">{title}</p>
      {description && <p className="text-sm text-fg-muted max-w-sm">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

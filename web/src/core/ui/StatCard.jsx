import Card from "./Card";
import Badge from "./Badge";
import { cx } from "./cx";

// Dashboard metric tile. icon is a lucide-react component.
export default function StatCard({ label, value, icon: Icon, hint, variant }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-fg-muted">{label}</p>
        {Icon && <Icon aria-hidden="true" className="h-5 w-5 text-fg-muted" />}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <p className={cx("text-2xl font-semibold text-fg")}>{value}</p>
        {variant && <Badge variant={variant}>{hint}</Badge>}
      </div>
      {hint && !variant && <p className="mt-1 text-xs text-fg-muted">{hint}</p>}
    </Card>
  );
}

import { cx } from "./cx";
import Spinner from "./Spinner";

// A small icon-only or text button. Keep the accessible name on the caller
// if there is no visible text (aria-label).
export default function IconButton({ children, label, className, ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-lg border border-border",
        "bg-surface text-fg hover:bg-surface-2 min-h-11 min-w-11",
        "disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function LoadingButton({ children, busy, className, ...props }) {
  return (
    <button
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-fg",
        "px-4 py-2 min-h-11 font-medium hover:bg-primary-hover disabled:opacity-50",
        className
      )}
      disabled={busy}
      {...props}
    >
      {busy && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
}

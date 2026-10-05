import { cx } from "./cx";

// Accessible loading indicator. role="status" so screen readers hear it.
export default function Spinner({ className, label = "Loading" }) {
  return (
    <span role="status" aria-label={label} className={cx("inline-block animate-spin h-5 w-5 text-current", className)}>
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
        <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </svg>
    </span>
  );
}

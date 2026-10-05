import { cx } from "./cx";

// Plain text input styled with the design tokens.
export default function Input({ className, ...props }) {
  return (
    <input
      className={cx(
        "w-full rounded-lg border border-border bg-surface px-3 py-2 min-h-11 text-fg placeholder:text-fg-muted",
        className
      )}
      {...props}
    />
  );
}

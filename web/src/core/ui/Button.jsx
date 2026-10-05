import { cx } from "./cx";

// Variants: primary (default), secondary, danger, ghost.
const VARIANTS = {
  primary: "bg-primary text-primary-fg hover:bg-primary-hover border border-transparent",
  secondary: "bg-surface text-fg border border-border hover:bg-surface-2",
  danger: "bg-danger text-white border border-transparent hover:opacity-90",
  ghost: "bg-transparent text-fg border border-transparent hover:bg-surface-2",
};

export default function Button({ children, variant = "primary", className, ...props }) {
  return (
    <button
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 min-h-11 font-medium",
        "disabled:opacity-50",
        VARIANTS[variant] || VARIANTS.primary,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

import { cx } from "./cx";

// Colored pill. variant: neutral (default), primary, success, danger, warning.
export default function Badge({ children, variant = "neutral", className }) {
  const styles = {
    neutral: "bg-surface-2 text-fg-muted border-border",
    primary: "bg-primary text-primary-fg border-transparent",
    success: "bg-success/15 text-success border-success/30",
    danger: "bg-danger/15 text-danger border-danger/30",
    warning: "bg-warning/15 text-warning border-warning/30",
  };
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles[variant] || styles.neutral,
        className
      )}
    >
      {children}
    </span>
  );
}

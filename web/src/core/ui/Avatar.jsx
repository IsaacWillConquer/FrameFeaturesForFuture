import { cx } from "./cx";

export default function Avatar({ name, size = "md", className }) {
  const initial = (name || "?").trim().charAt(0).toUpperCase();
  const sizes = { sm: "h-8 w-8 text-sm", md: "h-10 w-10 text-base", lg: "h-12 w-12 text-lg" };
  return (
    <span
      aria-hidden="true"
      className={cx(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-primary text-primary-fg font-semibold",
        sizes[size] || sizes.md,
        className
      )}
    >
      {initial}
    </span>
  );
}

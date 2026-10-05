import { cx } from "./cx";

// Table primitives. Wrap in <TableWrap> for horizontal scroll on small screens.
export function TableWrap({ children, className }) {
  return <div className={cx("w-full overflow-x-auto rounded-xl border border-border", className)}>{children}</div>;
}

export default function Table({ children, className, caption }) {
  return (
    <table className={cx("w-full text-left text-sm", className)}>
      {caption && <caption className="sr-only">{caption}</caption>}
      {children}
    </table>
  );
}

export function Th({ children, className, ...props }) {
  return (
    <th scope="col" className={cx("border-b border-border bg-surface-2 p-3 font-semibold text-fg whitespace-nowrap", className)} {...props}>
      {children}
    </th>
  );
}

export function Td({ children, className }) {
  return <td className={cx("border-b border-border p-3 text-fg", className)}>{children}</td>;
}

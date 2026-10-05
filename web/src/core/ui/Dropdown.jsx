import { useEffect, useRef, useState } from "react";
import { cx } from "./cx";

// Accessible dropdown menu. `trigger` is the button content; `label` names it.
// items: [{ label, onClick, icon, danger }]
export default function Dropdown({ label, trigger, items, align = "right", className }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const itemRefs = useRef([]);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function focusItem(index) {
    const list = itemRefs.current.filter(Boolean);
    if (!list.length) return;
    const i = (index + list.length) % list.length;
    list[i].focus();
  }

  return (
    <div ref={wrapRef} className={cx("relative", className)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            requestAnimationFrame(() => focusItem(0));
          }
        }}
        className="inline-flex items-center gap-2 rounded-lg px-2 py-1 min-h-11 hover:bg-surface-2"
      >
        {trigger}
      </button>

      {open && (
        <div
          role="menu"
          aria-label={label}
          tabIndex={-1}
          className={cx(
            "absolute z-40 mt-1 min-w-[12rem] rounded-lg border border-border bg-surface p-1 shadow-lg",
            align === "right" ? "right-0" : "left-0"
          )}
          onKeyDown={(e) => {
            const list = itemRefs.current.filter(Boolean);
            const idx = list.indexOf(document.activeElement);
            if (e.key === "ArrowDown") {
              e.preventDefault();
              focusItem(idx + 1);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              focusItem(idx - 1);
            }
          }}
        >
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                ref={(el) => (itemRefs.current[i] = el)}
                role="menuitem"
                type="button"
                onClick={() => {
                  setOpen(false);
                  item.onClick?.();
                }}
                className={cx(
                  "flex w-full items-center gap-2 rounded-md px-3 py-2 min-h-11 text-left text-sm hover:bg-surface-2",
                  item.danger ? "text-danger" : "text-fg"
                )}
              >
                {Icon && <Icon aria-hidden="true" className="h-4 w-4" />}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

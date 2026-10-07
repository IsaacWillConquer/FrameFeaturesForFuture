import { useEffect, useRef } from "react";
import { cx } from "./cx";
import Button from "./Button";

// Uses the native <dialog> element: focus trap, Esc to close, backdrop for free.
export default function Modal({ open, onClose, title, children, className }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    // Esc is handled by onCancel; the click handler only closes on backdrop clicks.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onClose?.();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose?.();
      }}
      className={cx("w-[min(92vw,32rem)] rounded-xl border border-border bg-surface p-0 text-fg backdrop:bg-black/50", className)}
    >
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button type="button" onClick={onClose} aria-label="Close"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-fg-muted hover:bg-surface-2">
          ✕
        </button>
      </div>
      <div className="p-4">{children}</div>
    </dialog>
  );
}

export function ConfirmDialog({ open, title, message, confirmLabel = "Confirm", onConfirm, onCancel }) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="mb-4 text-fg">{message}</p>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

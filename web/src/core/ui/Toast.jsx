import { createContext, useCallback, useContext, useState } from "react";
import { cx } from "./cx";

const ToastContext = createContext(null);

let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message, type = "info") => {
      const id = nextId++;
      setToasts((list) => [...list, { id, message, type }]);
      setTimeout(() => dismiss(id), 5000);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div aria-live="polite" aria-atomic="true" className="fixed bottom-4 right-4 z-50 flex w-[min(92vw,22rem)] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cx(
              "flex items-start justify-between gap-3 rounded-lg border-l-4 p-3 shadow-lg bg-surface text-fg",
              t.type === "success" && "border-success",
              t.type === "error" && "border-danger",
              t.type === "info" && "border-primary"
            )}
          >
            <span className="text-sm">{t.message}</span>
            <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss" className="text-fg-muted hover:text-fg">
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx.toast;
}

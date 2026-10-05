import { NavLink } from "react-router-dom";
import { X } from "lucide-react";
import { NAV, hasRole, APP_NAME, APP_TAGLINE } from "../../config/appConfig";
import { useAuth } from "../auth/AuthProvider";
import { cx } from "../ui/cx";

// Sidebar navigation. On desktop it is always visible; on mobile it is a drawer.
export default function Sidebar({ open, onClose }) {
  const { role } = useAuth();
  const visible = NAV.filter((item) => hasRole(role, item.minRole));

  const groups = [];
  for (const item of visible) {
    const g = groups.find((x) => x.name === item.group);
    if (g) g.items.push(item);
    else groups.push({ name: item.group, items: [item] });
  }

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" aria-hidden="true" onClick={onClose} />}
      <aside
        aria-label="Sidebar"
        className={cx(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-surface transition-transform print:hidden",
          "lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <p className="text-lg font-bold text-fg">{APP_NAME}</p>
            <p className="text-xs text-fg-muted">{APP_TAGLINE}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close menu" className="rounded-md p-2 text-fg-muted hover:bg-surface-2 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label="Main" className="flex-1 overflow-y-auto p-3">
          {groups.map((group) => (
            <div key={group.name} className="mb-4">
              <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-fg-muted">{group.name}</p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        onClick={onClose}
                        className={({ isActive }) =>
                          cx(
                            "flex items-center gap-3 rounded-lg px-3 py-2 min-h-11 text-sm font-medium",
                            isActive ? "bg-primary text-primary-fg" : "text-fg-muted hover:bg-surface-2 hover:text-fg"
                          )
                        }
                      >
                        <Icon aria-hidden="true" className="h-5 w-5 shrink-0" />
                        {item.label}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}

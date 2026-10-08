import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import IdleGuard from "../security/IdleGuard";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout() {
  const { user } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile drawer whenever the route changes
  // (render-phase adjustment: react.dev/learn/you-might-not-need-an-effect)
  const [lastPath, setLastPath] = useState(location.pathname);
  if (location.pathname !== lastPath) {
    setLastPath(location.pathname);
    setMenuOpen(false);
  }

  return (
    <div className="flex min-h-screen bg-canvas text-fg">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-surface focus:px-3 focus:py-2 focus:rounded print:hidden"
      >
        Skip to main content
      </a>

      {user && <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />}

      <div className="flex min-w-0 flex-1 flex-col">
        {user && <Topbar onMenuClick={() => setMenuOpen(true)} />}
        {user && <IdleGuard />}

        <main id="main" className="flex-1 p-4 sm:p-6">
          <div className="mx-auto w-full max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

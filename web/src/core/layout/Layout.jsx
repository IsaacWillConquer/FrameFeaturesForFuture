import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { logoutUser } from "../auth/authService";
import { useNotifications } from "../notifications/useNotifications";
import IdleGuard from "../security/IdleGuard";
import { APP_NAME } from "../../config/appConfig";

export default function Layout() {
  const { user, profile, role } = useAuth();
  const navigate = useNavigate();
  const notifications = useNotifications(user?.uid);
  const unread = notifications.filter((n) => !n.read).length;

  async function handleLogout() {
    await logoutUser();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-white focus:px-3 focus:py-2 focus:rounded"
      >
        Skip to main content
      </a>

      <header className="bg-blue-800 text-white">
        <nav aria-label="Main" className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-2 p-4">
          <Link to="/" className="font-bold text-lg">{APP_NAME}</Link>
          <div className="flex flex-wrap items-center gap-4">
            {user ? (
              <>
                <Link to="/dashboard" className="underline">Dashboard</Link>
                <Link to="/notifications" className="underline" aria-label={`Notifications, ${unread} unread`}>
                  Notifications{unread > 0 ? ` (${unread})` : ""}
                </Link>
                <span>{profile?.name || user.email} ({role})</span>
                <button onClick={handleLogout} className="underline min-h-11">Log out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="underline">Log in</Link>
                <Link to="/register" className="underline">Register</Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {user && <IdleGuard />}

      <main id="main" className="max-w-md mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { logoutUser } from "../auth/authService";
import { hasRole } from "../../config/appConfig";
import Button from "../ui/Button";
import Spinner from "../ui/Spinner";

// <ProtectedRoute>...</ProtectedRoute>              any verified user (and 2FA passed, if enabled)
// <ProtectedRoute minRole="staff">...</ProtectedRoute>   staff and admin only
export default function ProtectedRoute({ children, minRole = "user" }) {
  const { user, profile, role, verified, totpEnabled, twoFactorPassed, mustChangePassword, profileError, loading, refresh } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <Spinner label="Loading page" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;

  // Fail closed: if the profile can't load, the gates stay shut (like on mobile).
  if (profileError) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 p-6 text-center">
        <h2 className="text-lg font-semibold text-fg">Could not load your account</h2>
        <p className="max-w-md text-fg-muted">
          Your profile couldn&apos;t be loaded from the database, so the app stays locked.
          Check your connection, then try again.
        </p>
        <div className="flex gap-3">
          <Button onClick={() => refresh()}>Try again</Button>
          <Button variant="secondary" onClick={handleLogout}>Log out</Button>
        </div>
      </div>
    );
  }

  if (!verified) return <Navigate to="/verify-email" replace />;
  if (totpEnabled && !twoFactorPassed) return <Navigate to="/2fa" replace />;
  // First-login forced password change (skip when already on that page).
  if (mustChangePassword && location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }
  if (profile?.active === false) return <Navigate to="/deactivated" replace />;
  if (!hasRole(role, minRole)) return <Navigate to="/forbidden" replace />;

  return children;

  async function handleLogout() {
    await logoutUser();
    window.location.assign("/login");
  }
}

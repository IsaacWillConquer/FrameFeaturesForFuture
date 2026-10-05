import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { hasRole } from "../../config/appConfig";
import Spinner from "../ui/Spinner";

// <ProtectedRoute>...</ProtectedRoute>              any verified user (and 2FA passed, if enabled)
// <ProtectedRoute minRole="staff">...</ProtectedRoute>   staff and admin only
export default function ProtectedRoute({ children, minRole = "user" }) {
  const { user, profile, role, verified, totpEnabled, twoFactorPassed, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <Spinner label="Loading page" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (profile?.active === false) return <Navigate to="/deactivated" replace />;
  if (!verified) return <Navigate to="/verify-email" replace />;
  if (totpEnabled && !twoFactorPassed) return <Navigate to="/2fa" replace />;
  if (!hasRole(role, minRole)) return <Navigate to="/forbidden" replace />;

  return children;
}

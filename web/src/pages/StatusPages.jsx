import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../core/auth/authService";

export function NotFound() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Page not found</h1>
      <Link to="/dashboard" className="underline">Go to dashboard</Link>
    </div>
  );
}

export function Forbidden() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">No access</h1>
      <p className="mb-4">Your role does not allow this page.</p>
      <Link to="/dashboard" className="underline">Go to dashboard</Link>
    </div>
  );
}

export function Deactivated() {
  const navigate = useNavigate();
  async function handleLogout() {
    await logoutUser();
    navigate("/login");
  }
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Account deactivated</h1>
      <p className="mb-4">An administrator turned off this account. Contact them if this is a mistake.</p>
      <button onClick={handleLogout} className="underline min-h-11">Log out</button>
    </div>
  );
}

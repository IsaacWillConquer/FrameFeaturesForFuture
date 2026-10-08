import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { KeyRound } from "lucide-react";
import { useAuth } from "../core/auth/AuthProvider";
import { changePassword, authErrorMessage, logoutUser } from "../core/auth/authService";
import FormField from "../core/ui/FormField";
import Button from "../core/ui/Button";
import Alert from "../core/ui/Alert";
import AuthShell from "../core/layout/AuthShell";

// Shown before anything else when users/{uid}.mustChangePassword is true
// (set at registration). Changing the password clears the flag and opens the app.
export default function ChangePasswordRequired() {
  const { user, verified, loading, mustChangePassword, refresh } = useAuth();
  const navigate = useNavigate();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (loading) return <p role="status" className="p-6">Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (!verified) return <Navigate to="/verify-email" replace />;
  if (!mustChangePassword) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (next.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (next !== confirm) {
      setError("New passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await changePassword(current, next);
      await refresh(); // flag is cleared, the gate opens
      navigate("/dashboard");
    } catch (err) {
      setError(authErrorMessage(err));
    }
    setBusy(false);
  }

  async function handleLogout() {
    await logoutUser();
    navigate("/login");
  }

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="For security, set your own password before using the app."
    >
      <Alert type="info">This is a one-time step. You&apos;ll use this password from now on.</Alert>
      <Alert>{error}</Alert>
      <form onSubmit={handleSubmit}>
        <FormField id="current" label="Current password" type="password" value={current}
          onChange={(e) => setCurrent(e.target.value)} required autoComplete="current-password" />
        <FormField id="new" label="New password" type="password" value={next}
          onChange={(e) => setNext(e.target.value)} required autoComplete="new-password" hint="At least 8 characters." />
        <FormField id="confirm" label="Confirm new password" type="password" value={confirm}
          onChange={(e) => setConfirm(e.target.value)} required autoComplete="new-password" />
        <Button type="submit" disabled={busy} className="w-full">
          <KeyRound className="h-4 w-4" /> {busy ? "Saving..." : "Save password and continue"}
        </Button>
      </form>
      <div className="mt-4 text-center">
        <button type="button" onClick={handleLogout} className="text-sm text-fg-muted underline min-h-11">Log out</button>
      </div>
    </AuthShell>
  );
}

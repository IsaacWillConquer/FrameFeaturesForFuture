import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { MailCheck } from "lucide-react";
import { useAuth } from "../core/auth/AuthProvider";
import { resendVerification, logoutUser, authErrorMessage } from "../core/auth/authService";
import { auth } from "../config/firebase";
import Button from "../core/ui/Button";
import Alert from "../core/ui/Alert";
import AuthShell from "../core/layout/AuthShell";

export default function VerifyEmail() {
  const { user, verified, loading, refresh } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  if (loading) return <p role="status" className="p-6">Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (verified) return <Navigate to="/dashboard" replace />;

  async function handleResend() {
    setError("");
    try {
      await resendVerification();
      setInfo("Verification email sent. Check your inbox and spam folder.");
    } catch (err) {
      setError(authErrorMessage(err));
    }
  }

  async function handleCheck() {
    setError("");
    setInfo("");
    await refresh();
    if (!auth.currentUser.emailVerified) {
      setError("Not verified yet. Click the link in the email first.");
    }
  }

  async function handleLogout() {
    await logoutUser();
    navigate("/login");
  }

  return (
    <AuthShell title="Verify your email">
      <div className="mb-4 flex items-start gap-3 rounded-lg bg-surface-2 p-3">
        <MailCheck aria-hidden="true" className="h-5 w-5 shrink-0 text-fg-muted" />
        <p className="text-sm text-fg">
          We sent a verification link to <strong>{user.email}</strong>. Click it, then come back here.
        </p>
      </div>
      <Alert>{error}</Alert>
      <Alert type="info">{info}</Alert>
      <div className="flex flex-col gap-3">
        <Button onClick={handleCheck} className="w-full">I verified my email</Button>
        <div className="flex justify-between">
          <button onClick={handleResend} className="text-sm text-primary underline min-h-11">Resend email</button>
          <button onClick={handleLogout} className="text-sm text-fg-muted underline min-h-11">Log out</button>
        </div>
      </div>
    </AuthShell>
  );
}

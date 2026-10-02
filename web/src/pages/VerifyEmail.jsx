import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../core/auth/AuthProvider";
import { resendVerification, logoutUser, authErrorMessage } from "../core/auth/authService";
import { auth } from "../config/firebase";
import Button from "../core/ui/Button";
import Alert from "../core/ui/Alert";

export default function VerifyEmail() {
  const { user, verified, loading, refresh } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  if (loading) return <p role="status">Loading...</p>;
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
    <div>
      <h1 className="text-2xl font-bold mb-4">Verify your email</h1>
      <p className="mb-4">We sent a verification link to <strong>{user.email}</strong>. Click it, then come back here.</p>
      <Alert>{error}</Alert>
      <Alert type="info">{info}</Alert>
      <div className="flex flex-col gap-3 items-start">
        <Button onClick={handleCheck}>I verified my email</Button>
        <button onClick={handleResend} className="underline min-h-11">Resend email</button>
        <button onClick={handleLogout} className="underline min-h-11">Log out</button>
      </div>
    </div>
  );
}

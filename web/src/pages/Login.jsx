import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../core/auth/AuthProvider";
import { loginUser, loginWithGoogle, resetPassword, authErrorMessage } from "../core/auth/authService";
import FormField from "../core/ui/FormField";
import Button from "../core/ui/Button";
import Alert from "../core/ui/Alert";
import AuthShell from "../core/layout/AuthShell";
import { secondsLocked, recordFail, clearFails } from "../core/security/loginLimiter";

export default function Login() {
  const { user, verified, loading, refresh } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  if (!loading && user && verified) return <Navigate to="/dashboard" replace />;

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setInfo("");

    const wait = secondsLocked(email);
    if (wait > 0) {
      setError(`Too many wrong tries. Try again in ${wait} seconds.`);
      return;
    }

    setBusy(true);
    try {
      await loginUser(email, password);
      clearFails(email);
      await refresh();
      navigate("/dashboard"); // guard sends unverified users to /verify-email
    } catch (err) {
      if (err.code === "auth/invalid-credential") {
        const locked = recordFail(email);
        setError(locked > 0 ? `Too many wrong tries. Locked for ${locked} seconds.` : authErrorMessage(err));
      } else {
        setError(authErrorMessage(err));
      }
    }
    setBusy(false);
  }

  async function handleGoogle() {
    setError("");
    try {
      await loginWithGoogle();
      await refresh();
      navigate("/dashboard");
    } catch (err) {
      setError(authErrorMessage(err));
    }
  }

  async function handleForgot() {
    setError("");
    setInfo("");
    if (!email) {
      setError("Type your email first, then press Forgot password.");
      return;
    }
    try {
      await resetPassword(email);
      setInfo("Password reset email sent. Check your inbox.");
    } catch (err) {
      setError(authErrorMessage(err));
    }
  }

  return (
    <AuthShell
      title="Log in"
      subtitle="Welcome back. Sign in to continue."
      footer={<>No account? <Link to="/register" className="font-medium text-primary underline">Register</Link></>}
    >
      <Alert>{error}</Alert>
      <Alert type="info">{info}</Alert>

      <form onSubmit={handleLogin}>
        <FormField id="email" label="Email" type="email" value={email}
          onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        <FormField id="password" label="Password" type="password" value={password}
          onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        <Button type="submit" disabled={busy} className="w-full">{busy ? "Logging in..." : "Log in"}</Button>
      </form>

      <div className="my-4 flex items-center gap-3 text-xs text-fg-muted">
        <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
      </div>

      <Button type="button" variant="secondary" onClick={handleGoogle} className="w-full">
        Continue with Google
      </Button>

      <div className="mt-4 text-center">
        <button type="button" onClick={handleForgot} className="text-sm text-primary underline min-h-11">Forgot password?</button>
      </div>
    </AuthShell>
  );
}

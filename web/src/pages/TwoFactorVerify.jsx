import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../core/auth/AuthProvider";
import { logoutUser } from "../core/auth/authService";
import { getTotp, checkCode, consumeRecoveryCode } from "../core/security/totpService";
import { logAction } from "../core/logger";
import FormField from "../core/ui/FormField";
import Button from "../core/ui/Button";
import Alert from "../core/ui/Alert";
import AuthShell from "../core/layout/AuthShell";

export default function TwoFactorVerify() {
  const { user, verified, loading, totpEnabled, twoFactorPassed, passTwoFactor } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [recovery, setRecovery] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (loading) return <p role="status" className="p-6">Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (!verified) return <Navigate to="/verify-email" replace />;
  if (!totpEnabled || twoFactorPassed) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      let ok = false;
      if (recovery) {
        ok = await consumeRecoveryCode(user.uid, code);
      } else {
        const data = await getTotp(user.uid);
        if (!data) {
          setError("Could not load your 2FA settings. Log out and back in.");
          setBusy(false);
          return;
        }
        ok = checkCode(data.secret, code);
      }
      if (ok) {
        await logAction(user.uid, "2fa_pass", recovery ? "recovery code" : "authenticator");
        passTwoFactor();
        navigate("/dashboard");
      } else {
        setError("That code is not correct.");
      }
    } catch {
      setError("Could not check the code. Try again.");
    }
    setBusy(false);
  }

  async function handleLogout() {
    await logoutUser();
    navigate("/login");
  }

  return (
    <AuthShell
      title="Two-factor check"
      subtitle={recovery
        ? "Enter one of your recovery codes. Each one works only once."
        : "Open your authenticator app and enter the 6-digit code for AWA."}
    >
      <Alert>{error}</Alert>
      <form onSubmit={handleSubmit}>
        <FormField id="code" label={recovery ? "Recovery code" : "6-digit code"} value={code}
          onChange={(e) => setCode(e.target.value)} required autoComplete="one-time-code"
          inputMode={recovery ? "text" : "numeric"} />
        <Button type="submit" disabled={busy} className="w-full">{busy ? "Checking..." : "Continue"}</Button>
      </form>
      <div className="mt-4 flex flex-col items-start gap-2">
        <button type="button" onClick={() => { setRecovery(!recovery); setCode(""); setError(""); }}
          className="text-sm text-primary underline min-h-11">
          {recovery ? "Use authenticator code instead" : "Lost your phone? Use a recovery code"}
        </button>
        <button type="button" onClick={handleLogout} className="text-sm text-fg-muted underline min-h-11">Log out</button>
      </div>
    </AuthShell>
  );
}

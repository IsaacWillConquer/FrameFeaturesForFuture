import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../core/auth/AuthProvider";
import { registerUser, authErrorMessage } from "../core/auth/authService";
import FormField from "../core/ui/FormField";
import Button from "../core/ui/Button";
import Alert from "../core/ui/Alert";
import AuthShell from "../core/layout/AuthShell";

export default function Register() {
  const { refresh } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      await registerUser(name, email, password);
      await refresh();
      navigate("/verify-email");
    } catch (err) {
      setError(authErrorMessage(err));
    }
    setBusy(false);
  }

  return (
    <AuthShell
      title="Create account"
      subtitle="It only takes a minute."
      footer={<>Already registered? <Link to="/login" className="font-medium text-primary underline">Log in</Link></>}
    >
      <Alert>{error}</Alert>

      <form onSubmit={handleRegister}>
        <FormField id="name" label="Full name" value={name}
          onChange={(e) => setName(e.target.value)} required autoComplete="name" />
        <FormField id="email" label="Email" type="email" value={email}
          onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        <FormField id="password" label="Password" type="password" value={password}
          onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password"
          hint="At least 8 characters." />
        <FormField id="confirm" label="Confirm password" type="password" value={confirm}
          onChange={(e) => setConfirm(e.target.value)} required autoComplete="new-password" />
        <Button type="submit" disabled={busy} className="w-full">{busy ? "Creating..." : "Register"}</Button>
      </form>
    </AuthShell>
  );
}

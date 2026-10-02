import { useState } from "react";
import { useAuth } from "../core/auth/AuthProvider";
import {
  newSecret, otpUri, checkCode, makeRecoveryCodes, enableTotp, disableTotp, getTotp,
} from "../core/security/totpService";
import { logAction } from "../core/logger";
import QRGenerator from "../core/qr/QRGenerator";
import FormField from "../core/ui/FormField";
import Button from "../core/ui/Button";
import Alert from "../core/ui/Alert";

export default function Security() {
  const { user, totpEnabled, refresh, passTwoFactor } = useAuth();
  const [secret, setSecret] = useState(null); // set while the user is mid-setup
  const [codes, setCodes] = useState(null); // recovery codes, shown once
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  async function handleConfirm(e) {
    e.preventDefault();
    setError("");
    if (!checkCode(secret, code)) {
      setError("That code doesn't match. Check the time on your phone and try again.");
      return;
    }
    try {
      const plain = makeRecoveryCodes();
      await enableTotp(user.uid, secret, plain);
      await logAction(user.uid, "2fa_enabled");
      passTwoFactor(); // before refresh, so we don't get bounced to the 2FA page
      await refresh();
      setCodes(plain);
      setSecret(null);
      setCode("");
    } catch (err) {
      setError("Could not save 2FA. Check your Firestore rules.");
    }
  }

  async function handleDisable(e) {
    e.preventDefault();
    setError("");
    try {
      const data = await getTotp(user.uid);
      if (!checkCode(data.secret, code)) {
        setError("That code is not correct.");
        return;
      }
      await disableTotp(user.uid);
      await logAction(user.uid, "2fa_disabled");
      setCode("");
      await refresh();
    } catch (err) {
      setError("Could not turn off 2FA.");
    }
  }

  // 1) Just enabled: show recovery codes once
  if (codes) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">2FA is on</h1>
        <p className="mb-2">Save these recovery codes somewhere safe. Each works once, and they will not be shown again.</p>
        <ul className="font-mono bg-white border rounded p-3 mb-4">
          {codes.map((c) => <li key={c}>{c}</li>)}
        </ul>
        <Button onClick={() => setCodes(null)}>I saved them</Button>
      </div>
    );
  }

  // 2) 2FA already on: option to turn off
  if (totpEnabled) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Security</h1>
        <p className="mb-4">Two-factor authentication is <strong>on</strong>.</p>
        <Alert>{error}</Alert>
        <form onSubmit={handleDisable}>
          <FormField id="code" label="Enter a 6-digit code to turn it off" value={code}
            onChange={(e) => setCode(e.target.value)} required inputMode="numeric" />
          <Button type="submit">Turn off 2FA</Button>
        </form>
      </div>
    );
  }

  // 3) Mid-setup: show QR + manual key + confirm box
  if (secret) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Set up 2FA</h1>
        <ol className="list-decimal ml-5 mb-4 space-y-1">
          <li>Open an authenticator app (Google Authenticator, Microsoft Authenticator, Authy).</li>
          <li>Scan this QR code, or type the key below into the app.</li>
          <li>Enter the 6-digit code the app shows.</li>
        </ol>
        <QRGenerator value={otpUri(secret, user.email)} />
        <p className="my-4">Manual key: <code className="font-mono break-all">{secret}</code></p>
        <Alert>{error}</Alert>
        <form onSubmit={handleConfirm}>
          <FormField id="code" label="6-digit code" value={code}
            onChange={(e) => setCode(e.target.value)} required inputMode="numeric" autoComplete="one-time-code" />
          <Button type="submit">Turn on 2FA</Button>
        </form>
      </div>
    );
  }

  // 4) Start
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Security</h1>
      <p className="mb-4">Two-factor authentication is <strong>off</strong>. Turn it on to require a code from your phone at login.</p>
      <Button onClick={() => setSecret(newSecret())}>Set up 2FA</Button>
    </div>
  );
}

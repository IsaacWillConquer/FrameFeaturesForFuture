import { useState } from "react";
import { ShieldCheck, ShieldOff, Download } from "lucide-react";
import { useAuth } from "../core/auth/AuthProvider";
import {
  newSecret, otpUri, checkCode, makeRecoveryCodes, enableTotp, disableTotp, getTotp,
} from "../core/security/totpService";
import { logAction } from "../core/logger";
import QRGenerator from "../core/qr/QRGenerator";
import FormField from "../core/ui/FormField";
import Button from "../core/ui/Button";
import Alert from "../core/ui/Alert";
import Card, { CardHeader, CardBody } from "../core/ui/Card";
import PageHeader from "../core/ui/PageHeader";
import Badge from "../core/ui/Badge";

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
    } catch {
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
    } catch {
      setError("Could not turn off 2FA.");
    }
  }

  function downloadCodes() {
    const blob = new Blob([`AWA recovery codes\n\n${codes.join("\n")}\n`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "awa-recovery-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  // 1) Just enabled: show recovery codes once
  if (codes) {
    return (
      <div>
        <PageHeader title="2FA is on" description="Save these recovery codes somewhere safe." />
        <Card>
          <CardBody>
            <Alert type="warning">Each code works once and will not be shown again.</Alert>
            <ul className="mb-4 grid grid-cols-2 gap-2 rounded-lg border border-border bg-surface-2 p-3 font-mono text-sm">
              {codes.map((c) => <li key={c}>{c}</li>)}
            </ul>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setCodes(null)}>I saved them</Button>
              <Button variant="secondary" onClick={downloadCodes}><Download className="h-4 w-4" /> Download</Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  // 2) 2FA already on: option to turn off
  if (totpEnabled) {
    return (
      <div>
        <PageHeader title="Security" description="Protect your account with an extra step at login." />
        <Card>
          <CardHeader
            title="Two-factor authentication"
            actions={<Badge variant="success">On</Badge>}
          />
          <CardBody>
            <p className="mb-4 text-fg-muted">Enter a current 6-digit code from your authenticator app to turn it off.</p>
            <Alert>{error}</Alert>
            <form onSubmit={handleDisable} className="max-w-sm">
              <FormField id="code" label="6-digit code" value={code}
                onChange={(e) => setCode(e.target.value)} required inputMode="numeric" autoComplete="one-time-code" />
              <Button type="submit" variant="danger"><ShieldOff className="h-4 w-4" /> Turn off 2FA</Button>
            </form>
          </CardBody>
        </Card>
      </div>
    );
  }

  // 3) Mid-setup: show QR + manual key + confirm box
  if (secret) {
    return (
      <div>
        <PageHeader title="Set up 2FA" description="Scan the code, then confirm with one code." />
        <Card>
          <CardBody className="max-w-lg">
            <ol className="mb-4 ml-5 list-decimal space-y-1 text-fg-muted">
              <li>Open an authenticator app (Google Authenticator, Microsoft Authenticator, Authy).</li>
              <li>Scan this QR code, or type the key below into the app.</li>
              <li>Enter the 6-digit code the app shows.</li>
            </ol>
            <QRGenerator value={otpUri(secret, user.email)} />
            <p className="my-4 text-sm text-fg-muted">
              Manual key: <code className="break-all rounded bg-surface-2 px-1 py-0.5 font-mono text-fg">{secret}</code>
            </p>
            <Alert>{error}</Alert>
            <form onSubmit={handleConfirm} className="max-w-sm">
              <FormField id="code" label="6-digit code" value={code}
                onChange={(e) => setCode(e.target.value)} required inputMode="numeric" autoComplete="one-time-code" />
              <Button type="submit">Turn on 2FA</Button>
            </form>
          </CardBody>
        </Card>
      </div>
    );
  }

  // 4) Start
  return (
    <div>
      <PageHeader title="Security" description="Protect your account with an extra step at login." />
      <Card>
        <CardHeader title="Two-factor authentication" actions={<Badge variant="neutral">Off</Badge>} />
        <CardBody>
          <p className="mb-4 text-fg-muted">Turn it on to require a code from your phone each time you log in.</p>
          <Button onClick={() => setSecret(newSecret())}><ShieldCheck className="h-4 w-4" /> Set up 2FA</Button>
        </CardBody>
      </Card>
    </div>
  );
}

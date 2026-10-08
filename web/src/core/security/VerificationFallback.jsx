import { useState } from "react";
import { Fingerprint, LifeBuoy } from "lucide-react";
import { unlockWithBiometric, biometricsSupported } from "./webauthnService";
import { compareFace, getFaceDescriptors } from "./faceService";
import { getTotp, checkCode } from "./totpService";
import { recordFaceCheck } from "./livenessService";
import { createSupportRequest } from "../support/supportService";
import { logAction } from "../logger";
import Tabs from "../ui/Tabs";
import Button from "../ui/Button";
import Alert from "../ui/Alert";
import FormField from "../ui/FormField";
import FaceCapture from "./FaceCapture";

// A reusable verification ladder. The user can pick any method that works for
// them; nobody is ever locked out. Order shown: biometric -> face -> code.
// Falls back to staff assistance (a real support request) if all are unusable.
export default function VerificationFallback({ uid, name, email, onVerified }) {
  const [method, setMethod] = useState(biometricsSupported() ? "biometric" : "code");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [helpNote, setHelpNote] = useState("");
  const [helpSent, setHelpSent] = useState(false);
  const [helpBusy, setHelpBusy] = useState(false);

  async function verifyBiometric() {
    setError(""); setBusy(true);
    try {
      await unlockWithBiometric(uid);
      onVerified("biometric");
    } catch (err) {
      setError(err?.message || "Biometric check failed.");
    }
    setBusy(false);
  }

  async function verifyFace(descriptor) {
    setError("");
    try {
      const faces = await getFaceDescriptors(uid);
      if (faces.length === 0) {
        setError("No face enrolled. Use another method.");
        return;
      }
      const ok = faces.some((f) => compareFace(descriptor, f.descriptor));
      if (ok) {
        await recordFaceCheck(uid, true);
        onVerified("face");
      } else {
        await recordFaceCheck(uid, false);
        setError("Face did not match. Try another method.");
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function verifyCode(e) {
    e.preventDefault();
    setError(""); setBusy(true);
    try {
      const data = await getTotp(uid);
      if (data && checkCode(data.secret, code)) {
        onVerified("code");
      } else {
        setError("That code is not correct.");
      }
    } catch {
      setError("Could not check the code.");
    }
    setBusy(false);
  }

  // Files a real support request so staff can verify the person in person.
  async function askStaff(e) {
    e.preventDefault();
    setError(""); setMessage(""); setHelpBusy(true);
    try {
      await createSupportRequest(uid, { name, email, reason: "verification", note: helpNote });
      await logAction(uid, "support_request", "verification");
      setHelpSent(true);
      setMessage("Sent to staff. They can verify you in person — watch your notifications.");
    } catch (err) {
      setError(err?.message || "Could not send the request. Please try again.");
    }
    setHelpBusy(false);
  }

  const tabs = [
    {
      id: "biometric",
      label: "Biometric",
      content: (
        <div>
          <p className="mb-3 text-fg-muted">Use your device fingerprint or face unlock.</p>
          <Button onClick={verifyBiometric} disabled={busy}>
            <Fingerprint className="h-4 w-4" /> {busy ? "Waiting..." : "Unlock with device"}
          </Button>
        </div>
      ),
    },
    {
      id: "face",
      label: "Face",
      content: <FaceCapture onCapture={verifyFace} onCancel={() => setMethod("code")} />,
    },
    {
      id: "code",
      label: "Code",
      content: (
        <form onSubmit={verifyCode} className="max-w-sm">
          <FormField id="vf-code" label="Authenticator code" value={code}
            onChange={(e) => setCode(e.target.value)} inputMode="numeric" autoComplete="one-time-code" required />
          <Button type="submit" disabled={busy}>Confirm code</Button>
        </form>
      ),
    },
  ];

  return (
    <div>
      <Tabs tabs={tabs} active={method} onChange={setMethod} label="Verification method" />
      <Alert>{error}</Alert>
      <Alert type="info">{message}</Alert>

      <div className="mt-6 border-t border-border pt-4">
        {helpSent ? (
          <p className="flex items-center gap-2 text-sm text-success">
            <LifeBuoy className="h-4 w-4" /> Request sent to staff.
          </p>
        ) : (
          <form onSubmit={askStaff} className="max-w-md">
            <p className="mb-2 flex items-center gap-2 text-sm text-fg-muted">
              <LifeBuoy className="h-4 w-4" /> Can&apos;t use any method? Ask staff to verify you in person.
            </p>
            <FormField id="vf-help" label="Message to staff (optional)" value={helpNote}
              onChange={(e) => setHelpNote(e.target.value)} />
            <Button type="submit" variant="secondary" disabled={helpBusy}>
              {helpBusy ? "Sending..." : "Send help request"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

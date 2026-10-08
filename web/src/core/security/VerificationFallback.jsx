import { useState } from "react";
import { Fingerprint, LifeBuoy } from "lucide-react";
import { unlockWithBiometric, biometricsSupported } from "./webauthnService";
import { compareFace, getFaceDescriptors } from "./faceService";
import { getTotp, checkCode } from "./totpService";
import { recordFaceCheck } from "./livenessService";
import Tabs from "../ui/Tabs";
import Button from "../ui/Button";
import Alert from "../ui/Alert";
import FormField from "../ui/FormField";
import FaceCapture from "./FaceCapture";

// A reusable verification ladder. The user can pick any method that works for
// them; nobody is ever locked out. Order shown: biometric -> face -> code.
// Falls back to staff assistance if all methods are unavailable.
export default function VerificationFallback({ uid, onVerified }) {
  const [method, setMethod] = useState(biometricsSupported() ? "biometric" : "code");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

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
        <button
          type="button"
          onClick={() => setMessage("Asked staff for help. They can verify you in person.")}
          className="inline-flex items-center gap-2 text-sm text-fg-muted underline min-h-11"
        >
          <LifeBuoy className="h-4 w-4" /> Can&apos;t use any method? Ask staff for help
        </button>
      </div>
    </div>
  );
}

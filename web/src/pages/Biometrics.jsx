import { useEffect, useState } from "react";
import { Fingerprint, ScanFace, ShieldCheck, Trash2 } from "lucide-react";
import { useAuth } from "../core/auth/AuthProvider";
import {
  biometricsSupported, platformAuthenticatorAvailable,
  getBiometricDevices, registerBiometric, removeBiometric,
} from "../core/security/webauthnService";
import { getFaceDescriptors, registerFace, removeFace, faceRecognitionSupported, compareFace } from "../core/security/faceService";
import { recordFaceCheck } from "../core/security/livenessService";
import { logAction } from "../core/logger";
import PageHeader from "../core/ui/PageHeader";
import Card, { CardHeader, CardBody } from "../core/ui/Card";
import Button from "../core/ui/Button";
import Alert from "../core/ui/Alert";
import Badge from "../core/ui/Badge";
import EmptyState from "../core/ui/EmptyState";
import Spinner from "../core/ui/Spinner";
import FaceCapture from "../core/security/FaceCapture";

async function fetchBioData(uid) {
  return Promise.all([getBiometricDevices(uid), getFaceDescriptors(uid)]);
}

export default function Biometrics() {
  const { user, profile } = useAuth();
  const supported = biometricsSupported(); // capability check, like faceRecognitionSupported() below
  const [platformOk, setPlatformOk] = useState(false);
  const [devices, setDevices] = useState([]);
  const [faces, setFaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [showFace, setShowFace] = useState(false);
  const [faceMode, setFaceMode] = useState("enroll"); // "enroll" replaces, "test" verifies

  async function load() {
    setLoading(true);
    try {
      const [d, f] = await fetchBioData(user.uid);
      setDevices(d);
      setFaces(f);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    let alive = true;
    platformAuthenticatorAvailable().then((ok) => { if (alive) setPlatformOk(ok); });
    fetchBioData(user.uid)
      .then(([d, f]) => { if (alive) { setDevices(d); setFaces(f); } })
      .catch((err) => { if (alive) setError(err.message); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [user.uid]);

  async function addDevice() {
    setError(""); setMessage(""); setBusy(true);
    try {
      await registerBiometric(user.uid, profile?.name || user.email);
      await logAction(user.uid, "biometric_enroll", "platform authenticator");
      setMessage("This device is now set up for biometric unlock.");
      await load();
    } catch (err) {
      setError(err?.message || "Biometric setup was cancelled.");
    }
    setBusy(false);
  }

  async function remove(d) {
    try {
      await removeBiometric(d.id);
      await logAction(user.uid, "biometric_remove", d.name);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function enrollFace(descriptor) {
    setBusy(true); setError(""); setMessage("");
    try {
      // Replace any previous enrollment so descriptors don't pile up.
      await Promise.all(faces.map((f) => removeFace(f.id)));
      await registerFace(user.uid, descriptor);
      await logAction(user.uid, "face_enroll");
      setMessage("Face enrolled. Only the numeric descriptor is stored, never a photo.");
      setShowFace(false);
      await load();
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  async function removeFaceEnrollment(f) {
    try {
      await removeFace(f.id);
      await logAction(user.uid, "face_remove");
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function testFace(descriptor) {
    if (faces.length === 0) return;
    const match = faces.some((f) => compareFace(descriptor, f.descriptor));
    setShowFace(false);
    if (match) {
      await recordFaceCheck(user.uid, true);
      await logAction(user.uid, "face_check", "match");
      setMessage("Face match confirmed.");
    } else {
      await recordFaceCheck(user.uid, false);
      setError("Face did not match. Try again in better light.");
    }
  }

  return (
    <div>
      <PageHeader title="Biometrics & face" description="Unlock this device with your fingerprints or your face." />
      <Alert>{error}</Alert>
      <Alert type="info">{message}</Alert>
      {!platformOk && supported && (
        <Alert type="warning">No device biometrics detected on this browser, but you can still try. Works best on a phone or a laptop with Windows Hello / Touch ID.</Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Device biometrics"
            description="Uses your device's own fingerprint / face unlock."
            actions={supported && <Button onClick={addDevice} disabled={busy}><Fingerprint className="h-4 w-4" /> Set up</Button>}
          />
          <CardBody>
            {!supported ? (
              <Alert type="warning">This browser doesn&apos;t support biometric unlock. Try Chrome or Edge.</Alert>
            ) : loading ? (
              <div className="flex justify-center p-4"><Spinner /></div>
            ) : devices.length === 0 ? (
              <EmptyState icon={Fingerprint} title="No biometric device yet" description="Set up this device to unlock with a fingerprint." />
            ) : (
              <ul className="divide-y divide-border">
                {devices.map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="flex items-center gap-3">
                      <ShieldCheck aria-hidden="true" className="h-5 w-5 text-fg-muted" />
                      <div>
                        <p className="font-medium text-fg">{d.name}</p>
                        <p className="text-sm text-fg-muted">{d.createdAt?.toDate().toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button onClick={() => remove(d)} className="inline-flex items-center gap-1 text-sm text-danger underline min-h-11">
                      <Trash2 className="h-4 w-4" /> Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Face recognition"
            description="Stores a numeric face descriptor, never a photo."
            actions={faceRecognitionSupported() && (
              <Button onClick={() => { setFaceMode("enroll"); setShowFace(true); }} disabled={busy}>
                <ScanFace className="h-4 w-4" /> {faces.length ? "Re-enroll" : "Enroll"}
              </Button>
            )}
          />
          <CardBody>
            {!faceRecognitionSupported() ? (
              <Alert type="warning">Face recognition isn&apos;t available in this browser (needs a camera + WebGL).</Alert>
            ) : showFace ? (
              <FaceCapture onCapture={faceMode === "test" ? testFace : enrollFace} onCancel={() => setShowFace(false)} />
            ) : loading ? (
              <div className="flex justify-center p-4"><Spinner /></div>
            ) : faces.length === 0 ? (
              <EmptyState icon={ScanFace} title="No face enrolled" description="Enroll your face to use it as a verification fallback." />
            ) : (
              <div className="space-y-3">
                <p className="text-fg-muted">
                  Face enrolled. {faces.length} descriptor{faces.length > 1 ? "s" : ""} on file.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="success">Enrolled</Badge>
                  <button type="button" onClick={() => { setFaceMode("test"); setShowFace(true); }}
                    className="text-sm text-primary underline min-h-11">
                    Test face match
                  </button>
                  {faces.map((f) => (
                    <button key={f.id} onClick={() => removeFaceEnrollment(f)} className="text-sm text-danger underline min-h-11">
                      Remove enrollment
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <p className="mt-6 max-w-2xl text-sm text-fg-muted">
        Privacy note: face data is a 128-number mathematical descriptor, not an image. It stays tied to your account and can be
        deleted any time. Biometric unlock proves the person at this device passed the device&apos;s own check.
      </p>
    </div>
  );
}

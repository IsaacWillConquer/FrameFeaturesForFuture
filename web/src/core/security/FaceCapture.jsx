import { useEffect, useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import { loadModels, descriptorFromVideo } from "./faceService";
import { descriptorDelta } from "./livenessService";
import Button from "../ui/Button";
import Alert from "../ui/Alert";
import Spinner from "../ui/Spinner";

// Live camera capture. Calls onCapture(descriptor) with a fresh 128-number
// face descriptor. Shows a simple "look at the camera" prompt between frames.
export default function FaceCapture({ onCapture, onCancel }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function start() {
      try {
        await loadModels();
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setReady(true);
      } catch (err) {
        setError(err?.message || "Could not start the camera.");
      }
    }
    start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function capture() {
    setError("");
    setBusy(true);
    try {
      // Two frames ~1s apart. A flat photo barely changes between them; a real
      // face does (micro-movements, lighting). That's the liveness-lite check.
      const first = await descriptorFromVideo(videoRef.current);
      if (!first) {
        setError("No face detected. Move closer and look at the camera.");
        setBusy(false);
        return;
      }
      await new Promise((r) => setTimeout(r, 900));
      const second = await descriptorFromVideo(videoRef.current);
      if (!second) {
        setError("Lost the face halfway. Hold still, then try again.");
        setBusy(false);
        return;
      }
      if (descriptorDelta(first, second) < 0.025) {
        setError("Face looked too still (like a photo). Nod or shift slightly, then capture again.");
        setBusy(false);
        return;
      }
      onCapture(second);
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  return (
    <div>
      <div className="relative overflow-hidden rounded-lg border border-border bg-black">
        <video ref={videoRef} muted playsInline aria-label="Camera preview" className="h-56 w-full object-cover" />
        {!ready && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-2">
            <Spinner label="Starting camera" />
          </div>
        )}
      </div>
      <p className="mt-2 text-sm text-fg-muted">Look at the camera in good light and capture. We take two shots a second apart and check for movement (blocks a static photo).</p>
      <Alert>{error}</Alert>
      <div className="mt-3 flex gap-3">
        <Button onClick={capture} disabled={!ready || busy}>
          <Camera className="h-4 w-4" /> {busy ? "Checking..." : "Capture"}
        </Button>
        <Button variant="secondary" onClick={onCancel}><X className="h-4 w-4" /> Cancel</Button>
      </div>
    </div>
  );
}

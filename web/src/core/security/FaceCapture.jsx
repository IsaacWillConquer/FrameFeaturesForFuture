import { useEffect, useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import { loadModels, descriptorFromVideo } from "./faceService";
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
      const descriptor = await descriptorFromVideo(videoRef.current);
      if (!descriptor) {
        setError("No face detected. Move closer and look at the camera.");
      } else {
        onCapture(descriptor);
      }
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
      <p className="mt-2 text-sm text-fg-muted">Look straight at the camera in good light, then capture.</p>
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

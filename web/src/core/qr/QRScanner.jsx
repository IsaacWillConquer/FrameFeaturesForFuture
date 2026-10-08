import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import Button from "../ui/Button";
import FormField from "../ui/FormField";
import Alert from "../ui/Alert";

// Camera scan, with a type-the-code box that always works. Needs HTTPS or localhost.
export default function QRScanner({ onScan }) {
  const [cameraOn, setCameraOn] = useState(false);
  const [error, setError] = useState("");
  const [typed, setTyped] = useState("");
  const onScanRef = useRef(onScan);

  // Keep the latest callback without restarting the camera
  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    if (!cameraOn) return;
    const scanner = new Html5Qrcode("qr-reader");
    let done = false;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 220 },
        (text) => {
          if (done) return; // the camera fires many times, report once
          done = true;
          scanner.stop().catch(() => {}).finally(() => {
            setCameraOn(false);
            onScanRef.current(text);
          });
        },
        () => {}
      )
      .catch(() => {
        setError("Camera unavailable. Type the code below instead.");
        setCameraOn(false);
      });

    return () => {
      done = true;
      if (scanner.isScanning) scanner.stop().catch(() => {});
    };
  }, [cameraOn]);

  function handleTyped(e) {
    e.preventDefault();
    if (typed.trim()) onScan(typed.trim());
  }

  return (
    <div>
      <Alert>{error}</Alert>
      {cameraOn ? <div id="qr-reader" className="max-w-xs mb-4" /> : (
        <Button onClick={() => { setError(""); setCameraOn(true); }}>Scan with camera</Button>
      )}
      <form onSubmit={handleTyped} className="mt-4">
        <FormField id="typed-code" label="Or type the code" value={typed}
          onChange={(e) => setTyped(e.target.value)} />
        <Button type="submit">Use this code</Button>
      </form>
    </div>
  );
}

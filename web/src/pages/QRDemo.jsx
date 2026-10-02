import { useState } from "react";
import QRGenerator from "../core/qr/QRGenerator";
import QRScanner from "../core/qr/QRScanner";
import FormField from "../core/ui/FormField";
import Alert from "../core/ui/Alert";

// Test page: make a QR on your laptop, scan it with the phone (and the other way around)
export default function QRDemo() {
  const [text, setText] = useState("AWA-TEST-123");
  const [result, setResult] = useState("");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">QR demo</h1>

      <h2 className="text-xl font-semibold mb-2">Make a QR</h2>
      <FormField id="qr-text" label="Text to put in the QR" value={text}
        onChange={(e) => setText(e.target.value)} />
      <QRGenerator value={text} />

      <h2 className="text-xl font-semibold mt-8 mb-2">Scan a QR</h2>
      <QRScanner onScan={setResult} />
      <div className="mt-4">
        <Alert type="info">{result && `Scanned: ${result}`}</Alert>
      </div>
    </div>
  );
}

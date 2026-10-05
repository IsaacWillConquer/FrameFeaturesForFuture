import { useState } from "react";
import QRGenerator from "../core/qr/QRGenerator";
import QRScanner from "../core/qr/QRScanner";
import FormField from "../core/ui/FormField";
import Alert from "../core/ui/Alert";
import PageHeader from "../core/ui/PageHeader";
import Card, { CardHeader, CardBody } from "../core/ui/Card";

// Test page: make a QR on your laptop, scan it with the phone (and the other way around)
export default function QRDemo() {
  const [text, setText] = useState("AWA-TEST-123");
  const [result, setResult] = useState("");

  return (
    <div>
      <PageHeader title="QR demo" description="Make a code on one screen and scan it with another." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Make a QR" />
          <CardBody>
            <FormField id="qr-text" label="Text to put in the QR" value={text}
              onChange={(e) => setText(e.target.value)} />
            <QRGenerator value={text} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Scan a QR" />
          <CardBody>
            <QRScanner onScan={setResult} />
            {result && <div className="mt-4"><Alert type="info">Scanned: {result}</Alert></div>}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

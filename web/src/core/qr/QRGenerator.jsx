import { QRCodeSVG } from "qrcode.react";

// The text under the QR is the accessible fallback (screen readers + typing it in by hand)
export default function QRGenerator({ value, size = 192 }) {
  if (!value) return null;
  return (
    <figure className="inline-block bg-white p-3 border rounded">
      <QRCodeSVG value={value} size={size} role="img" aria-label={`QR code for ${value}`} />
      <figcaption className="mt-2 text-sm break-all max-w-48">Code: {value}</figcaption>
    </figure>
  );
}

// Payment/profile data carried inside a QR code. Kept tiny and versioned so a
// scanned code can be validated before it touches the wallet.
const PREFIX = "AWA1:";

export function encodePaymentQR({ toUid, amount, note = "" }) {
  return PREFIX + JSON.stringify({ t: "pay", toUid, amount: Number(amount) || 0, note });
}

export function encodeProfileQR({ uid, name = "" }) {
  return PREFIX + JSON.stringify({ t: "me", uid, name });
}

// Returns { t, ... } when the text is a valid AWA QR, otherwise null.
export function parsePaymentQR(text) {
  if (typeof text !== "string" || !text.startsWith(PREFIX)) return null;
  try {
    const data = JSON.parse(text.slice(PREFIX.length));
    if (data?.t === "pay" && data.toUid && Number(data.amount) > 0) return data;
    if (data?.t === "me" && data.uid) return data;
  } catch {
    return null;
  }
  return null;
}

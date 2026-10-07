import * as OTPAuth from "otpauth";
import { doc, getDoc, setDoc, deleteDoc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "../../config/firebase";
import { COLLECTIONS, APP_NAME } from "../../config/appConfig";

// NOTE: codes are checked in the browser (no server on the free plan).
// Write this down as a known limitation in your docs.

function makeTotp(secretBase32, label) {
  return new OTPAuth.TOTP({
    issuer: APP_NAME,
    label,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secretBase32),
  });
}

export function newSecret() {
  return new OTPAuth.Secret({ size: 20 }).base32;
}

// The text that goes inside the QR code the authenticator app scans
export function otpUri(secretBase32, email) {
  return makeTotp(secretBase32, email).toString();
}

// window: 1 allows one 30-second step of clock drift
export function checkCode(secretBase32, code) {
  const clean = String(code).replace(/\s/g, "");
  return makeTotp(secretBase32, "user").validate({ token: clean, window: 1 }) !== null;
}

async function sha256(text) {
  const bytes = new TextEncoder().encode(text.trim().toLowerCase());
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// 8 one-time codes like "k3f9a-82hd1". Shown once; only hashes are stored.
export function makeRecoveryCodes() {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  const pick = () => chars[crypto.getRandomValues(new Uint32Array(1))[0] % chars.length];
  return Array.from({ length: 8 }, () => {
    const part = () => Array.from({ length: 5 }, pick).join("");
    return `${part()}-${part()}`;
  });
}

export async function getTotp(uid) {
  const snap = await getDoc(doc(db, COLLECTIONS.totp, uid));
  return snap.exists() ? snap.data() : null;
}

export async function enableTotp(uid, secret, plainCodes) {
  const hashes = await Promise.all(plainCodes.map(sha256));
  await setDoc(doc(db, COLLECTIONS.totp, uid), {
    secret,
    enabled: true,
    recovery: hashes,
    createdAt: serverTimestamp(),
  });
}

export function disableTotp(uid) {
  return deleteDoc(doc(db, COLLECTIONS.totp, uid));
}

// Returns true and burns the code if it matches. A transaction so two devices
// (web + phone, or two tabs) can't both burn the same code at once.
export async function consumeRecoveryCode(uid, code) {
  const hash = await sha256(code);
  const ref = doc(db, COLLECTIONS.totp, uid);
  let ok = false;
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) return;
    const recovery = snap.data().recovery || [];
    if (!recovery.includes(hash)) return;
    ok = true;
    tx.update(ref, { recovery: recovery.filter((h) => h !== hash) });
  });
  return ok;
}

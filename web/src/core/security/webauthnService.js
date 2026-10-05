import { addDoc, collection, deleteDoc, doc, getDocs, query, serverTimestamp, where } from "firebase/firestore";
import { db } from "../../config/firebase";
import { COLLECTIONS } from "../../config/appConfig";

// ---------------------------------------------------------------------------
// Biometric / platform-authenticator unlock using the WebAuthn API.
//
// There is NO server here, so we cannot verify a real signature. What we do:
//   - register a platform credential (Windows Hello, Touch ID, Android fingerprint)
//   - store its credential id in Firestore
//   - on unlock, ask the authenticator for that credential and compare the id
//
// This proves "the person at this device passed the device's own biometric/PIN".
// It is a device-bound convenience gate, NOT server-verified proof of identity.
// True verification needs a challenge issued + signature checked on a server.
// ---------------------------------------------------------------------------

function bufferToBase64url(buf) {
  const bytes = new Uint8Array(buf);
  let str = "";
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlToBuffer(str) {
  const pad = str.length % 4 === 0 ? "" : "=".repeat(4 - (str.length % 4));
  const b64 = (str + pad).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes.buffer;
}

export function biometricsSupported() {
  return typeof window !== "undefined"
    && !!window.PublicKeyCredential
    && !!navigator.credentials
    && typeof navigator.credentials.create === "function";
}

// Optional stronger check: is a platform authenticator actually available?
export async function platformAuthenticatorAvailable() {
  if (!biometricsSupported() || !window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
    return false;
  }
  try {
    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export async function getBiometricDevices(uid) {
  const snap = await getDocs(query(collection(db, COLLECTIONS.webauthn), where("uid", "==", uid)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Register the current device's platform authenticator for this user.
export async function registerBiometric(uid, name) {
  if (!biometricsSupported()) throw new Error("This browser does not support biometrics.");

  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const userId = crypto.getRandomValues(new Uint8Array(16));

  const cred = await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: { name: "AWA" },
      user: { id: userId, name: name || uid, displayName: name || uid },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },   // ES256
        { type: "public-key", alg: -257 }, // RS256
      ],
      authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
      timeout: 60000,
      attestation: "none",
    },
  });

  const credentialId = bufferToBase64url(cred.rawId);
  await addDoc(collection(db, COLLECTIONS.webauthn), {
    uid,
    credentialId,
    name: name || "This device",
    createdAt: serverTimestamp(),
  });
  return credentialId;
}

// Ask the authenticator to unlock one of the stored credentials.
export async function unlockWithBiometric(uid) {
  const devices = await getBiometricDevices(uid);
  if (devices.length === 0) throw new Error("No biometric device is set up.");

  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge,
      allowCredentials: devices.map((d) => ({
        id: base64urlToBuffer(d.credentialId),
        type: "public-key",
      })),
      userVerification: "required",
      timeout: 60000,
    },
  });

  const usedId = bufferToBase64url(assertion.rawId);
  const match = devices.find((d) => d.credentialId === usedId);
  if (!match) throw new Error("Unrecognized device.");
  return match;
}

export function removeBiometric(id) {
  return deleteDoc(doc(db, COLLECTIONS.webauthn, id));
}

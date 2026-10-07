import { addDoc, collection, deleteDoc, doc, getDocs, query, serverTimestamp, where } from "firebase/firestore";
import { db } from "../../config/firebase";
import { COLLECTIONS } from "../../config/appConfig";

// ---------------------------------------------------------------------------
// Device identity. We generate a random id once and keep it in localStorage.
// It is a convenience label for the user, NOT a security control (the browser
// could clear or fake it). Real trust would need server-side validation.
// ---------------------------------------------------------------------------
const DEVICE_KEY = "awa_device_id";

export function getDeviceId() {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = (crypto.randomUUID?.() || `dev-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

export function describeDevice() {
  const ua = navigator.userAgent;
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Browser";
  const os = /Windows/.test(ua) ? "Windows" : /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Mac/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "Unknown";
  return `${browser} on ${os}`;
}

// ---------------------------------------------------------------------------
// Login history. Written on every login; the user can read only their own.
// ---------------------------------------------------------------------------
export function recordLogin(uid, detail = "web") {
  return addDoc(collection(db, COLLECTIONS.loginHistory), {
    uid,
    deviceId: getDeviceId(),
    device: describeDevice(),
    detail,
    createdAt: serverTimestamp(),
  });
}

export async function getLoginHistory(uid) {
  const snap = await getDocs(query(collection(db, COLLECTIONS.loginHistory), where("uid", "==", uid)));
  const list = snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    // Face checks are recorded here too (deviceId "face") but are not logins.
    .filter((l) => l.deviceId !== "face");
  list.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
  return list.slice(0, 20);
}

// ---------------------------------------------------------------------------
// Trusted devices. The current browser can be remembered so the UI can skip
// the idle prompt / show a "known device" badge. Stored per uid + deviceId.
// ---------------------------------------------------------------------------
export async function getTrustedDevices(uid) {
  const snap = await getDocs(query(collection(db, COLLECTIONS.trustedDevices), where("uid", "==", uid)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function trustCurrentDevice(uid) {
  const deviceId = getDeviceId();
  const existing = await getDocs(query(collection(db, COLLECTIONS.trustedDevices), where("uid", "==", uid), where("deviceId", "==", deviceId)));
  if (!existing.empty) return;
  await addDoc(collection(db, COLLECTIONS.trustedDevices), {
    uid,
    deviceId,
    device: describeDevice(),
    createdAt: serverTimestamp(),
  });
}

export function removeTrustedDevice(id) {
  return deleteDoc(doc(db, COLLECTIONS.trustedDevices, id));
}

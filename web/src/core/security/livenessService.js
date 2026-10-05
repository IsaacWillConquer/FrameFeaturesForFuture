import { addDoc, collection, getDocs, query, serverTimestamp, where } from "firebase/firestore";
import { db } from "../../config/firebase";
import { COLLECTIONS } from "../../config/appConfig";

// ---------------------------------------------------------------------------
// Liveness-lite. We cannot do real anti-spoofing in the browser, so we run a
// simple challenge: make sure a face is present and moving between frames.
// This blocks a static printed photo from trivially passing. Recorded in
// login_history-style time. Honest limitation: not spoof-proof.
// ---------------------------------------------------------------------------
export function recordFaceCheck(uid, passed) {
  return addDoc(collection(db, COLLECTIONS.loginHistory), {
    uid,
    deviceId: "face",
    device: "Face check",
    detail: passed ? "face match (liveness-lite)" : "face check failed",
    createdAt: serverTimestamp(),
  });
}

export async function getFaceChecks(uid) {
  const snap = await getDocs(query(collection(db, COLLECTIONS.loginHistory), where("uid", "==", uid)));
  const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return list.filter((r) => r.deviceId === "face").slice(0, 10);
}

// Measure how much two descriptors differ (plain distance, no threshold).
export function descriptorDelta(a, b) {
  if (!a || !b) return Infinity;
  let sum = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

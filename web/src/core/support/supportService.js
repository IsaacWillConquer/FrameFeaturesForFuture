import {
  addDoc, collection, doc, getDocs, query, serverTimestamp, updateDoc, where,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { COLLECTIONS } from "../../config/appConfig";

// Support requests are the human fallback in the verification chain. A user who
// cannot pass any automated method files one; staff see it in /admin/support and
// can resolve it. This is what the "Ask staff for help" button actually does.

export async function createSupportRequest(uid, { name = "", email = "", reason = "verification", note = "" } = {}) {
  return addDoc(collection(db, COLLECTIONS.supportRequests), {
    uid,
    name,
    email,
    reason,
    note,
    status: "open",
    createdAt: serverTimestamp(),
  });
}

// A user's own requests (most recent first).
export async function getMySupportRequests(uid) {
  const snap = await getDocs(query(
    collection(db, COLLECTIONS.supportRequests),
    where("uid", "==", uid)
  ));
  const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  list.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
  return list;
}

export function resolveSupportRequest(id, resolvedBy, resolution = "") {
  return updateDoc(doc(db, COLLECTIONS.supportRequests, id), {
    status: "resolved",
    resolvedBy,
    resolution,
    resolvedAt: serverTimestamp(),
  });
}

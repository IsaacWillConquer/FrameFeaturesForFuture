import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import { COLLECTIONS } from "../config/appConfig";

// Call this from anywhere: logAction(uid, "login")
export async function logAction(uid, action, details = "") {
  try {
    await addDoc(collection(db, COLLECTIONS.logs), {
      uid,
      action,
      details,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("Log failed:", err);
  }
}

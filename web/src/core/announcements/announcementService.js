import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { COLLECTIONS } from "../../config/appConfig";

// Announcements are broadcast messages everyone can read; staff/admin write them.
export function createAnnouncement(authorUid, title, message) {
  return addDoc(collection(db, COLLECTIONS.announcements), {
    title,
    message,
    authorUid,
    createdAt: serverTimestamp(),
  });
}

// Admin-only in the rules (update: isAdmin).
export function updateAnnouncement(id, title, message) {
  return updateDoc(doc(db, COLLECTIONS.announcements, id), { title, message });
}

export function deleteAnnouncement(id) {
  return deleteDoc(doc(db, COLLECTIONS.announcements, id));
}

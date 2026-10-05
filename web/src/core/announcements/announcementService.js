import { addDoc, collection, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
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

export function deleteAnnouncement(id) {
  return deleteDoc(doc(db, COLLECTIONS.announcements, id));
}

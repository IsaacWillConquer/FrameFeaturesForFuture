import { addDoc, collection, doc, serverTimestamp, updateDoc, writeBatch } from "firebase/firestore";
import { db } from "../../config/firebase";
import { COLLECTIONS } from "../../config/appConfig";

// Same field names the Flutter app reads: userId, title, message, read, createdAt
export function notify(userId, title, message) {
  return addDoc(collection(db, COLLECTIONS.notifications), {
    userId,
    title,
    message,
    read: false,
    createdAt: serverTimestamp(),
  });
}

export function markRead(id) {
  return updateDoc(doc(db, COLLECTIONS.notifications, id), { read: true });
}

export async function markAllRead(items) {
  const batch = writeBatch(db);
  items.filter((n) => !n.read).forEach((n) => {
    batch.update(doc(db, COLLECTIONS.notifications, n.id), { read: true });
  });
  await batch.commit();
}

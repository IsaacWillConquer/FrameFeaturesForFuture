import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../config/firebase";
import { COLLECTIONS } from "../../config/appConfig";

// Live list of this user's notifications, newest first.
// Sorted here (not in the query) so no Firestore index is needed.
export function useNotifications(uid) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, COLLECTIONS.notifications), where("userId", "==", uid));
    return onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const time = (n) => n.createdAt?.toMillis?.() ?? Number.MAX_SAFE_INTEGER;
        list.sort((a, b) => time(b) - time(a));
        setItems(list);
      },
      (err) => console.error("Notifications:", err)
    );
  }, [uid]);

  // No uid (logged out) → always empty, without an extra render to clear
  return uid ? items : [];
}

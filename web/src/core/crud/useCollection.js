import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../config/firebase";

// Live list of every doc in a collection: { items, loading, error }
export function useCollection(name) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    return onSnapshot(
      collection(db, name),
      (snap) => {
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        setError(err.code === "permission-denied" ? "Blocked by database rules." : err.message);
        setLoading(false);
      }
    );
  }, [name]);

  return { items, loading, error };
}

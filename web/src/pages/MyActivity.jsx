import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebase";
import { COLLECTIONS } from "../config/appConfig";
import { useAuth } from "../core/auth/AuthProvider";
import Alert from "../core/ui/Alert";

// Your own recent activity (logins, 2FA, etc). Spot anything you don't recognize? Change your password.
export default function MyActivity() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDocs(query(collection(db, COLLECTIONS.logs), where("uid", "==", user.uid)));
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const time = (l) => l.createdAt?.toMillis?.() ?? 0;
        list.sort((a, b) => time(b) - time(a));
        setLogs(list.slice(0, 30));
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    }
    load();
  }, [user.uid]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My activity</h1>
      <Alert>{error}</Alert>
      {loading && <p role="status">Loading...</p>}
      {!loading && logs.length === 0 && <p>No activity yet.</p>}
      <ul className="space-y-2">
        {logs.map((l) => (
          <li key={l.id} className="bg-white border rounded p-3">
            <strong>{l.action}</strong>{l.details ? ` (${l.details})` : ""}
            <br />
            <span className="text-sm text-gray-700">{l.createdAt?.toDate().toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

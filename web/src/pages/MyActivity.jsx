import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Activity } from "lucide-react";
import { db } from "../config/firebase";
import { COLLECTIONS } from "../config/appConfig";
import { useAuth } from "../core/auth/AuthProvider";
import PageHeader from "../core/ui/PageHeader";
import Card, { CardBody } from "../core/ui/Card";
import EmptyState from "../core/ui/EmptyState";
import Spinner from "../core/ui/Spinner";

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
      <PageHeader title="My activity" description="Your latest account actions. Spot something odd? Change your password." />
      {error && <p className="mb-4 text-danger">{error}</p>}

      <Card>
        <CardBody>
          {loading ? (
            <div className="flex justify-center p-4"><Spinner /></div>
          ) : logs.length === 0 ? (
            <EmptyState icon={Activity} title="No activity yet" />
          ) : (
            <ul className="divide-y divide-border">
              {logs.map((l) => (
                <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <span className="font-medium text-fg">
                    {l.action}{l.details ? <span className="text-fg-muted"> · {l.details}</span> : ""}
                  </span>
                  <span className="text-sm text-fg-muted">{l.createdAt?.toDate().toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

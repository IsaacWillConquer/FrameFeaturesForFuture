import { useEffect, useState } from "react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from "../config/firebase";
import { COLLECTIONS } from "../config/appConfig";
import { useCollection } from "../core/crud/useCollection";
import Wide from "../core/layout/Wide";
import Alert from "../core/ui/Alert";
import Button from "../core/ui/Button";

// Last 100 log entries, with a search box. Staff and admin only.
export default function AuditLog() {
  const { items: users } = useCollection(COLLECTIONS.users);
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const snap = await getDocs(query(collection(db, COLLECTIONS.logs), orderBy("createdAt", "desc"), limit(100)));
      setLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const names = Object.fromEntries(users.map((u) => [u.id, u.name || u.email]));
  const shown = logs.filter((l) =>
    `${l.action} ${l.details} ${names[l.uid] || ""}`.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Wide>
      <h1 className="text-2xl font-bold mb-4">Audit log</h1>
      <Alert>{error}</Alert>
      <div className="flex flex-wrap items-end gap-4 mb-4">
        <div>
          <label htmlFor="filter" className="block font-medium mb-1">Search</label>
          <input id="filter" type="search" value={filter} onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-500 rounded px-3 py-2 min-h-11 bg-white" />
        </div>
        <Button onClick={load}>Refresh</Button>
      </div>

      {loading && <p role="status">Loading...</p>}
      <div className="overflow-x-auto">
        <table className="w-full text-left bg-white border">
          <caption className="sr-only">Most recent 100 actions</caption>
          <thead>
            <tr>
              <th scope="col" className="p-2 border">Time</th>
              <th scope="col" className="p-2 border">User</th>
              <th scope="col" className="p-2 border">Action</th>
              <th scope="col" className="p-2 border">Details</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((l) => (
              <tr key={l.id}>
                <td className="p-2 border whitespace-nowrap">{l.createdAt?.toDate().toLocaleString()}</td>
                <td className="p-2 border">{names[l.uid] || l.uid}</td>
                <td className="p-2 border">{l.action}</td>
                <td className="p-2 border">{l.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Wide>
  );
}

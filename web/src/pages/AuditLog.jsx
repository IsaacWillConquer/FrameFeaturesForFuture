import { useEffect, useState } from "react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { RefreshCw, Download, Printer } from "lucide-react";
import { db } from "../config/firebase";
import { COLLECTIONS } from "../config/appConfig";
import { useCollection } from "../core/crud/useCollection";
import { downloadCsv } from "../core/utils/csv";
import Alert from "../core/ui/Alert";
import Button from "../core/ui/Button";
import PageHeader from "../core/ui/PageHeader";
import { TableWrap, default as Table, Th, Td } from "../core/ui/Table";
import Spinner from "../core/ui/Spinner";
import Input from "../core/ui/Input";
import VoiceInput from "../core/a11y/VoiceInput";

// Last 100 log entries, with a search box. Staff and admin only.
export default function AuditLog() {
  const { items: users } = useCollection(COLLECTIONS.users);
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const pageSize = 25;

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
  const pageCount = Math.max(1, Math.ceil(shown.length / pageSize));
  const pageSafe = Math.min(page, pageCount - 1);
  const pageItems = shown.slice(pageSafe * pageSize, pageSafe * pageSize + pageSize);

  function exportCsv() {
    downloadCsv(
      "audit-log",
      ["Time", "User", "Action", "Details"],
      shown.map((l) => [l.createdAt?.toDate().toLocaleString() ?? "", names[l.uid] || l.uid, l.action, l.details || ""])
    );
  }

  return (
    <div>
      <PageHeader
        title="Audit log"
        description="The most recent 100 actions across the app."
        actions={
          <>
            <Button variant="secondary" onClick={exportCsv}><Download className="h-4 w-4" /> Export CSV</Button>
            <Button variant="secondary" onClick={() => window.print()}><Printer className="h-4 w-4" /> Print</Button>
            <Button onClick={load}><RefreshCw className="h-4 w-4" /> Refresh</Button>
          </>
        }
      />
      <Alert>{error}</Alert>

      <div className="mb-4 max-w-sm">
        <div>
          <label htmlFor="filter" className="mb-1 block font-medium text-fg">Search</label>
          <div className="flex gap-2">
            <Input id="filter" type="search" value={filter} onChange={(e) => setFilter(e.target.value)} />
            <VoiceInput label="Search by voice" onResult={(t) => setFilter(t)} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-6"><Spinner /></div>
      ) : (
        <TableWrap>
          <Table caption="Most recent 100 actions">
            <thead>
              <tr>
                <Th>Time</Th>
                <Th>User</Th>
                <Th>Action</Th>
                <Th>Details</Th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((l) => (
                <tr key={l.id}>
                  <Td className="whitespace-nowrap">{l.createdAt?.toDate().toLocaleString()}</Td>
                  <Td>{names[l.uid] || l.uid}</Td>
                  <Td>{l.action}</Td>
                  <Td>{l.details}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrap>
      )}

      {!loading && shown.length > pageSize && (
        <nav aria-label="Log pages" className="mt-3 flex items-center justify-center gap-3">
          <Button variant="secondary" onClick={() => setPage(Math.max(0, pageSafe - 1))} disabled={pageSafe === 0}>Previous</Button>
          <span className="text-sm text-fg-muted">Page {pageSafe + 1} of {pageCount} ({shown.length} rows)</span>
          <Button variant="secondary" onClick={() => setPage(Math.min(pageCount - 1, pageSafe + 1))} disabled={pageSafe >= pageCount - 1}>Next</Button>
        </nav>
      )}
    </div>
  );
}

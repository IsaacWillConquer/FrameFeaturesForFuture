import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { Download, Bell, Search } from "lucide-react";
import { db } from "../config/firebase";
import { COLLECTIONS, ROLES, hasRole } from "../config/appConfig";
import { useAuth } from "../core/auth/AuthProvider";
import { useCollection } from "../core/crud/useCollection";
import { notify } from "../core/notifications/notificationService";
import { logAction } from "../core/logger";
import { downloadCsv } from "../core/utils/csv";
import Alert from "../core/ui/Alert";
import PageHeader from "../core/ui/PageHeader";
import Badge from "../core/ui/Badge";
import Button from "../core/ui/Button";
import Input from "../core/ui/Input";
import FormField from "../core/ui/FormField";
import { TableWrap, default as Table, Th, Td } from "../core/ui/Table";
import Modal from "../core/ui/Modal";
import Spinner from "../core/ui/Spinner";
import VoiceInput from "../core/a11y/VoiceInput";

function roleVariant(role) {
  if (role === "admin") return "danger";
  if (role === "staff") return "primary";
  return "neutral";
}

// Staff can view + notify. Only admins can change roles or deactivate (the rules enforce this too).
export default function Users() {
  const { user, role } = useAuth();
  const { items, loading, error: loadError } = useCollection(COLLECTIONS.users);
  const isAdmin = role === "admin";
  const canNotify = hasRole(role, "staff");

  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [notifyTarget, setNotifyTarget] = useState(null);
  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyMsg, setNotifyMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function changeRole(u, newRole) {
    setError("");
    try {
      await updateDoc(doc(db, COLLECTIONS.users, u.id), { role: newRole });
      await logAction(user.uid, "role_change", `${u.email} -> ${newRole}`);
      setMessage(`${u.email} is now ${newRole}.`);
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleActive(u) {
    setError("");
    const makeActive = u.active === false;
    try {
      await updateDoc(doc(db, COLLECTIONS.users, u.id), { active: makeActive });
      await logAction(user.uid, makeActive ? "user_activate" : "user_deactivate", u.email);
      setMessage(`${u.email} ${makeActive ? "activated" : "deactivated"}.`);
    } catch (err) {
      setError(err.message);
    }
  }

  const shown = items.filter((u) =>
    `${u.name || ""} ${u.email || ""} ${u.role || ""}`.toLowerCase().includes(search.toLowerCase())
  );

  function exportCsv() {
    downloadCsv(
      "users",
      ["Name", "Email", "Role", "Status"],
      shown.map((u) => [u.name || "", u.email || "", u.role || "", u.active === false ? "deactivated" : "active"])
    );
  }

  async function sendNotify(e) {
    e.preventDefault();
    const target = notifyTarget;
    if (!target) return;
    setError("");
    setBusy(true);
    try {
      await notify(target.id, notifyTitle.trim(), notifyMsg.trim());
      await logAction(user.uid, "notify_user", target.email || target.id);
      setMessage(`Notification sent to ${target.name || target.email}.`);
      setNotifyTitle("");
      setNotifyMsg("");
      setNotifyTarget(null);
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  return (
    <div>
      <PageHeader
        title="Users"
        description="Everyone with an account. Admins can change roles and access."
        actions={<Button variant="secondary" onClick={exportCsv}><Download className="h-4 w-4" /> Export CSV</Button>}
      />
      <Alert>{error || loadError}</Alert>
      <Alert type="info">{message}</Alert>

      <div className="mb-4 max-w-sm">
        <label htmlFor="user-search" className="mb-1 block font-medium text-fg">Search</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" />
            <Input id="user-search" type="search" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <VoiceInput label="Search by voice" onResult={(t) => setSearch(t)} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-6"><Spinner /></div>
      ) : (
        <TableWrap>
          <Table caption="All users">
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                {canNotify && <Th>Actions</Th>}
              </tr>
            </thead>
            <tbody>
              {shown.map((u) => {
                const isMe = u.id === user.uid;
                return (
                  <tr key={u.id}>
                    <Td>{u.name || "—"}</Td>
                    <Td>{u.email}</Td>
                    <Td>
                      {isAdmin && !isMe ? (
                        <select aria-label={`Role for ${u.email}`} value={u.role} onChange={(e) => changeRole(u, e.target.value)}
                          className="rounded-lg border border-border bg-surface px-2 min-h-11">
                          {Object.keys(ROLES).map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                      ) : (
                        <Badge variant={roleVariant(u.role)}>{u.role}</Badge>
                      )}
                    </Td>
                    <Td>
                      <div className="flex items-center gap-3">
                        {u.active === false ? <Badge variant="danger">Deactivated</Badge> : <Badge variant="success">Active</Badge>}
                        {isAdmin && !isMe && (
                          <button onClick={() => toggleActive(u)} className="text-sm text-primary underline min-h-11">
                            {u.active === false ? "Activate" : "Deactivate"}
                          </button>
                        )}
                      </div>
                    </Td>
                    {canNotify && (
                      <Td className="whitespace-nowrap">
                        {!isMe && (
                          <button onClick={() => setNotifyTarget(u)}
                            className="inline-flex items-center gap-1 text-sm text-primary underline min-h-11">
                            <Bell className="h-4 w-4" /> Notify
                          </button>
                        )}
                      </Td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </TableWrap>
      )}
      {isAdmin && <p className="mt-4 text-sm text-fg-muted">You can&apos;t change your own role or status here (so you can&apos;t lock yourself out).</p>}

      <Modal open={!!notifyTarget} onClose={() => setNotifyTarget(null)}
        title={notifyTarget ? `Notify ${notifyTarget.name || notifyTarget.email}` : "Notify"}>
        <form onSubmit={sendNotify}>
          <FormField id="n-title" label="Title" value={notifyTitle} onChange={(e) => setNotifyTitle(e.target.value)} required />
          <FormField id="n-msg" label="Message" value={notifyMsg} onChange={(e) => setNotifyMsg(e.target.value)} required />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setNotifyTarget(null)}>Cancel</Button>
            <Button type="submit" disabled={busy}>{busy ? "Sending..." : "Send notification"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { COLLECTIONS, ROLES } from "../config/appConfig";
import { useAuth } from "../core/auth/AuthProvider";
import { useCollection } from "../core/crud/useCollection";
import { logAction } from "../core/logger";
import Alert from "../core/ui/Alert";
import PageHeader from "../core/ui/PageHeader";
import Badge from "../core/ui/Badge";
import { TableWrap, default as Table, Th, Td } from "../core/ui/Table";
import Spinner from "../core/ui/Spinner";

function roleVariant(role) {
  if (role === "admin") return "danger";
  if (role === "staff") return "primary";
  return "neutral";
}

// Staff can view. Only admins can change roles or deactivate (the rules enforce this too).
export default function Users() {
  const { user, role } = useAuth();
  const { items, loading, error: loadError } = useCollection(COLLECTIONS.users);
  const isAdmin = role === "admin";
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

  return (
    <div>
      <PageHeader title="Users" description="Everyone with an account. Admins can change roles and access." />
      <Alert>{error || loadError}</Alert>
      <Alert type="info">{message}</Alert>
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
              </tr>
            </thead>
            <tbody>
              {items.map((u) => {
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
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </TableWrap>
      )}
      {isAdmin && <p className="mt-4 text-sm text-fg-muted">You can't change your own role or status here (so you can't lock yourself out).</p>}
    </div>
  );
}

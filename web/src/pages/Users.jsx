import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { COLLECTIONS, ROLES } from "../config/appConfig";
import { useAuth } from "../core/auth/AuthProvider";
import { useCollection } from "../core/crud/useCollection";
import { logAction } from "../core/logger";
import Wide from "../core/layout/Wide";
import Alert from "../core/ui/Alert";

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
    <Wide>
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <Alert>{error || loadError}</Alert>
      <Alert type="info">{message}</Alert>
      {loading && <p role="status">Loading...</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-left bg-white border">
          <caption className="sr-only">All users</caption>
          <thead>
            <tr>
              <th scope="col" className="p-2 border">Name</th>
              <th scope="col" className="p-2 border">Email</th>
              <th scope="col" className="p-2 border">Role</th>
              <th scope="col" className="p-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((u) => {
              const isMe = u.id === user.uid;
              return (
                <tr key={u.id}>
                  <td className="p-2 border">{u.name}</td>
                  <td className="p-2 border">{u.email}</td>
                  <td className="p-2 border">
                    {isAdmin && !isMe ? (
                      <select aria-label={`Role for ${u.email}`} value={u.role} onChange={(e) => changeRole(u, e.target.value)}
                        className="border border-gray-500 rounded px-2 min-h-11 bg-white">
                        {Object.keys(ROLES).map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    ) : u.role}
                  </td>
                  <td className="p-2 border">
                    {u.active === false ? "Deactivated" : "Active"}
                    {isAdmin && !isMe && (
                      <button onClick={() => toggleActive(u)} className="underline min-h-11 ml-3">
                        {u.active === false ? "Activate" : "Deactivate"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {isAdmin && <p className="mt-4 text-sm">You can't change your own role or status here (so you can't lock yourself out).</p>}
    </Wide>
  );
}

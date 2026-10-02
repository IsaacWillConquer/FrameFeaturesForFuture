import { useState } from "react";
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { hasRole } from "../../config/appConfig";
import { useAuth } from "../auth/AuthProvider";
import { logAction } from "../logger";
import { useCollection } from "./useCollection";
import Wide from "../layout/Wide";
import Button from "../ui/Button";
import Alert from "../ui/Alert";

const inputClass = "w-full border border-gray-500 rounded px-3 py-2 min-h-11 bg-white";

// One config object = one full list + add + edit + delete screen. See modules/demo/itemsConfig.js
function Field({ field, value, onChange }) {
  const id = `f-${field.name}`;
  let input;
  if (field.type === "select") {
    input = (
      <select id={id} value={value} onChange={onChange} className={inputClass} required={field.required}>
        <option value="">Choose...</option>
        {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  } else if (field.type === "textarea") {
    input = <textarea id={id} value={value} onChange={onChange} className={inputClass} rows={3} required={field.required} />;
  } else {
    input = <input id={id} type={field.type || "text"} value={value} onChange={onChange} className={inputClass} required={field.required} />;
  }
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block font-medium mb-1">{field.label}{field.required ? " *" : ""}</label>
      {input}
    </div>
  );
}

export default function CrudPage({ config }) {
  const { title, collectionName, fields, writeRole = "staff" } = config;
  const { user, role } = useAuth();
  const { items, loading, error: loadError } = useCollection(collectionName);
  const canWrite = hasRole(role, writeRole);

  const [editing, setEditing] = useState(null); // null | "new" | item
  const [form, setForm] = useState({});
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function startNew() {
    setForm(Object.fromEntries(fields.map((f) => [f.name, ""])));
    setEditing("new");
    setMessage("");
  }

  function startEdit(item) {
    setForm(Object.fromEntries(fields.map((f) => [f.name, item[f.name] ?? ""])));
    setEditing(item);
    setMessage("");
  }

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    const data = {};
    fields.forEach((f) => {
      data[f.name] = f.type === "number" && form[f.name] !== "" ? Number(form[f.name]) : form[f.name];
    });
    try {
      if (editing === "new") {
        await addDoc(collection(db, collectionName), { ...data, createdBy: user.uid, createdAt: serverTimestamp() });
        await logAction(user.uid, `${collectionName}_create`, String(data[fields[0].name]));
        setMessage("Added.");
      } else {
        await updateDoc(doc(db, collectionName, editing.id), { ...data, updatedAt: serverTimestamp() });
        await logAction(user.uid, `${collectionName}_update`, editing.id);
        setMessage("Saved.");
      }
      setEditing(null);
    } catch (err) {
      setError(err.code === "permission-denied" ? "Blocked by database rules." : err.message);
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Delete "${item[fields[0].name]}"? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, collectionName, item.id));
      await logAction(user.uid, `${collectionName}_delete`, item.id);
      setMessage("Deleted.");
    } catch (err) {
      setError(err.message);
    }
  }

  const shown = items.filter((item) =>
    fields.some((f) => String(item[f.name] ?? "").toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Wide>
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      <Alert>{error || loadError}</Alert>
      <Alert type="info">{message}</Alert>

      {editing && (
        <form onSubmit={handleSave} className="bg-white border rounded p-4 mb-6 max-w-md">
          <h2 className="text-xl font-semibold mb-3">{editing === "new" ? "Add" : "Edit"}</h2>
          {fields.map((f) => (
            <Field key={f.name} field={f} value={form[f.name]} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} />
          ))}
          <div className="flex gap-3">
            <Button type="submit">Save</Button>
            <button type="button" onClick={() => setEditing(null)} className="underline min-h-11">Cancel</button>
          </div>
        </form>
      )}

      <div className="flex flex-wrap items-end gap-4 mb-4">
        <div>
          <label htmlFor="search" className="block font-medium mb-1">Search</label>
          <input id="search" type="search" value={search} onChange={(e) => setSearch(e.target.value)} className={inputClass} />
        </div>
        {canWrite && <Button onClick={startNew}>Add new</Button>}
      </div>

      {loading && <p role="status">Loading...</p>}
      {!loading && shown.length === 0 && <p>Nothing here yet.</p>}

      {shown.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left bg-white border">
            <caption className="sr-only">{title}</caption>
            <thead>
              <tr>
                {fields.map((f) => <th key={f.name} scope="col" className="p-2 border">{f.label}</th>)}
                {canWrite && <th scope="col" className="p-2 border">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {shown.map((item) => (
                <tr key={item.id}>
                  {fields.map((f) => <td key={f.name} className="p-2 border">{String(item[f.name] ?? "")}</td>)}
                  {canWrite && (
                    <td className="p-2 border whitespace-nowrap">
                      <button onClick={() => startEdit(item)} className="underline min-h-11 mr-3">Edit</button>
                      <button onClick={() => handleDelete(item)} className="underline min-h-11">Delete</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Wide>
  );
}

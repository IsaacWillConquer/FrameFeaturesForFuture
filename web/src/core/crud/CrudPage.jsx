import { useState } from "react";
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { Plus, Pencil, Trash2, Download, Search, Printer } from "lucide-react";
import { db } from "../../config/firebase";
import { hasRole } from "../../config/appConfig";
import { useAuth } from "../auth/AuthProvider";
import { logAction } from "../logger";
import { useCollection } from "./useCollection";
import { downloadCsv } from "../utils/csv";
import Button from "../ui/Button";
import Alert from "../ui/Alert";
import PageHeader from "../ui/PageHeader";
import Card, { CardBody } from "../ui/Card";
import { ConfirmDialog } from "../ui/Modal";
import { TableWrap, default as Table, Th, Td } from "../ui/Table";
import Spinner from "../ui/Spinner";
import EmptyState from "../ui/EmptyState";
import Input from "../ui/Input";
import VoiceInput from "../a11y/VoiceInput";

const inputClass = "w-full rounded-lg border border-border bg-surface px-3 py-2 min-h-11 text-fg";

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
      <label htmlFor={id} className="mb-1 block font-medium text-fg">{field.label}{field.required ? " *" : ""}</label>
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
  const [pendingDelete, setPendingDelete] = useState(null);

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

  async function handleDelete() {
    const item = pendingDelete;
    setPendingDelete(null);
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

  function exportCsv() {
    downloadCsv(
      collectionName,
      fields.map((f) => f.label),
      shown.map((item) => fields.map((f) => item[f.name] ?? ""))
    );
  }

  return (
    <div>
      <PageHeader
        title={title}
        actions={
          <>
            <Button variant="secondary" onClick={exportCsv}><Download className="h-4 w-4" /> Export</Button>
            <Button variant="secondary" onClick={() => window.print()}><Printer className="h-4 w-4" /> Print</Button>
            {canWrite && <Button onClick={startNew}><Plus className="h-4 w-4" /> Add new</Button>}
          </>
        }
      />
      <Alert>{error || loadError}</Alert>
      <Alert type="info">{message}</Alert>

      {editing && (
        <Card className="mb-6 max-w-lg">
          <CardBody>
            <h2 className="mb-3 text-lg font-semibold text-fg">{editing === "new" ? "Add" : "Edit"}</h2>
            <form onSubmit={handleSave}>
              {fields.map((f) => (
                <Field key={f.name} field={f} value={form[f.name]} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} />
              ))}
              <div className="flex gap-3">
                <Button type="submit">Save</Button>
                <Button type="button" variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      <div className="mb-4 flex flex-wrap items-end gap-4">
        <div className="w-full max-w-xs">
          <label htmlFor="search" className="mb-1 block font-medium text-fg">Search</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" />
              <Input id="search" type="search" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <VoiceInput label="Search by voice" onResult={(t) => setSearch(t)} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-6"><Spinner /></div>
      ) : shown.length === 0 ? (
        <Card><EmptyState title="Nothing here yet" description={canWrite ? "Use Add new to create the first one." : "Check back later."} /></Card>
      ) : (
        <TableWrap>
          <Table caption={title}>
            <thead>
              <tr>
                {fields.map((f) => <Th key={f.name}>{f.label}</Th>)}
                {canWrite && <Th>Actions</Th>}
              </tr>
            </thead>
            <tbody>
              {shown.map((item) => (
                <tr key={item.id}>
                  {fields.map((f) => <Td key={f.name}>{String(item[f.name] ?? "")}</Td>)}
                  {canWrite && (
                    <Td className="whitespace-nowrap">
                      <div className="flex gap-3">
                        <button onClick={() => startEdit(item)} className="inline-flex items-center gap-1 text-sm text-primary underline min-h-11">
                          <Pencil className="h-4 w-4" /> Edit
                        </button>
                        <button onClick={() => setPendingDelete(item)} className="inline-flex items-center gap-1 text-sm text-danger underline min-h-11">
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      </div>
                    </Td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrap>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete item"
        message={pendingDelete ? `Delete "${pendingDelete[fields[0].name]}"? This cannot be undone.` : ""}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

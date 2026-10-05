import { useState } from "react";
import { Megaphone, Trash2, Plus } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { useAuth } from "../core/auth/AuthProvider";
import { useCollection } from "../core/crud/useCollection";
import { db } from "../config/firebase";
import { COLLECTIONS, hasRole } from "../config/appConfig";
import { createAnnouncement, deleteAnnouncement } from "../core/announcements/announcementService";
import { notify } from "../core/notifications/notificationService";
import { logAction } from "../core/logger";
import PageHeader from "../core/ui/PageHeader";
import Card, { CardBody } from "../core/ui/Card";
import Button from "../core/ui/Button";
import Alert from "../core/ui/Alert";
import EmptyState from "../core/ui/EmptyState";
import FormField from "../core/ui/FormField";
import { ConfirmDialog } from "../core/ui/Modal";

export default function Announcements() {
  const { user, role } = useAuth();
  const { items, loading, error: loadError } = useCollection(COLLECTIONS.announcements);
  const canPost = hasRole(role, "staff");

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  const sorted = [...items].sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));

  async function handlePost(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await createAnnouncement(user.uid, title.trim(), message.trim());
      await logAction(user.uid, "announcement_create", title.trim());
      // Push a notification to every user. Best-effort: ignore if rules block it.
      try {
        const usersSnap = await getDocs(collection(db, COLLECTIONS.users));
        await Promise.all(usersSnap.docs.map((d) => notify(d.id, `Announcement: ${title.trim()}`, message.trim())));
      } catch { /* notifications are a bonus, not required */ }
      setTitle("");
      setMessage("");
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  async function handleDelete() {
    const item = pendingDelete;
    setPendingDelete(null);
    try {
      await deleteAnnouncement(item.id);
      await logAction(user.uid, "announcement_delete", item.title);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <PageHeader
        title="Announcements"
        description="Broadcast messages from staff."
        actions={canPost && <Button onClick={() => setShowForm((v) => !v)}><Plus className="h-4 w-4" /> New</Button>}
      />
      <Alert>{error || loadError}</Alert>

      {showForm && canPost && (
        <Card className="mb-6 max-w-lg">
          <CardBody>
            <form onSubmit={handlePost}>
              <FormField id="a-title" label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              <div className="mb-4">
                <label htmlFor="a-message" className="mb-1 block font-medium text-fg">Message</label>
                <textarea id="a-message" value={message} onChange={(e) => setMessage(e.target.value)} rows={4} required
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-fg" />
              </div>
              <Button type="submit" disabled={busy}>{busy ? "Posting..." : "Post announcement"}</Button>
            </form>
          </CardBody>
        </Card>
      )}

      {loading ? (
        <p className="text-fg-muted">Loading...</p>
      ) : sorted.length === 0 ? (
        <Card><EmptyState icon={Megaphone} title="No announcements yet" description="Staff can post updates here." /></Card>
      ) : (
        <ul className="space-y-3">
          {sorted.map((a) => (
            <li key={a.id}>
              <Card className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-fg">{a.title}</p>
                    <p className="mt-1 whitespace-pre-wrap text-fg-muted">{a.message}</p>
                  </div>
                  {canPost && (
                    <button onClick={() => setPendingDelete(a)} aria-label={`Delete ${a.title}`}
                      className="rounded-md p-2 text-danger hover:bg-surface-2">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {a.createdAt && <p className="mt-2 text-sm text-fg-muted">{a.createdAt.toDate().toLocaleString()}</p>}
              </Card>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete announcement"
        message={pendingDelete ? `Delete "${pendingDelete.title}"?` : ""}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

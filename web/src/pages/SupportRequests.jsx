import { useState } from "react";
import { LifeBuoy } from "lucide-react";
import { useAuth } from "../core/auth/AuthProvider";
import { useCollection } from "../core/crud/useCollection";
import { resolveSupportRequest } from "../core/support/supportService";
import { COLLECTIONS } from "../config/appConfig";
import { logAction } from "../core/logger";
import PageHeader from "../core/ui/PageHeader";
import Card, { CardHeader, CardBody } from "../core/ui/Card";
import Button from "../core/ui/Button";
import Alert from "../core/ui/Alert";
import Badge from "../core/ui/Badge";
import EmptyState from "../core/ui/EmptyState";
import Spinner from "../core/ui/Spinner";

function RequestRow({ r, busyId, onResolve }) {
  const done = r.status === "resolved";
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 py-3">
      <div className="min-w-0">
        <p className="font-medium text-fg">{r.name || r.email || r.uid}</p>
        <p className="text-sm text-fg-muted">
          {r.note || "No message"} · {r.createdAt?.toDate().toLocaleString()}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant={done ? "success" : "warning"}>{done ? "resolved" : "open"}</Badge>
        {!done && (
          <Button variant="secondary" disabled={busyId === r.id} onClick={() => onResolve(r.id)}>
            {busyId === r.id ? "Saving..." : "Mark resolved"}
          </Button>
        )}
      </div>
    </li>
  );
}

// Staff view of the human fallback in the verification chain. Every request
// filed from "Ask staff for help" lands here.
export default function SupportRequests() {
  const { user } = useAuth();
  const { items, loading, error } = useCollection(COLLECTIONS.supportRequests);
  const [busyId, setBusyId] = useState("");
  const [message, setMessage] = useState("");

  const open = items.filter((r) => r.status !== "resolved");
  const resolved = items.filter((r) => r.status === "resolved");

  async function handleResolve(id) {
    setBusyId(id);
    setMessage("");
    try {
      await resolveSupportRequest(id, user.uid, "Verified in person");
      await logAction(user.uid, "support_resolve", id);
      setMessage("Marked as resolved.");
    } catch (err) {
      setMessage(err.message);
    }
    setBusyId("");
  }

  return (
    <div>
      <PageHeader title="Support requests" description="People who need staff to verify them in person." />
      <Alert>{error}</Alert>
      <Alert type="info">{message}</Alert>

      <Card>
        <CardHeader title={`Open (${open.length})`} />
        <CardBody>
          {loading ? (
            <div className="flex justify-center p-4"><Spinner /></div>
          ) : open.length === 0 ? (
            <EmptyState icon={LifeBuoy} title="No open requests" description="Nothing needs your attention right now." />
          ) : (
            <ul className="divide-y divide-border">
              {open.map((r) => <RequestRow key={r.id} r={r} busyId={busyId} onResolve={handleResolve} />)}
            </ul>
          )}
        </CardBody>
      </Card>

      {resolved.length > 0 && (
        <Card className="mt-6">
          <CardHeader title={`Resolved (${resolved.length})`} />
          <CardBody>
            <ul className="divide-y divide-border">
              {resolved.map((r) => <RequestRow key={r.id} r={r} busyId={busyId} onResolve={handleResolve} />)}
            </ul>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

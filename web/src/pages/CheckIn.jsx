import { useEffect, useState } from "react";
import { LogIn, Printer, CheckCircle2 } from "lucide-react";
import { addDoc, collection, getDocs, query, serverTimestamp, where } from "firebase/firestore";
import { db } from "../config/firebase";
import { COLLECTIONS } from "../config/appConfig";
import { useAuth } from "../core/auth/AuthProvider";
import { logAction } from "../core/logger";
import { hasRole } from "../config/appConfig";
import PageHeader from "../core/ui/PageHeader";
import Card, { CardHeader, CardBody } from "../core/ui/Card";
import Button from "../core/ui/Button";
import Alert from "../core/ui/Alert";
import Badge from "../core/ui/Badge";
import EmptyState from "../core/ui/EmptyState";
import Spinner from "../core/ui/Spinner";
import Avatar from "../core/ui/Avatar";
import FormField from "../core/ui/FormField";
import VoiceInput from "../core/a11y/VoiceInput";

export default function CheckIn() {
  const { user, profile, role } = useAuth();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, COLLECTIONS.checkins), where("uid", "==", user.uid)));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
      setVisits(list.slice(0, 20));
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, [user.uid]);

  async function handleCheckIn(e) {
    e.preventDefault();
    setError(""); setMessage("");
    try {
      await addDoc(collection(db, COLLECTIONS.checkins), {
        uid: user.uid,
        name: profile?.name || user.email,
        note: note || "Walk-in",
        createdAt: serverTimestamp(),
      });
      await logAction(user.uid, "checkin", note || "walk-in");
      setMessage("Checked in. Welcome!");
      setNote("");
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <PageHeader title="Check-in" description="Record a visit and print an ID card." />
      <Alert>{error}</Alert>
      <Alert type="info">{message}</Alert>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Check in now" />
          <CardBody>
            <form onSubmit={handleCheckIn}>
              <div className="mb-4">
                <label htmlFor="checkin-note" className="mb-1 block font-medium text-fg">Purpose (optional)</label>
                <div className="flex gap-2">
                  <input id="checkin-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Consultation"
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 min-h-11 text-fg" />
                  <VoiceInput label="Purpose by voice" onResult={(t) => setNote(t)} />
                </div>
              </div>
              <Button type="submit"><LogIn className="h-4 w-4" /> Check in</Button>
            </form>

            <div className="mt-6">
              <h3 className="mb-2 font-semibold text-fg">Recent check-ins</h3>
              {loading ? (
                <div className="flex justify-center p-4"><Spinner /></div>
              ) : visits.length === 0 ? (
                <EmptyState icon={CheckCircle2} title="No check-ins yet" />
              ) : (
                <ul className="divide-y divide-border">
                  {visits.map((v) => (
                    <li key={v.id} className="flex items-center justify-between gap-3 py-2">
                      <span className="text-fg">{v.note}</span>
                      <span className="text-sm text-fg-muted">{v.createdAt?.toDate().toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Your ID card"
            description="Print or save as PDF."
            actions={<Button variant="secondary" onClick={() => window.print()}><Printer className="h-4 w-4" /> Print</Button>}
          />
          <CardBody>
            <div className="mx-auto max-w-sm rounded-xl border-2 border-primary bg-surface p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-bold text-primary">AWA</span>
                <Badge variant="primary">{role}</Badge>
              </div>
              <div className="flex items-center gap-4">
                <Avatar name={profile?.name || user.email} size="lg" />
                <div>
                  <p className="text-lg font-semibold text-fg">{profile?.name || "Unnamed user"}</p>
                  <p className="text-sm text-fg-muted">{user.email}</p>
                  <p className="mt-1 font-mono text-xs text-fg-muted">ID: {user.uid.slice(0, 8).toUpperCase()}</p>
                </div>
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-fg-muted">
              Demo ID card. {hasRole(role, "staff") ? "Staff access." : ""}
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

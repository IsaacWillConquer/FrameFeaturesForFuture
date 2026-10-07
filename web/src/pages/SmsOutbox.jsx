import { useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { useAuth } from "../core/auth/AuthProvider";
import { useCollection } from "../core/crud/useCollection";
import { COLLECTIONS, hasRole } from "../config/appConfig";
import { sendSms } from "../adapters/smsService";
import { logAction } from "../core/logger";
import PageHeader from "../core/ui/PageHeader";
import Card, { CardHeader, CardBody } from "../core/ui/Card";
import Button from "../core/ui/Button";
import Alert from "../core/ui/Alert";
import Badge from "../core/ui/Badge";
import EmptyState from "../core/ui/EmptyState";
import FormField from "../core/ui/FormField";
import { TableWrap, default as Table, Th, Td } from "../core/ui/Table";
import VoiceInput from "../core/a11y/VoiceInput";

// SIMULATED SMS. Messages are saved to sms_outbox instead of being sent.
// Staff/admin can read the outbox; any signed-in user can "send".
export default function SmsOutbox() {
  const { user, role } = useAuth();
  const canRead = hasRole(role, "staff");
  const { items, loading, error: loadError } = useCollection(COLLECTIONS.smsOutbox);

  const [to, setTo] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  const sorted = [...items].sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));

  async function handleSend(e) {
    e.preventDefault();
    setError(""); setInfo(""); setBusy(true);
    try {
      await sendSms(to, message);
      await logAction(user.uid, "sms_send", to);
      setInfo("Message saved to the simulated outbox.");
      setTo(""); setMessage("");
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  return (
    <div>
      <PageHeader title="SMS outbox" description="Simulated text messages for the demo." />
      <Alert type="warning">Simulation only. No real text message is sent anywhere.</Alert>
      <Alert>{error || loadError}</Alert>
      <Alert type="info">{info}</Alert>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Compose" />
          <CardBody>
            <form onSubmit={handleSend}>
              <FormField id="sms-to" label="To (phone number)" value={to}
                onChange={(e) => setTo(e.target.value)} required placeholder="+63 900 000 0000" />
              <div className="mb-4">
                <label htmlFor="sms-msg" className="mb-1 block font-medium text-fg">Message</label>
                <div className="flex items-start gap-2">
                  <textarea id="sms-msg" value={message} onChange={(e) => setMessage(e.target.value)} rows={4} required
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-fg" />
                  <VoiceInput label="Message by voice" onResult={(t) => setMessage(t)} />
                </div>
              </div>
              <Button type="submit" disabled={busy}><Send className="h-4 w-4" /> {busy ? "Saving..." : "Send (simulated)"}</Button>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Outbox" actions={<Badge variant="neutral">Simulated</Badge>} />
          <CardBody>
            {!canRead ? (
              <EmptyState icon={MessageSquare} title="Staff only" description="The outbox is visible to staff and admins." />
            ) : loading ? (
              <p className="text-fg-muted">Loading...</p>
            ) : sorted.length === 0 ? (
              <EmptyState icon={MessageSquare} title="Outbox is empty" />
            ) : (
              <TableWrap>
                <Table caption="Simulated SMS outbox">
                  <thead>
                    <tr><Th>To</Th><Th>Message</Th><Th>Status</Th></tr>
                  </thead>
                  <tbody>
                    {sorted.map((s) => (
                      <tr key={s.id}>
                        <Td className="whitespace-nowrap">{s.to}</Td>
                        <Td>{s.message}</Td>
                        <Td><Badge variant="neutral">{s.status}</Badge></Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </TableWrap>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

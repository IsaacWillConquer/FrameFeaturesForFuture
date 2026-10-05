import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Plus, Send } from "lucide-react";
import { useAuth } from "../core/auth/AuthProvider";
import { useCollection } from "../core/crud/useCollection";
import { COLLECTIONS } from "../config/appConfig";
import { getWallet, getTransactions, payTo, topUp } from "../adapters/paymentService";
import { logAction } from "../core/logger";
import PageHeader from "../core/ui/PageHeader";
import Card, { CardHeader, CardBody } from "../core/ui/Card";
import StatCard from "../core/ui/StatCard";
import Button from "../core/ui/Button";
import Alert from "../core/ui/Alert";
import Badge from "../core/ui/Badge";
import EmptyState from "../core/ui/EmptyState";
import Spinner from "../core/ui/Spinner";
import FormField from "../core/ui/FormField";

export default function Wallet() {
  const { user, role } = useAuth();
  const { items: users } = useCollection(COLLECTIONS.users);
  const [wallet, setWallet] = useState(null);
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [payToId, setPayToId] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [payNote, setPayNote] = useState("");
  const [topAmount, setTopAmount] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [w, t] = await Promise.all([getWallet(user.uid), getTransactions(user.uid)]);
      setWallet(w);
      setTxns(t);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, [user.uid]);

  const others = users.filter((u) => u.id !== user.uid);

  async function handlePay(e) {
    e.preventDefault();
    setError(""); setMessage(""); setBusy(true);
    try {
      await payTo(user.uid, payToId, payAmount, payNote);
      await logAction(user.uid, "payment_sent", `${payAmount} to ${payToId}`);
      setMessage(`Sent ${payAmount} (simulated).`);
      setPayAmount(""); setPayNote("");
      await load();
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  async function handleTopUp(e) {
    e.preventDefault();
    setError(""); setMessage(""); setBusy(true);
    try {
      await topUp(user.uid, topAmount);
      await logAction(user.uid, "wallet_topup", String(topAmount));
      setMessage(`Added ${topAmount} (simulated).`);
      setTopAmount("");
      await load();
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  return (
    <div>
      <PageHeader title="Wallet" description="Simulated balance and QR payments for the demo." />

      {role === "user" && (
        <Alert type="warning">Demo money only. Nothing here is a real payment.</Alert>
      )}
      <Alert>{error}</Alert>
      <Alert type="info">{message}</Alert>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Balance" value={loading ? "..." : wallet?.balance ?? 0} icon={WalletIcon} hint="Demo credits" />
        <StatCard label="Transactions" value={txns.length} icon={ArrowUpRight} />
        <StatCard label="Top-ups" value={txns.filter((t) => t.type === "topup").length} icon={Plus} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Send payment" description="Move demo credits to another user." />
          <CardBody>
            <form onSubmit={handlePay}>
              <div className="mb-4">
                <label htmlFor="pay-to" className="mb-1 block font-medium text-fg">Recipient</label>
                <select id="pay-to" value={payToId} onChange={(e) => setPayToId(e.target.value)} required
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 min-h-11 text-fg">
                  <option value="">Choose a user...</option>
                  {others.map((u) => <option key={u.id} value={u.id}>{u.name || u.email}</option>)}
                </select>
              </div>
              <FormField id="pay-amount" label="Amount" type="number" value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)} required />
              <FormField id="pay-note" label="Note (optional)" value={payNote}
                onChange={(e) => setPayNote(e.target.value)} />
              <Button type="submit" disabled={busy}><Send className="h-4 w-4" /> Send</Button>
            </form>
            <div className="my-4 flex items-center gap-3 text-xs text-fg-muted">
              <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
            </div>
            <form onSubmit={handleTopUp} className="flex items-end gap-3">
              <div className="flex-1">
                <FormField id="top-amount" label="Add demo credits" type="number" value={topAmount}
                  onChange={(e) => setTopAmount(e.target.value)} required />
              </div>
              <Button type="submit" variant="secondary" disabled={busy}><Plus className="h-4 w-4" /> Top up</Button>
            </form>
            <p className="mt-3 text-sm text-fg-muted">
              <Link to="/qr-demo" className="text-primary underline">Make a payment QR</Link> to scan on another device.
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Recent transactions" />
          <CardBody>
            {loading ? (
              <div className="flex justify-center p-4"><Spinner /></div>
            ) : txns.length === 0 ? (
              <EmptyState icon={WalletIcon} title="No transactions yet" />
            ) : (
              <ul className="divide-y divide-border">
                {txns.map((t) => {
                  const outgoing = t.type === "payment_sent";
                  return (
                    <li key={t.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="flex items-center gap-3">
                        {outgoing
                          ? <ArrowUpRight aria-hidden="true" className="h-5 w-5 text-danger" />
                          : <ArrowDownLeft aria-hidden="true" className="h-5 w-5 text-success" />}
                        <div>
                          <p className="font-medium text-fg">{t.type.replace(/_/g, " ")}</p>
                          <p className="text-sm text-fg-muted">{t.note || "—"}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-fg">{outgoing ? "-" : "+"}{t.amount}</p>
                        <span className="text-sm text-fg-muted">{t.createdAt?.toDate().toLocaleDateString()}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      <p className="mt-6 text-sm text-fg-muted"><Badge variant="neutral">Simulated</Badge> Wallet, SMS and payments are mock features for the capstone demo.</p>
    </div>
  );
}

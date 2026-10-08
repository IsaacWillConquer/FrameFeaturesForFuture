import { useEffect, useState } from "react";
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Plus, Send, QrCode } from "lucide-react";
import { useAuth } from "../core/auth/AuthProvider";
import { useCollection } from "../core/crud/useCollection";
import { COLLECTIONS } from "../config/appConfig";
import { getWallet, getTransactions, payTo, topUp } from "../adapters/paymentService";
import { logAction } from "../core/logger";
import { encodePaymentQR, encodeProfileQR, parsePaymentQR } from "../core/qr/paymentQR";
import QRGenerator from "../core/qr/QRGenerator";
import QRScanner from "../core/qr/QRScanner";
import PageHeader from "../core/ui/PageHeader";
import Card, { CardHeader, CardBody } from "../core/ui/Card";
import StatCard from "../core/ui/StatCard";
import Button from "../core/ui/Button";
import Alert from "../core/ui/Alert";
import Badge from "../core/ui/Badge";
import EmptyState from "../core/ui/EmptyState";
import Spinner from "../core/ui/Spinner";
import FormField from "../core/ui/FormField";
import VoiceInput from "../core/a11y/VoiceInput";

async function fetchWallet(uid) {
  return Promise.all([getWallet(uid), getTransactions(uid)]);
}

export default function Wallet() {
  const { user, role, profile } = useAuth();
  const { items: people, error: peopleError } = useCollection(COLLECTIONS.publicProfiles);
  const [wallet, setWallet] = useState(null);
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [payToId, setPayToId] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [payNote, setPayNote] = useState("");
  const [topAmount, setTopAmount] = useState("");
  const [showQr, setShowQr] = useState(false);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [w, t] = await fetchWallet(user.uid);
      setWallet(w);
      setTxns(t);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    let alive = true;
    fetchWallet(user.uid)
      .then(([w, t]) => { if (alive) { setWallet(w); setTxns(t); } })
      .catch((err) => { if (alive) setError(err.message); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [user.uid]);

  const others = people.filter((u) => u.id !== user.uid);
  const nameOf = (id) => others.find((u) => u.id === id)?.name || id;
  const canPay = payToId && Number(payAmount) > 0;

  async function handlePay(e) {
    e.preventDefault();
    setError(""); setMessage(""); setBusy(true);
    try {
      await payTo(user.uid, payToId, payAmount, payNote);
      await logAction(user.uid, "payment_sent", `${payAmount} to ${payToId}`);
      setMessage(`Sent ${payAmount} (simulated).`);
      setPayAmount(""); setPayNote(""); setShowQr(false);
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

  // A scanned QR either asks to be paid (prefill the form) or identifies the
  // person to pay (their "receive" code).
  function handleScan(text) {
    const data = parsePaymentQR(text);
    if (!data) {
      setError("That QR is not an AWA payment or profile code.");
      return;
    }
    setError("");
    if (data.t === "pay") {
      setPayToId(data.toUid);
      setPayAmount(String(data.amount));
      setPayNote(data.note || "");
      setMessage(`Scanned a request for ${data.amount} (simulated). Check the details, then press Send.`);
    } else {
      setPayToId(data.uid);
      setMessage(`Scanned the recipient${data.name ? ` ${data.name}` : ""}. Enter an amount and press Send.`);
    }
  }

  return (
    <div>
      <PageHeader title="Wallet" description="Simulated balance, QR payments and transfers for the demo." />

      {role === "user" && (
        <Alert type="warning">Demo money only. Nothing here is a real payment.</Alert>
      )}
      <Alert>{error}</Alert>
      <Alert>{peopleError}</Alert>
      <Alert type="info">{message}</Alert>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Balance" value={loading ? "..." : wallet?.balance ?? 0} icon={WalletIcon} hint="Demo credits" />
        <StatCard label="Transactions" value={txns.length} icon={ArrowUpRight} />
        <StatCard label="Top-ups" value={txns.filter((t) => t.type === "topup").length} icon={Plus} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Send payment" description="Move demo credits to another user, or scan their code." />
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
              <div className="mb-4">
                <label htmlFor="pay-amount" className="mb-1 block font-medium text-fg">Amount</label>
                <div className="flex gap-2">
                  <input id="pay-amount" type="number" value={payAmount} required
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 min-h-11 text-fg" />
                  <VoiceInput label="Amount by voice" onResult={(t) => setPayAmount(t.replace(/[^0-9.]/g, ""))} />
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="pay-note" className="mb-1 block font-medium text-fg">Note (optional)</label>
                <div className="flex gap-2">
                  <input id="pay-note" value={payNote} onChange={(e) => setPayNote(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 min-h-11 text-fg" />
                  <VoiceInput label="Note by voice" onResult={(t) => setPayNote(t)} />
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={busy}><Send className="h-4 w-4" /> Send</Button>
                <Button type="button" variant="secondary" disabled={!canPay} onClick={() => setShowQr((v) => !v)}>
                  <QrCode className="h-4 w-4" /> {showQr ? "Hide payment QR" : "Show payment QR"}
                </Button>
              </div>
            </form>

            {showQr && canPay && (
              <div className="mt-4">
                <p className="mb-2 text-sm text-fg-muted">
                  Show this to <strong>{nameOf(payToId)}</strong> to request {payAmount} (simulated).
                </p>
                <QRGenerator value={encodePaymentQR({ toUid: payToId, amount: payAmount, note: payNote })} />
              </div>
            )}

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

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Scan to pay" description="Scan an AWA payment or profile QR code." />
          <CardBody>
            <QRScanner onScan={handleScan} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="My receive code" description="Let someone scan this to pay you." />
          <CardBody>
            <QRGenerator value={encodeProfileQR({ uid: user.uid, name: profile?.name || "" })} />
          </CardBody>
        </Card>
      </div>

      <p className="mt-6 text-sm text-fg-muted"><Badge variant="neutral">Simulated</Badge> Wallet, SMS and payments are mock features for the capstone demo.</p>
    </div>
  );
}

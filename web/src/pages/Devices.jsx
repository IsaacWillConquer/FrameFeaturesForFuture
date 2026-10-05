import { useEffect, useState } from "react";
import { MonitorSmartphone, Laptop, Check } from "lucide-react";
import { useAuth } from "../core/auth/AuthProvider";
import {
  getLoginHistory, getTrustedDevices, trustCurrentDevice, removeTrustedDevice, getDeviceId,
} from "../core/security/deviceService";
import { logAction } from "../core/logger";
import PageHeader from "../core/ui/PageHeader";
import Card, { CardHeader, CardBody } from "../core/ui/Card";
import Button from "../core/ui/Button";
import Alert from "../core/ui/Alert";
import Badge from "../core/ui/Badge";
import EmptyState from "../core/ui/EmptyState";
import Spinner from "../core/ui/Spinner";

export default function Devices() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [trusted, setTrusted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const currentId = getDeviceId();

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [h, t] = await Promise.all([getLoginHistory(user.uid), getTrustedDevices(user.uid)]);
      setHistory(h);
      setTrusted(t);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, [user.uid]);

  async function trust() {
    setMessage("");
    try {
      await trustCurrentDevice(user.uid);
      await logAction(user.uid, "device_trust", "current browser");
      setMessage("This browser is now trusted.");
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(d) {
    try {
      await removeTrustedDevice(d.id);
      await logAction(user.uid, "device_remove", d.device);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  const currentIsTrusted = trusted.some((d) => d.deviceId === currentId);

  return (
    <div>
      <PageHeader title="Devices & login history" description="See where your account has been used and manage trusted browsers." />
      <Alert>{error}</Alert>
      <Alert type="info">{message}</Alert>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Trusted devices"
            actions={!currentIsTrusted && <Button variant="secondary" onClick={trust}><Check className="h-4 w-4" /> Trust this browser</Button>}
          />
          <CardBody>
            {loading ? (
              <div className="flex justify-center p-4"><Spinner /></div>
            ) : trusted.length === 0 ? (
              <EmptyState icon={MonitorSmartphone} title="No trusted devices" description="Trust this browser to mark it as known." />
            ) : (
              <ul className="divide-y divide-border">
                {trusted.map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="flex items-center gap-3">
                      <Laptop aria-hidden="true" className="h-5 w-5 text-fg-muted" />
                      <div>
                        <p className="font-medium text-fg">{d.device}</p>
                        <p className="text-sm text-fg-muted">{d.createdAt?.toDate().toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {d.deviceId === currentId && <Badge variant="success">This device</Badge>}
                      <button onClick={() => remove(d)} className="text-sm text-danger underline min-h-11">Remove</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Recent logins" description="The last 20 sign-ins on your account." />
          <CardBody>
            {loading ? (
              <div className="flex justify-center p-4"><Spinner /></div>
            ) : history.length === 0 ? (
              <EmptyState icon={MonitorSmartphone} title="No login history yet" />
            ) : (
              <ul className="divide-y divide-border">
                {history.map((h) => (
                  <li key={h.id} className="flex items-center justify-between gap-3 py-3">
                    <div>
                      <p className="font-medium text-fg">{h.device}</p>
                      <p className="text-sm text-fg-muted">{h.detail}</p>
                    </div>
                    <span className="text-sm text-fg-muted">{h.createdAt?.toDate().toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

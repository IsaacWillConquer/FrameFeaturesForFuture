import { useState } from "react";
import { User, KeyRound } from "lucide-react";
import { useAuth } from "../core/auth/AuthProvider";
import { updateDisplayName, changePassword, authErrorMessage } from "../core/auth/authService";
import { hasRole } from "../config/appConfig";
import FormField from "../core/ui/FormField";
import Button from "../core/ui/Button";
import Alert from "../core/ui/Alert";
import PageHeader from "../core/ui/PageHeader";
import Card, { CardHeader, CardBody } from "../core/ui/Card";
import Badge from "../core/ui/Badge";
import Avatar from "../core/ui/Avatar";

export default function Profile() {
  const { user, profile, role, refresh } = useAuth();
  const [name, setName] = useState(profile?.name || "");
  const [nameMsg, setNameMsg] = useState("");
  const [nameErr, setNameErr] = useState("");
  const [nameBusy, setNameBusy] = useState(false);

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState("");
  const [pwBusy, setPwBusy] = useState(false);

  async function handleName(e) {
    e.preventDefault();
    setNameErr("");
    setNameMsg("");
    setNameBusy(true);
    try {
      await updateDisplayName(name.trim());
      await refresh();
      setNameMsg("Name updated.");
    } catch (err) {
      setNameErr(authErrorMessage(err));
    }
    setNameBusy(false);
  }

  async function handlePassword(e) {
    e.preventDefault();
    setPwErr("");
    setPwMsg("");
    if (next.length < 8) {
      setPwErr("New password must be at least 8 characters.");
      return;
    }
    if (next !== confirm) {
      setPwErr("New passwords do not match.");
      return;
    }
    setPwBusy(true);
    try {
      await changePassword(current, next);
      setPwMsg("Password changed.");
      setCurrent(""); setNext(""); setConfirm("");
    } catch (err) {
      setPwErr(authErrorMessage(err));
    }
    setPwBusy(false);
  }

  return (
    <div>
      <PageHeader title="Profile" description="Your account details and password." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Your details" />
          <CardBody>
            <div className="mb-4 flex items-center gap-3">
              <Avatar name={profile?.name || user.email} size="lg" />
              <div>
                <p className="font-medium text-fg">{profile?.name || user.email}</p>
                <p className="text-sm text-fg-muted">{user.email}</p>
                <div className="mt-1 flex gap-2">
                  <Badge variant="primary">{role}</Badge>
                  {hasRole(role, "staff") && <Badge variant="neutral">staff access</Badge>}
                </div>
              </div>
            </div>
            <Alert>{nameErr}</Alert>
            <Alert type="info">{nameMsg}</Alert>
            <form onSubmit={handleName}>
              <FormField id="name" label="Display name" value={name} onChange={(e) => setName(e.target.value)} required />
              <Button type="submit" disabled={nameBusy}><User className="h-4 w-4" /> {nameBusy ? "Saving..." : "Save name"}</Button>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Change password" description="You'll need your current password." />
          <CardBody>
            <Alert>{pwErr}</Alert>
            <Alert type="info">{pwMsg}</Alert>
            <form onSubmit={handlePassword}>
              <FormField id="current" label="Current password" type="password" value={current}
                onChange={(e) => setCurrent(e.target.value)} required autoComplete="current-password" />
              <FormField id="next" label="New password" type="password" value={next}
                onChange={(e) => setNext(e.target.value)} required autoComplete="new-password" hint="At least 8 characters." />
              <FormField id="confirm" label="Confirm new password" type="password" value={confirm}
                onChange={(e) => setConfirm(e.target.value)} required autoComplete="new-password" />
              <Button type="submit" disabled={pwBusy}><KeyRound className="h-4 w-4" /> {pwBusy ? "Changing..." : "Change password"}</Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

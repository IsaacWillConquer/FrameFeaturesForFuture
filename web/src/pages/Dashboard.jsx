import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Bell, ShieldCheck, UserCheck, Activity } from "lucide-react";
import { db } from "../config/firebase";
import { COLLECTIONS, NAV, hasRole } from "../config/appConfig";
import { useAuth } from "../core/auth/AuthProvider";
import { useNotifications } from "../core/notifications/useNotifications";
import PageHeader from "../core/ui/PageHeader";
import Card, { CardHeader, CardBody } from "../core/ui/Card";
import StatCard from "../core/ui/StatCard";
import BarChart from "../core/ui/BarChart";
import Badge from "../core/ui/Badge";
import Alert from "../core/ui/Alert";
import EmptyState from "../core/ui/EmptyState";
import Spinner from "../core/ui/Spinner";

export default function Dashboard() {
  const { user, profile, role, totpEnabled } = useAuth();
  const notifications = useNotifications(user?.uid);
  const unread = notifications.filter((n) => !n.read).length;
  const isStaffUp = hasRole(role, "staff");

  const [activity, setActivity] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [activityError, setActivityError] = useState("");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;
    async function load() {
      try {
        const snap = await getDocs(query(collection(db, COLLECTIONS.logs), where("uid", "==", user.uid)));
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const time = (l) => l.createdAt?.toMillis?.() ?? 0;
        list.sort((a, b) => time(b) - time(a));
        setActivity(list);
        setActivityError("");
      } catch (err) {
        setActivity([]);
        setActivityError(err.code === "permission-denied" ? "Blocked by database rules." : err.message);
      }
      setLoadingActivity(false);
    }
    load();
  }, [user?.uid]);

  // System-wide numbers for staff/admin dashboards.
  useEffect(() => {
    if (!user?.uid || !isStaffUp) return;
    async function load() {
      try {
        const [u, c] = await Promise.all([
          getDocs(collection(db, COLLECTIONS.users)),
          getDocs(collection(db, COLLECTIONS.checkins)),
        ]);
        const users = u.docs.map((d) => d.data());
        setStats({
          total: users.length,
          active: users.filter((x) => x.active !== false).length,
          staff: users.filter((x) => x.role === "staff" || x.role === "admin").length,
          checkins: c.size,
        });
      } catch {
        setStats(null);
      }
    }
    load();
  }, [user?.uid, isStaffUp]);

  const recent = activity.slice(0, 5);

  // Own actions per day for the last 7 days.
  const week = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - i);
    const next = new Date(day);
    next.setDate(day.getDate() + 1);
    const count = activity.filter((l) => {
      const t = l.createdAt?.toDate?.();
      return t && t >= day && t < next;
    }).length;
    week.push({ label: day.toLocaleDateString(undefined, { weekday: "short" }), value: count });
  }

  const quickActions = NAV.filter((item) => item.to !== "/dashboard" && hasRole(role, item.minRole));

  return (
    <div>
      <PageHeader
        title={`Welcome, ${profile?.name || user?.email || "there"}`}
        description="Here's a snapshot of your account."
        actions={<Badge variant="primary">{role}</Badge>}
      />

      <Alert>{activityError}</Alert>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Unread notifications" value={unread} icon={Bell} hint={unread === 0 ? "All caught up" : "Needs attention"} />
        <StatCard label="Account status" value={profile?.active === false ? "Inactive" : "Active"} icon={UserCheck} />
        <StatCard label="Two-factor auth" value={totpEnabled ? "On" : "Off"} icon={ShieldCheck} />
        <StatCard label="Total actions" value={activity.length} icon={Activity} hint="Last 5 shown below" />
      </div>

      {isStaffUp && stats && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total users" value={stats.total} icon={UserCheck} />
          <StatCard label="Active users" value={stats.active} />
          <StatCard label="Staff + admin" value={stats.staff} />
          <StatCard label="Check-ins" value={stats.checkins} />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Quick actions" description="Jump to a page you can access." />
          <CardBody className="grid gap-3 sm:grid-cols-2">
            {quickActions.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 p-3 min-h-11 text-sm font-medium text-fg hover:border-primary"
                >
                  <Icon aria-hidden="true" className="h-5 w-5 text-fg-muted" />
                  {item.label}
                </Link>
              );
            })}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Recent activity" description="Your latest account actions." />
          <CardBody>
            {loadingActivity ? (
              <div className="flex justify-center p-4">
                <Spinner />
              </div>
            ) : recent.length === 0 ? (
              <EmptyState title="No activity yet" description="Actions like logins and 2FA changes show up here." />
            ) : (
              <ul className="space-y-3">
                {recent.map((l) => (
                  <li key={l.id} className="flex items-center justify-between gap-3 border-b border-border pb-2 last:border-0">
                    <span className="font-medium text-fg">{l.action}</span>
                    <span className="text-sm text-fg-muted whitespace-nowrap">
                      {l.createdAt?.toDate().toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title="Overview" description="Your actions per day (last 7 days)." />
        <CardBody>
          <BarChart data={week} title="Your actions per day" />
        </CardBody>
      </Card>
    </div>
  );
}

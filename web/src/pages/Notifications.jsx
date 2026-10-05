import { Bell, CheckCheck } from "lucide-react";
import { useAuth } from "../core/auth/AuthProvider";
import { useNotifications } from "../core/notifications/useNotifications";
import { notify, markRead, markAllRead } from "../core/notifications/notificationService";
import ReadAloud from "../core/a11y/ReadAloud";
import Button from "../core/ui/Button";
import PageHeader from "../core/ui/PageHeader";
import Card from "../core/ui/Card";
import Badge from "../core/ui/Badge";
import EmptyState from "../core/ui/EmptyState";
import { cx } from "../core/ui/cx";

export default function Notifications() {
  const { user } = useAuth();
  const items = useNotifications(user.uid);
  const unread = items.filter((n) => !n.read).length;

  return (
    <div>
      <PageHeader
        title="Notifications"
        description={unread > 0 ? `${unread} unread` : "You're all caught up."}
        actions={
          <>
            <Button onClick={() => notify(user.uid, "Test notification", "This is a test message to yourself.")}>
              <Bell className="h-4 w-4" /> Send test
            </Button>
            {unread > 0 && (
              <Button variant="secondary" onClick={() => markAllRead(items)}>
                <CheckCheck className="h-4 w-4" /> Mark all read
              </Button>
            )}
          </>
        }
      />

      {items.length === 0 ? (
        <Card>
          <EmptyState icon={Bell} title="No notifications yet" description="Push yourself a test message to see how it works." />
        </Card>
      ) : (
        <ul className="space-y-3">
          {items.map((n) => (
            <li key={n.id}>
              <Card className={cx("p-4", !n.read && "border-l-4 border-l-primary")}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-2 font-medium text-fg">
                      {n.title}
                      {!n.read && <Badge variant="primary">New</Badge>}
                    </p>
                    <p className="mt-1 text-fg-muted">{n.message}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-4">
                  {n.createdAt && (
                    <span className="text-sm text-fg-muted">{n.createdAt.toDate().toLocaleString()}</span>
                  )}
                  <ReadAloud text={`${n.title}. ${n.message}`} />
                  {!n.read && (
                    <button onClick={() => markRead(n.id)} className="text-sm text-primary underline min-h-11">Mark read</button>
                  )}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import { useAuth } from "../core/auth/AuthProvider";
import { useNotifications } from "../core/notifications/useNotifications";
import { notify, markRead, markAllRead } from "../core/notifications/notificationService";
import ReadAloud from "../core/a11y/ReadAloud";
import Button from "../core/ui/Button";

export default function Notifications() {
  const { user } = useAuth();
  const items = useNotifications(user.uid);
  const unread = items.filter((n) => !n.read).length;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>

      <div className="flex flex-wrap gap-3 mb-4">
        <Button onClick={() => notify(user.uid, "Test notification", "This is a test message to yourself.")}>
          Send test to myself
        </Button>
        {unread > 0 && (
          <button onClick={() => markAllRead(items)} className="underline min-h-11">Mark all read</button>
        )}
      </div>

      {items.length === 0 && <p>No notifications yet.</p>}

      <ul className="space-y-3">
        {items.map((n) => (
          <li key={n.id} className="bg-white border rounded p-3">
            <p className={n.read ? "" : "font-bold"}>
              {n.title}{!n.read && " (unread)"}
            </p>
            <p>{n.message}</p>
            {n.createdAt && (
              <p className="text-sm text-gray-700">{n.createdAt.toDate().toLocaleString()}</p>
            )}
            <div className="flex gap-4">
              <ReadAloud text={`${n.title}. ${n.message}`} />
              {!n.read && (
                <button onClick={() => markRead(n.id)} className="underline min-h-11">Mark read</button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

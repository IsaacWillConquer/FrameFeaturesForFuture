import { Link } from "react-router-dom";
import { useAuth } from "../core/auth/AuthProvider";
import { hasRole } from "../config/appConfig";

const links = [
  { to: "/notifications", label: "Notifications" },
  { to: "/security", label: "Security (2FA)" },
  { to: "/accessibility", label: "Accessibility settings" },
  { to: "/activity", label: "My activity" },
  { to: "/qr-demo", label: "QR demo" },
  { to: "/items", label: "Items (demo CRUD)" },
];

const staffLinks = [
  { to: "/admin/users", label: "Manage users" },
  { to: "/admin/logs", label: "Audit log" },
];

export default function Dashboard() {
  const { user, profile, role } = useAuth();
  const all = hasRole(role, "staff") ? [...links, ...staffLinks] : links;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Welcome, {profile?.name || user.email}.</p>
      <p className="mb-4">Role: <strong>{role}</strong></p>

      <nav aria-label="Quick links">
        <ul className="grid gap-3">
          {all.map((l) => (
            <li key={l.to}>
              <Link to={l.to} className="block bg-white border rounded p-4 min-h-11 underline">{l.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
      <p className="mt-6 text-gray-700">Topic modules will show up here after reveal day.</p>
    </div>
  );
}

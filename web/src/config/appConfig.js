import {
  LayoutDashboard,
  Bell,
  ShieldCheck,
  Accessibility,
  Activity,
  QrCode,
  Package,
  Users,
  ScrollText,
  UserCircle,
  Megaphone,
  MonitorSmartphone,
  Fingerprint,
  Wallet,
  MessageSquare,
  Sparkles,
  ClipboardCheck,
  LifeBuoy,
} from "lucide-react";

// The ONE file to edit on topic reveal day: app name, roles, collection names.
export const APP_NAME = "AWA";
export const APP_TAGLINE = "Accessibility-first web app";

// Higher number = more power. Admin can do everything Staff can, and so on.
export const ROLES = { user: 1, staff: 2, admin: 3 };

export const COLLECTIONS = {
  users: "users",
  publicProfiles: "public_profiles",
  supportRequests: "support_requests",
  logs: "logs",
  notifications: "notifications",
  announcements: "announcements",
  smsOutbox: "sms_outbox",
  totp: "totp",
  loginHistory: "login_history",
  trustedDevices: "trusted_devices",
  webauthn: "webauthn_credentials",
  faces: "face_descriptors",
  wallets: "wallets",
  transactions: "transactions",
  checkins: "checkins",
  aiChats: "ai_chats",
};

export function hasRole(role, minRole) {
  return (ROLES[role] || 0) >= (ROLES[minRole] || 0);
}

// Single source of truth for navigation. Used by the sidebar and the dashboard.
// group: which section it appears in. icon: a lucide-react component.
export const NAV = [
  { to: "/dashboard", label: "Dashboard", labelKey: "nav_dashboard", icon: LayoutDashboard, minRole: "user", group: "Main" },
  { to: "/notifications", label: "Notifications", labelKey: "nav_notifications", icon: Bell, minRole: "user", group: "Main" },
  { to: "/announcements", label: "Announcements", labelKey: "nav_announcements", icon: Megaphone, minRole: "user", group: "Main" },
  { to: "/profile", label: "Profile", labelKey: "nav_profile", icon: UserCircle, minRole: "user", group: "Account" },
  { to: "/security", label: "Security (2FA)", labelKey: "nav_security", icon: ShieldCheck, minRole: "user", group: "Account" },
  { to: "/biometrics", label: "Biometrics & face", labelKey: "nav_biometrics", icon: Fingerprint, minRole: "user", group: "Account" },
  { to: "/verify-identity", label: "Re-verify identity", labelKey: "nav_verify_identity", icon: ShieldCheck, minRole: "user", group: "Account" },
  { to: "/devices", label: "Devices & history", labelKey: "nav_devices", icon: MonitorSmartphone, minRole: "user", group: "Account" },
  { to: "/activity", label: "My activity", labelKey: "nav_activity", icon: Activity, minRole: "user", group: "Account" },
  { to: "/accessibility", label: "Accessibility", labelKey: "nav_accessibility", icon: Accessibility, minRole: "user", group: "Account" },
  { to: "/wallet", label: "Wallet", labelKey: "nav_wallet", icon: Wallet, minRole: "user", group: "Tools" },
  { to: "/check-in", label: "Check-in", labelKey: "nav_checkin", icon: ClipboardCheck, minRole: "user", group: "Tools" },
  { to: "/ai", label: "AI helper", labelKey: "nav_ai", icon: Sparkles, minRole: "user", group: "Tools" },
  { to: "/qr-demo", label: "QR demo", labelKey: "nav_qrdemo", icon: QrCode, minRole: "user", group: "Tools" },
  { to: "/items", label: "Items (demo)", labelKey: "nav_items", icon: Package, minRole: "user", group: "Tools" },
  { to: "/admin/sms", label: "SMS outbox", labelKey: "nav_sms", icon: MessageSquare, minRole: "staff", group: "Admin" },
  { to: "/admin/users", label: "Manage users", labelKey: "nav_users", icon: Users, minRole: "staff", group: "Admin" },
  { to: "/admin/support", label: "Support requests", labelKey: "nav_support", icon: LifeBuoy, minRole: "staff", group: "Admin" },
  { to: "/admin/logs", label: "Audit log", labelKey: "nav_logs", icon: ScrollText, minRole: "staff", group: "Admin" },
];

// Auto logout when idle (minutes). Warning shows first, then logout.
export const IDLE_WARN_MIN = 13;
export const IDLE_LOGOUT_MIN = 15;

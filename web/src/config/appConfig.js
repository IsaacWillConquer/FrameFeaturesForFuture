// The ONE file to edit on topic reveal day: app name, roles, collection names.
export const APP_NAME = "AWA";

// Higher number = more power. Admin can do everything Staff can, and so on.
export const ROLES = { user: 1, staff: 2, admin: 3 };

export const COLLECTIONS = {
  users: "users",
  logs: "logs",
  notifications: "notifications",
  smsOutbox: "sms_outbox",
  totp: "totp",
};

export function hasRole(role, minRole) {
  return (ROLES[role] || 0) >= (ROLES[minRole] || 0);
}

// Auto logout when idle (minutes). Warning shows first, then logout.
export const IDLE_WARN_MIN = 13;
export const IDLE_LOGOUT_MIN = 15;

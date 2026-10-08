// Same names as web/src/config/appConfig.js. Edit on reveal day.
class AppConfig {
  static const appName = 'AWA';

  static const users = 'users';
  static const publicProfiles = 'public_profiles';
  static const supportRequests = 'support_requests';
  static const logs = 'logs';
  static const notifications = 'notifications';
  static const totp = 'totp';
  static const announcements = 'announcements';
  static const smsOutbox = 'sms_outbox';
  static const wallets = 'wallets';
  static const transactions = 'transactions';
  static const checkins = 'checkins';

  // Matches the web app's IdleGuard.
  static const idleLogoutMinutes = 15;

  static const roles = {'user': 1, 'staff': 2, 'admin': 3};

  static bool hasRole(String? role, String minRole) =>
      (roles[role] ?? 0) >= (roles[minRole] ?? 0);
}

// Same names as web/src/config/appConfig.js. Edit on reveal day.
class AppConfig {
  static const appName = 'AWA';

  static const users = 'users';
  static const logs = 'logs';
  static const notifications = 'notifications';
  static const totp = 'totp';

  static const roles = {'user': 1, 'staff': 2, 'admin': 3};

  static bool hasRole(String? role, String minRole) =>
      (roles[role] ?? 0) >= (roles[minRole] ?? 0);
}

import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

// Port of web/src/core/security/loginLimiter.js. Locks the login form after 5
// wrong passwords; each lock doubles (2, 4, 8 min). Stored on the device so it
// survives an app restart. Device-side only: it slows guessing but a determined
// person can bypass it (Firebase also rate-limits sign-in server-side).
class LoginLimiter {
  static const _maxTries = 5;
  static const _baseLockSeconds = 120;

  static String _key(String email) => 'awa_fail_${email.trim().toLowerCase()}';

  static Future<Map<String, int>> _read(String email) async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_key(email));
    if (raw == null) return {'count': 0, 'locks': 0, 'until': 0};
    try {
      final data = jsonDecode(raw) as Map<String, dynamic>;
      return {
        'count': (data['count'] as num?)?.toInt() ?? 0,
        'locks': (data['locks'] as num?)?.toInt() ?? 0,
        'until': (data['until'] as num?)?.toInt() ?? 0,
      };
    } catch (_) {
      return {'count': 0, 'locks': 0, 'until': 0};
    }
  }

  static Future<int> secondsLocked(String email) async {
    final data = await _read(email);
    final diff = data['until']! - DateTime.now().millisecondsSinceEpoch;
    return diff > 0 ? (diff / 1000).ceil() : 0;
  }

  // Records a wrong password; returns seconds now locked (0 if not locked yet).
  static Future<int> recordFail(String email) async {
    final prefs = await SharedPreferences.getInstance();
    final data = await _read(email);
    final count = data['count']! + 1;
    var locks = data['locks']!;
    var until = data['until']!;
    if (count >= _maxTries) {
      locks += 1;
      until = DateTime.now().millisecondsSinceEpoch +
          _baseLockSeconds * (1 << (locks - 1)) * 1000;
    }
    await prefs.setString(
      _key(email),
      jsonEncode({'count': count, 'locks': locks, 'until': until}),
    );
    return secondsLocked(email);
  }

  static Future<void> clearFails(String email) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_key(email));
  }
}

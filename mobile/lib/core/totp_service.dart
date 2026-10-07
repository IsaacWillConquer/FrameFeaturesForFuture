import 'dart:convert';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:crypto/crypto.dart';
import 'package:otp/otp.dart';

import '../config/app_config.dart';

// Same 2FA as the web app. The secret and the hashed recovery codes live in totp/{uid}.
class TotpService {
  static final _db = FirebaseFirestore.instance;

  // Returns the totp doc if 2FA is turned on, otherwise null
  static Future<Map<String, dynamic>?> load(String uid) async {
    final snap = await _db.collection(AppConfig.totp).doc(uid).get();
    final data = snap.data();
    if (data != null && data['enabled'] == true) return data;
    return null;
  }

  // Accepts the current code plus one step either side (clock drift), like the web app
  static bool checkCode(String secret, String input) {
    final code = input.replaceAll(' ', '');
    final now = DateTime.now().millisecondsSinceEpoch;
    for (final offset in [-30000, 0, 30000]) {
      final expected = OTP.generateTOTPCodeString(
        secret,
        now + offset,
        length: 6,
        interval: 30,
        algorithm: Algorithm.SHA1,
        isGoogle: true,
      );
      if (expected == code) return true;
    }
    return false;
  }

  // Web stores SHA-256 hex of the lowercase, trimmed code. This matches it.
  static String _hash(String code) =>
      sha256.convert(utf8.encode(code.trim().toLowerCase())).toString();

  // True (and the code is burned) if it matches one of the saved recovery codes
  static Future<bool> useRecoveryCode(
      String uid, Map<String, dynamic> totp, String input) async {
    final hash = _hash(input);
    final saved = List<String>.from(totp['recovery'] ?? []);
    if (!saved.contains(hash)) return false;
    await _db.collection(AppConfig.totp).doc(uid).update({
      'recovery': FieldValue.arrayRemove([hash]),
    });
    return true;
  }
}

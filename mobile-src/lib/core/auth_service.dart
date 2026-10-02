import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

import '../config/app_config.dart';

class AuthService {
  static final _auth = FirebaseAuth.instance;
  static final _db = FirebaseFirestore.instance;

  // Emits on login, logout, and when we call user.reload()
  static Stream<User?> get userChanges => _auth.userChanges();

  static Future<void> signIn(String email, String password) async {
    final cred = await _auth.signInWithEmailAndPassword(
      email: email.trim(),
      password: password,
    );
    await logAction(cred.user!.uid, 'login', 'mobile');
  }

  static Future<void> signOut() => _auth.signOut();

  static Future<Map<String, dynamic>?> loadProfile(String uid) async {
    final snap = await _db.collection(AppConfig.users).doc(uid).get();
    return snap.data();
  }

  // Same shape as the web logger, so the audit log shows both
  static Future<void> logAction(String uid, String action, [String details = '']) async {
    try {
      await _db.collection(AppConfig.logs).add({
        'uid': uid,
        'action': action,
        'details': details,
        'createdAt': FieldValue.serverTimestamp(),
      });
    } catch (_) {/* logging must never break the app */}
  }

  static String errorMessage(Object e) {
    if (e is FirebaseAuthException) {
      switch (e.code) {
        case 'invalid-credential':
        case 'wrong-password':
        case 'user-not-found':
          return 'Wrong email or password.';
        case 'invalid-email':
          return "That email doesn't look right.";
        case 'too-many-requests':
          return 'Too many attempts. Wait a bit and try again.';
        case 'network-request-failed':
          return 'No internet connection.';
      }
    }
    return 'Something went wrong. Try again.';
  }
}

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
    await ensureUserDoc(cred.user!);
    await logAction(cred.user!.uid, 'login', 'mobile');
  }

  // Creates users/{uid} the first time someone signs in. Role is always "user".
  static Future<void> ensureUserDoc(User user) async {
    final ref = _db.collection(AppConfig.users).doc(user.uid);
    final snap = await ref.get();
    if (!snap.exists) {
      await ref.set({
        'email': user.email,
        'name': user.displayName ?? '',
        'role': 'user',
        'active': true,
        'createdAt': FieldValue.serverTimestamp(),
      });
    }
    await upsertPublicProfile(user);
  }

  // A small safe mirror any signed-in user can read (wallet recipients, etc.).
  static Future<void> upsertPublicProfile(User user) async {
    try {
      await _db.collection(AppConfig.publicProfiles).doc(user.uid).set({
        'uid': user.uid,
        'name': user.displayName ?? '',
        'email': user.email ?? '',
      }, SetOptions(merge: true));
    } catch (_) {/* best-effort, never blocks auth */}
  }

  static Future<void> registerUser(
      String name, String email, String password) async {
    final cred = await _auth.createUserWithEmailAndPassword(
      email: email.trim(),
      password: password,
    );
    await cred.user!.updateDisplayName(name);
    await _db.collection(AppConfig.users).doc(cred.user!.uid).set({
      'email': cred.user!.email,
      'name': name,
      'role': 'user',
      'active': true,
      'mustChangePassword': true,
      'createdAt': FieldValue.serverTimestamp(),
    });
    await upsertPublicProfile(cred.user!);
    await cred.user!.sendEmailVerification();
    await logAction(cred.user!.uid, 'register', 'mobile');
  }

  static Future<void> resetPassword(String email) =>
      _auth.sendPasswordResetEmail(email: email.trim());

  // Firebase needs a recent login, so reauthenticate first.
  static Future<void> changePassword(
      String currentPassword, String newPassword) async {
    final user = _auth.currentUser!;
    final cred = EmailAuthProvider.credential(
      email: user.email!,
      password: currentPassword,
    );
    await user.reauthenticateWithCredential(cred);
    await user.updatePassword(newPassword);
    await _db
        .collection(AppConfig.users)
        .doc(user.uid)
        .update({'mustChangePassword': false});
    await logAction(user.uid, 'password_change', 'mobile');
  }

  static Future<void> updateDisplayName(String name) async {
    final user = _auth.currentUser!;
    await user.updateDisplayName(name);
    await _db
        .collection(AppConfig.users)
        .doc(user.uid)
        .update({'name': name});
    await upsertPublicProfile(user);
    await logAction(user.uid, 'profile_update', 'name');
  }

  static Future<void> signOut() async {
    final user = _auth.currentUser;
    if (user != null) await logAction(user.uid, 'logout', 'mobile');
    await _auth.signOut();
  }

  static Future<Map<String, dynamic>?> loadProfile(String uid) async {
    final snap = await _db.collection(AppConfig.users).doc(uid).get();
    return snap.data();
  }

  // Same shape as the web logger, so the audit log shows both
  static Future<void> logAction(String uid, String action,
      [String details = '']) async {
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
        case 'email-already-in-use':
          return 'That email is already registered.';
        case 'weak-password':
          return 'Password must be at least 8 characters.';
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

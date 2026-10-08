import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

import '../core/app_prefs.dart';
import '../core/auth_service.dart';
import '../core/totp_service.dart';
import 'change_password_screen.dart';
import 'deactivated_screen.dart';
import 'home_screen.dart';
import 'lock_screen.dart';
import 'login_screen.dart';
import 'two_factor_screen.dart';
import 'verify_email_screen.dart';

// What we need to know about a signed-in person before showing the app
class _GateStatus {
  final Map<String, dynamic>? profile;
  final bool active;
  final Map<String, dynamic>? totp; // null = 2FA is off

  _GateStatus(this.profile, this.active, this.totp);

  static Future<_GateStatus> load(String uid) async {
    final profile = await AuthService.loadProfile(uid);
    final totp = await TotpService.load(uid);
    // Apply this person's saved text size / dark mode
    final raw = profile?['prefs'];
    AppPrefs.apply(raw is Map ? Map<String, dynamic>.from(raw) : null);
    return _GateStatus(profile, profile?['active'] != false, totp);
  }
}

// Decides which screen to show:
// login -> verify email -> deactivated check -> 2FA code -> biometric lock -> home
class AuthGate extends StatefulWidget {
  const AuthGate({super.key});

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  String? _unlockedFor; // uid that passed the biometric lock this app session
  String? _twoFactorFor; // uid that passed the 2FA code this app session
  String? _statusUid;
  Future<_GateStatus>? _statusFuture;

  // Loaded once per login, not on every rebuild
  Future<_GateStatus> _status(String uid) {
    if (_statusUid != uid || _statusFuture == null) {
      _statusUid = uid;
      _statusFuture = _GateStatus.load(uid);
    }
    return _statusFuture!;
  }

  Widget _loading() => const Scaffold(body: Center(child: CircularProgressIndicator()));

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<User?>(
      stream: AuthService.userChanges,
      builder: (context, snap) {
        if (snap.connectionState == ConnectionState.waiting) return _loading();

        final user = snap.data;
        if (user == null) {
          _unlockedFor = null;
          _twoFactorFor = null;
          _statusUid = null;
          _statusFuture = null;
          if (AppPrefs.notifier.value.isNotEmpty) {
            WidgetsBinding.instance.addPostFrameCallback((_) => AppPrefs.apply(null));
          }
          return const LoginScreen();
        }
        if (!user.emailVerified) return VerifyEmailScreen(user: user);

        return FutureBuilder<_GateStatus>(
          future: _status(user.uid),
          builder: (context, status) {
            if (status.connectionState != ConnectionState.done) return _loading();

            // Could not load (offline or rules): don't let anyone past 2FA by accident
            if (status.hasError) {
              return Scaffold(
                appBar: AppBar(title: const Text('Could not load your account')),
                body: SafeArea(
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      const Text('Check your internet connection and try again. If it keeps failing, ask an admin to check the database rules.'),
                      const SizedBox(height: 16),
                      FilledButton(
                        onPressed: () => setState(() => _statusFuture = null),
                        child: const Text('Try again'),
                      ),
                      TextButton(onPressed: AuthService.signOut, child: const Text('Log out')),
                    ],
                  ),
                ),
              );
            }

            final s = status.data!;
            if (!s.active) return const DeactivatedScreen();

            if (s.totp != null && _twoFactorFor != user.uid) {
              return TwoFactorScreen(
                uid: user.uid,
                totp: s.totp!,
                onPassed: () => setState(() => _twoFactorFor = user.uid),
              );
            }

            // Forced first-login password change (mirrors the web /change-password gate).
            if (s.profile?['mustChangePassword'] == true) {
              return ChangePasswordScreen(
                uid: user.uid,
                forced: true,
                onDone: () => setState(() => _statusFuture = null),
              );
            }

            if (_unlockedFor != user.uid) {
              return LockScreen(onUnlocked: () => setState(() => _unlockedFor = user.uid));
            }

            return HomeScreen(user: user, profile: s.profile);
          },
        );
      },
    );
  }
}

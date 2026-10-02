import 'package:flutter/material.dart';

import '../core/auth_service.dart';
import '../core/biometric_service.dart';

// Shown after login on each app start. Fingerprint/face, with the phone's own PIN as fallback.
class LockScreen extends StatefulWidget {
  final VoidCallback onUnlocked;
  const LockScreen({super.key, required this.onUnlocked});

  @override
  State<LockScreen> createState() => _LockScreenState();
}

class _LockScreenState extends State<LockScreen> {
  String _message = '';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _try());
  }

  Future<void> _try() async {
    // A phone with no screen lock can't offer a lock, so we don't trap anyone
    final supported = await BiometricService.available();
    if (!mounted) return;
    if (!supported) {
      widget.onUnlocked();
      return;
    }
    final ok = await BiometricService.unlock();
    if (!mounted) return; // user may have logged out while the prompt was open
    if (ok) {
      widget.onUnlocked();
    } else {
      setState(() => _message = 'Unlock failed. Try again, or log out to use your password.');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('AWA is locked')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            const Text('Use your fingerprint, face, or phone PIN to continue.'),
            const SizedBox(height: 16),
            FilledButton(onPressed: _try, child: const Text('Unlock')),
            // Fallback: password login is always possible
            TextButton(onPressed: AuthService.signOut, child: const Text('Log out and use password')),
            if (_message.isNotEmpty) Semantics(liveRegion: true, child: Text(_message)),
          ],
        ),
      ),
    );
  }
}

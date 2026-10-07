import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

import '../core/auth_service.dart';

class VerifyEmailScreen extends StatefulWidget {
  final User user;
  const VerifyEmailScreen({super.key, required this.user});

  @override
  State<VerifyEmailScreen> createState() => _VerifyEmailScreenState();
}

class _VerifyEmailScreenState extends State<VerifyEmailScreen> {
  String _message = '';
  bool _busy = false;

  Future<void> _resend() async {
    try {
      await widget.user.sendEmailVerification();
      setState(() => _message = 'Verification email sent. Check your inbox.');
    } catch (_) {
      setState(() => _message = 'Could not send it right now. Wait a minute and retry.');
    }
  }

  Future<void> _check() async {
    setState(() => _busy = true);
    try {
      await widget.user.reload(); // userChanges emits, AuthGate moves on if verified
      final verified = FirebaseAuth.instance.currentUser?.emailVerified ?? false;
      if (!verified && mounted) setState(() => _message = 'Not verified yet.');
    } catch (_) {
      if (mounted) {
        setState(() => _message = 'Could not check right now. Check your internet connection.');
      }
    }
    if (mounted) setState(() => _busy = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Verify your email')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Text('We sent a link to ${widget.user.email}. Open it, then come back and press the button below.'),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: _busy ? null : _check,
              child: Text(_busy ? 'Checking...' : "I've verified"),
            ),
            const SizedBox(height: 8),
            OutlinedButton(onPressed: _resend, child: const Text('Resend email')),
            TextButton(onPressed: AuthService.signOut, child: const Text('Log out')),
            if (_message.isNotEmpty) Semantics(liveRegion: true, child: Text(_message)),
          ],
        ),
      ),
    );
  }
}

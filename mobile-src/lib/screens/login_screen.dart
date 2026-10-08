import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

import '../core/auth_service.dart';
import 'register_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _email = TextEditingController();
  final _password = TextEditingController();
  String _error = '';
  bool _busy = false;

  // Simple login lockout, mirrors the web limiter (5 tries, then 2/4/8 min).
  int _fails = 0;
  DateTime? _lockedUntil;

  int get _secondsLocked {
    final until = _lockedUntil;
    if (until == null) return 0;
    final left = until.difference(DateTime.now()).inSeconds;
    return left > 0 ? left : 0;
  }

  void _onWrongPassword() {
    _fails += 1;
    if (_fails >= 5) {
      final step = (_fails - 5).clamp(0, 2);
      final minutes = 2 * (1 << step); // 2, 4, 8
      _lockedUntil = DateTime.now().add(Duration(minutes: minutes));
    }
  }

  Future<void> _submit() async {
    if (_email.text.trim().isEmpty || _password.text.isEmpty) {
      setState(() => _error = 'Enter your email and password.');
      return;
    }
    final locked = _secondsLocked;
    if (locked > 0) {
      setState(() => _error = 'Too many wrong tries. Try again in $locked seconds.');
      return;
    }
    setState(() {
      _busy = true;
      _error = '';
    });
    try {
      await AuthService.signIn(_email.text, _password.text);
      _fails = 0;
      _lockedUntil = null;
      // AuthGate reacts to the login by itself
    } catch (e) {
      if (e is FirebaseAuthException && e.code == 'invalid-credential') {
        _onWrongPassword();
      }
      final wait = _secondsLocked;
      if (mounted) {
        setState(() {
          _error = wait > 0
              ? 'Too many wrong tries. Locked for $wait seconds.'
              : AuthService.errorMessage(e);
        });
      }
    }
    if (mounted) setState(() => _busy = false);
  }

  Future<void> _forgotPassword() async {
    final email = _email.text.trim();
    if (email.isEmpty) {
      setState(() => _error = 'Type your email first, then press Forgot password.');
      return;
    }
    try {
      await AuthService.resetPassword(email);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Password reset email sent. Check your inbox.')),
        );
      }
    } catch (e) {
      if (mounted) setState(() => _error = AuthService.errorMessage(e));
    }
  }

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Log in')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            TextField(
              controller: _email,
              keyboardType: TextInputType.emailAddress,
              autofillHints: const [AutofillHints.email],
              decoration: const InputDecoration(labelText: 'Email', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _password,
              obscureText: true,
              autofillHints: const [AutofillHints.password],
              onSubmitted: (_) => _submit(),
              decoration: const InputDecoration(labelText: 'Password', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 16),
            if (_error.isNotEmpty)
              // liveRegion makes TalkBack read the error as soon as it appears
              Semantics(
                liveRegion: true,
                child: Text(_error, style: TextStyle(color: Theme.of(context).colorScheme.error)),
              ),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: _busy ? null : _submit,
              child: Text(_busy ? 'Logging in...' : 'Log in'),
            ),
            TextButton(
              onPressed: _busy ? null : _forgotPassword,
              child: const Text('Forgot password?'),
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text('No account yet?'),
                TextButton(
                  onPressed: _busy
                      ? null
                      : () => Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const RegisterScreen()),
                          ),
                  child: const Text('Register'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

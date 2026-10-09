import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

import '../core/auth_service.dart';
import '../core/login_limiter.dart';
import '../core/password_field.dart';
import '../ui/awa_theme.dart';
import '../ui/awa_widgets.dart';
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

  Future<void> _submit() async {
    final email = _email.text;
    if (email.trim().isEmpty || _password.text.isEmpty) {
      setState(() => _error = 'Enter your email and password.');
      return;
    }
    final locked = await LoginLimiter.secondsLocked(email);
    if (!mounted) return;
    if (locked > 0) {
      setState(() => _error = 'Too many wrong tries. Try again in $locked seconds.');
      return;
    }
    setState(() {
      _busy = true;
      _error = '';
    });
    try {
      await AuthService.signIn(email, _password.text);
      await LoginLimiter.clearFails(email);
      // AuthGate reacts to the login by itself
    } catch (e) {
      var wait = 0;
      if (e is FirebaseAuthException && e.code == 'invalid-credential') {
        wait = await LoginLimiter.recordFail(email);
      }
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
    final text = Theme.of(context).textTheme;
    final scheme = Theme.of(context).colorScheme;
    return Scaffold(
      body: SafeArea(
        child: CenteredScroll(
          children: [
            const AwaIntro(
              showLogo: true,
              title: 'Welcome back',
              subtitle: 'Log in to check in, pay, and stay up to date.',
            ),
            const SizedBox(height: AwaTheme.gapXl),
            TextField(
              controller: _email,
              keyboardType: TextInputType.emailAddress,
              autofillHints: const [AutofillHints.email],
              decoration: const InputDecoration(
                labelText: 'Email',
                prefixIcon: Icon(Icons.mail_outline),
              ),
            ),
            const SizedBox(height: AwaTheme.gapM),
            PasswordField(
              controller: _password,
              label: 'Password',
              autofillHints: const [AutofillHints.password],
              onSubmitted: (_) => _submit(),
            ),
            if (_error.isNotEmpty) ...[
              const SizedBox(height: AwaTheme.gapM),
              InlineMessage(text: _error, isError: true),
            ],
            const SizedBox(height: AwaTheme.gapL),
            FilledButton(
              onPressed: _busy ? null : _submit,
              child: Text(_busy ? 'Logging in...' : 'Log in'),
            ),
            const SizedBox(height: AwaTheme.gapXs),
            TextButton(
              onPressed: _busy ? null : _forgotPassword,
              child: const Text('Forgot password?'),
            ),
            const SizedBox(height: AwaTheme.gapM),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text('No account yet?', style: text.bodyMedium?.copyWith(color: scheme.onSurfaceVariant)),
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

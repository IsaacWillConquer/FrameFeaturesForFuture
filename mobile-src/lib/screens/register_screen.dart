import 'package:flutter/material.dart';

import '../core/auth_service.dart';
import '../core/password_field.dart';
import '../ui/awa_theme.dart';
import '../ui/awa_widgets.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _confirm = TextEditingController();
  String _error = '';
  bool _busy = false;

  Future<void> _submit() async {
    if (_password.text.length < 8) {
      setState(() => _error = 'Password must be at least 8 characters.');
      return;
    }
    if (_password.text != _confirm.text) {
      setState(() => _error = 'Passwords do not match.');
      return;
    }
    setState(() {
      _busy = true;
      _error = '';
    });
    try {
      await AuthService.registerUser(_name.text.trim(), _email.text, _password.text);
      if (!mounted) return;
      Navigator.pop(context); // AuthGate now shows the verify-email screen
    } catch (e) {
      if (mounted) setState(() => _error = AuthService.errorMessage(e));
    }
    if (mounted) setState(() => _busy = false);
  }

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _password.dispose();
    _confirm.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(backgroundColor: Colors.transparent),
      body: SafeArea(
        child: CenteredScroll(
          children: [
            const AwaIntro(
              icon: Icons.person_add_alt_1,
              title: 'Create your account',
              subtitle: 'It only takes a minute.',
            ),
            const SizedBox(height: AwaTheme.gapXl),
            TextField(
              controller: _name,
              autofillHints: const [AutofillHints.name],
              decoration: const InputDecoration(
                labelText: 'Full name',
                prefixIcon: Icon(Icons.person_outline),
              ),
            ),
            const SizedBox(height: AwaTheme.gapM),
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
              helperText: 'At least 8 characters.',
              autofillHints: const [AutofillHints.newPassword],
            ),
            const SizedBox(height: AwaTheme.gapM),
            PasswordField(
              controller: _confirm,
              label: 'Confirm password',
              autofillHints: const [AutofillHints.newPassword],
              onSubmitted: (_) => _submit(),
            ),
            if (_error.isNotEmpty) ...[
              const SizedBox(height: AwaTheme.gapM),
              InlineMessage(text: _error, isError: true),
            ],
            const SizedBox(height: AwaTheme.gapL),
            FilledButton(
              onPressed: _busy ? null : _submit,
              child: Text(_busy ? 'Creating...' : 'Register'),
            ),
          ],
        ),
      ),
    );
  }
}

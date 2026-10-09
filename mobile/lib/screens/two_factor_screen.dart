import 'package:flutter/material.dart';

import '../config/app_config.dart';
import '../core/auth_service.dart';
import '../core/totp_service.dart';
import '../ui/awa_theme.dart';
import '../ui/awa_widgets.dart';

// Asks for the 6-digit authenticator code (or a one-time recovery code)
class TwoFactorScreen extends StatefulWidget {
  final String uid;
  final Map<String, dynamic> totp;
  final VoidCallback onPassed;

  const TwoFactorScreen({
    super.key,
    required this.uid,
    required this.totp,
    required this.onPassed,
  });

  @override
  State<TwoFactorScreen> createState() => _TwoFactorScreenState();
}

class _TwoFactorScreenState extends State<TwoFactorScreen> {
  final _code = TextEditingController();
  bool _recovery = false;
  bool _busy = false;
  String _error = '';

  @override
  void dispose() {
    _code.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_code.text.trim().isEmpty) {
      setState(() => _error = 'Enter your code.');
      return;
    }
    setState(() {
      _busy = true;
      _error = '';
    });
    try {
      final ok = _recovery
          ? await TotpService.useRecoveryCode(widget.uid, _code.text)
          : TotpService.checkCode(widget.totp['secret'] as String, _code.text);
      if (!mounted) return;
      if (ok) {
        await AuthService.logAction(widget.uid, '2fa_pass',
            _recovery ? 'recovery code (mobile)' : 'authenticator (mobile)');
        if (!mounted) return;
        widget.onPassed();
        return;
      }
      await AuthService.logAction(widget.uid, '2fa_failed', 'mobile');
      setState(() => _error = 'That code is not correct.');
    } catch (_) {
      if (mounted) setState(() => _error = 'Could not check the code. Try again.');
    }
    if (mounted) setState(() => _busy = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(backgroundColor: Colors.transparent),
      body: SafeArea(
        child: CenteredScroll(
          children: [
            AwaIntro(
              icon: Icons.verified_user_outlined,
              title: _recovery ? 'Use a recovery code' : 'Two-factor check',
              subtitle: _recovery
                  ? 'Enter one of your recovery codes. Each one works only once.'
                  : 'Open your authenticator app and enter the 6-digit code for ${AppConfig.appName}.',
            ),
            const SizedBox(height: AwaTheme.gapXl),
            TextField(
              controller: _code,
              keyboardType: _recovery ? TextInputType.text : TextInputType.number,
              autofillHints: const [AutofillHints.oneTimeCode],
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 22, letterSpacing: 6),
              decoration: InputDecoration(
                labelText: _recovery ? 'Recovery code' : '6-digit code',
                prefixIcon: const Icon(Icons.password),
              ),
              onSubmitted: (_) => _submit(),
            ),
            if (_error.isNotEmpty) ...[
              const SizedBox(height: AwaTheme.gapM),
              InlineMessage(text: _error, isError: true),
            ],
            const SizedBox(height: AwaTheme.gapL),
            FilledButton(
              onPressed: _busy ? null : _submit,
              child: Text(_busy ? 'Checking...' : 'Continue'),
            ),
            const SizedBox(height: AwaTheme.gapXs),
            TextButton(
              onPressed: () => setState(() {
                _recovery = !_recovery;
                _code.clear();
                _error = '';
              }),
              child: Text(_recovery
                  ? 'Use authenticator code instead'
                  : 'Lost your phone? Use a recovery code'),
            ),
            TextButton(onPressed: AuthService.signOut, child: const Text('Log out')),
          ],
        ),
      ),
    );
  }
}

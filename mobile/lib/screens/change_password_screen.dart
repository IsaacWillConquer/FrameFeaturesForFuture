import 'package:flutter/material.dart';

import '../core/auth_service.dart';
import '../core/password_field.dart';
import '../ui/awa_theme.dart';
import '../ui/awa_widgets.dart';

// Used for the forced first-login change and for a voluntary change from Profile.
class ChangePasswordScreen extends StatefulWidget {
  final String uid;
  final bool forced;
  final VoidCallback? onDone;

  const ChangePasswordScreen({
    super.key,
    required this.uid,
    this.forced = false,
    this.onDone,
  });

  @override
  State<ChangePasswordScreen> createState() => _ChangePasswordScreenState();
}

class _ChangePasswordScreenState extends State<ChangePasswordScreen> {
  final _current = TextEditingController();
  final _next = TextEditingController();
  final _confirm = TextEditingController();
  String _error = '';
  bool _busy = false;

  Future<void> _submit() async {
    if (_next.text.length < 8) {
      setState(() => _error = 'New password must be at least 8 characters.');
      return;
    }
    if (_next.text != _confirm.text) {
      setState(() => _error = 'New passwords do not match.');
      return;
    }
    setState(() {
      _busy = true;
      _error = '';
    });
    try {
      await AuthService.changePassword(_current.text, _next.text);
      if (!mounted) return;
      if (widget.onDone != null) {
        widget.onDone!();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Password changed.')),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) setState(() => _error = AuthService.errorMessage(e));
    }
    if (mounted) setState(() => _busy = false);
  }

  @override
  void dispose() {
    _current.dispose();
    _next.dispose();
    _confirm.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        title: Text(widget.forced ? 'Choose a new password' : 'Change password'),
        automaticallyImplyLeading: !widget.forced,
      ),
      body: SafeArea(
        child: CenteredScroll(
          children: [
            if (widget.forced) ...[
              const AwaIntro(
                icon: Icons.lock_reset,
                title: 'Set your own password',
                subtitle: 'For your safety, please change the password you were given before continuing.',
              ),
              const SizedBox(height: AwaTheme.gapXl),
            ],
            PasswordField(
              controller: _current,
              label: 'Current password',
              autofillHints: const [AutofillHints.password],
            ),
            const SizedBox(height: AwaTheme.gapM),
            PasswordField(
              controller: _next,
              label: 'New password',
              helperText: 'At least 8 characters.',
              autofillHints: const [AutofillHints.newPassword],
            ),
            const SizedBox(height: AwaTheme.gapM),
            PasswordField(
              controller: _confirm,
              label: 'Confirm new password',
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
              child: Text(_busy ? 'Saving...' : 'Change password'),
            ),
            if (widget.forced)
              TextButton(onPressed: AuthService.signOut, child: const Text('Log out')),
          ],
        ),
      ),
    );
  }
}

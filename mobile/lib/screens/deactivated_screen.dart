import 'package:flutter/material.dart';

import '../core/auth_service.dart';
import '../ui/awa_theme.dart';
import '../ui/awa_widgets.dart';

class DeactivatedScreen extends StatelessWidget {
  const DeactivatedScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(backgroundColor: Colors.transparent),
      body: SafeArea(
        child: CenteredScroll(
          children: [
            const AwaIntro(
              icon: Icons.block,
              title: 'Account deactivated',
              subtitle: 'An administrator turned off this account. Contact them if this is a mistake.',
            ),
            const SizedBox(height: AwaTheme.gapXl),
            FilledButton(onPressed: AuthService.signOut, child: const Text('Log out')),
          ],
        ),
      ),
    );
  }
}

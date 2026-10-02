import 'package:flutter/material.dart';

import '../core/auth_service.dart';

class DeactivatedScreen extends StatelessWidget {
  const DeactivatedScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Account deactivated')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            const Text('An administrator turned off this account. Contact them if this is a mistake.'),
            const SizedBox(height: 16),
            FilledButton(onPressed: AuthService.signOut, child: const Text('Log out')),
          ],
        ),
      ),
    );
  }
}

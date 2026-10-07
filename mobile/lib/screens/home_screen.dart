import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

import '../config/app_config.dart';
import '../core/auth_service.dart';
import 'scan_screen.dart';
import 'settings_screen.dart';

class HomeScreen extends StatelessWidget {
  final User user;
  final Map<String, dynamic>? profile; // the users/{uid} doc, loaded by AuthGate
  const HomeScreen({super.key, required this.user, this.profile});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(AppConfig.appName),
        actions: [
          TextButton(
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => SettingsScreen(uid: user.uid)),
            ),
            child: const Text('Settings'),
          ),
          TextButton(onPressed: AuthService.signOut, child: const Text('Log out')),
        ],
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Text(
              'Hello, ${profile?['name'] ?? user.email ?? ''}\nRole: ${profile?['role'] ?? 'user'}',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const ScanScreen()),
              ),
              child: const Text('Scan QR code'),
            ),
            const SizedBox(height: 24),
            Text('Notifications', style: Theme.of(context).textTheme.titleLarge),
            _Notifications(uid: user.uid),
          ],
        ),
      ),
    );
  }
}

class _Notifications extends StatelessWidget {
  final String uid;
  const _Notifications({required this.uid});

  @override
  Widget build(BuildContext context) {
    // Same query as the web bell. Sorted here so no Firestore index is needed.
    final stream = FirebaseFirestore.instance
        .collection(AppConfig.notifications)
        .where('userId', isEqualTo: uid)
        .snapshots();

    return StreamBuilder<QuerySnapshot<Map<String, dynamic>>>(
      stream: stream,
      builder: (context, snap) {
        if (snap.hasError) return const Text('Could not load notifications.');
        if (!snap.hasData) return const Padding(padding: EdgeInsets.all(16), child: CircularProgressIndicator());
        final docs = snap.data!.docs.toList()
          ..sort((a, b) {
            final ta = (a.data()['createdAt'] as Timestamp?)?.millisecondsSinceEpoch ?? 1 << 50;
            final tb = (b.data()['createdAt'] as Timestamp?)?.millisecondsSinceEpoch ?? 1 << 50;
            return tb.compareTo(ta);
          });
        if (docs.isEmpty) return const Text('No notifications yet.');
        return Column(
          children: docs.take(10).map((d) {
            final n = d.data();
            final unread = n['read'] != true;
            return ListTile(
              title: Text('${n['title'] ?? ''}${unread ? ' (unread)' : ''}',
                  style: TextStyle(fontWeight: unread ? FontWeight.bold : FontWeight.normal)),
              subtitle: Text('${n['message'] ?? ''}'),
              onTap: unread ? () => d.reference.update({'read': true}) : null,
            );
          }).toList(),
        );
      },
    );
  }
}

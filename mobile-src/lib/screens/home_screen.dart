import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

import '../config/app_config.dart';
import '../core/auth_service.dart';
import '../core/payment_qr.dart';
import 'announcements_screen.dart';
import 'change_password_screen.dart';
import 'checkin_screen.dart';
import 'scan_screen.dart';
import 'settings_screen.dart';
import 'wallet_screen.dart';

class HomeScreen extends StatelessWidget {
  final User user;
  final Map<String, dynamic>? profile; // the users/{uid} doc, loaded by AuthGate
  const HomeScreen({super.key, required this.user, this.profile});

  String get _name =>
      (profile?['name'] as String?)?.isNotEmpty == true
          ? profile!['name'] as String
          : (user.email ?? '');

  String _amountText(double v) =>
      v.toStringAsFixed(v.truncateToDouble() == v ? 0 : 2);

  // Scans a code; an AWA payment/profile code opens the wallet prefilled.
  Future<void> _openScanner(BuildContext context) async {
    final raw = await Navigator.push<String>(
      context,
      MaterialPageRoute(builder: (_) => const ScanScreen(payMode: true)),
    );
    if (raw == null || !context.mounted) return;
    final qr = parsePaymentQR(raw);
    if (qr == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Scanned: $raw')),
      );
      return;
    }
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => WalletScreen(
          uid: user.uid,
          name: _name,
          initialToUid: qr.type == 'pay' ? qr.toUid : qr.uid,
          initialAmount: qr.type == 'pay' ? _amountText(qr.amount) : null,
        ),
      ),
    );
  }


  @override
  Widget build(BuildContext context) {
    final role = (profile?['role'] as String?) ?? 'user';
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
              'Hello, $_name\nRole: $role',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 16),
            _Action('Scan QR code', Icons.qr_code_scanner,
                () => _openScanner(context)),
            _Action('Wallet', Icons.account_balance_wallet,
                () => Navigator.push(context, MaterialPageRoute(builder: (_) => WalletScreen(uid: user.uid, name: _name)))),
            _Action('Check-in', Icons.how_to_reg,
                () => Navigator.push(context, MaterialPageRoute(builder: (_) => CheckInScreen(uid: user.uid, name: _name)))),
            _Action('Announcements', Icons.campaign,
                () => Navigator.push(context, MaterialPageRoute(builder: (_) => AnnouncementsScreen(uid: user.uid, role: role)))),
            _Action('Change password', Icons.lock_reset,
                () => Navigator.push(context, MaterialPageRoute(builder: (_) => ChangePasswordScreen(uid: user.uid)))),
            const SizedBox(height: 24),
            Text('Notifications', style: Theme.of(context).textTheme.titleLarge),
            _Notifications(uid: user.uid),
          ],
        ),
      ),
    );
  }
}

class _Action extends StatelessWidget {
  final String label;
  final IconData icon;
  final VoidCallback onTap;
  const _Action(this.label, this.icon, this.onTap);

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: Icon(icon),
        title: Text(label),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
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
        final unread = docs.where((d) => d.data()['read'] != true).toList();
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (unread.isNotEmpty)
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: () async {
                    final batch = FirebaseFirestore.instance.batch();
                    for (final d in unread) {
                      batch.update(d.reference, {'read': true});
                    }
                    try {
                      await batch.commit();
                    } catch (_) {/* offline or rules: leave as is */}
                  },
                  child: const Text('Mark all as read'),
                ),
              ),
            ...docs.take(10).map((d) {
              final n = d.data();
              final isUnread = n['read'] != true;
              return ListTile(
                title: Text('${n['title'] ?? ''}${isUnread ? ' (unread)' : ''}',
                    style: TextStyle(fontWeight: isUnread ? FontWeight.bold : FontWeight.normal)),
                subtitle: Text('${n['message'] ?? ''}'),
                onTap: isUnread
                    ? () async {
                        try {
                          await d.reference.update({'read': true});
                        } catch (_) {
                          // Offline or rules: stays unread, no crash.
                        }
                      }
                    : null,
              );
            }),
          ],
        );
      },
    );
  }
}

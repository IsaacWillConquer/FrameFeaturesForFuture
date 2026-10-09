import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

import '../config/app_config.dart';
import '../core/auth_service.dart';
import '../core/payment_qr.dart';
import '../ui/awa_theme.dart';
import '../ui/awa_widgets.dart';
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
    final text = Theme.of(context).textTheme;
    final scheme = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const AwaLogoMark(size: 32),
            const SizedBox(width: AwaTheme.gapS + AwaTheme.gapXs),
            const Text(AppConfig.appName),
          ],
        ),
        actions: [
          IconButton(
            tooltip: 'Settings',
            icon: const Icon(Icons.tune),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => SettingsScreen(uid: user.uid)),
            ),
          ),
          IconButton(
            tooltip: 'Log out',
            icon: const Icon(Icons.logout),
            onPressed: AuthService.signOut,
          ),
          const SizedBox(width: AwaTheme.gapXs),
        ],
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
          children: [
            AwaCard(
              child: Row(
                children: [
                  AvatarChip(name: _name),
                  const SizedBox(width: AwaTheme.gapM),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _name,
                          style: text.titleMedium?.copyWith(fontWeight: FontWeight.w700),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: AwaTheme.gapXs),
                        _RolePill(role: role),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AwaTheme.gapL),
            const AwaSectionTitle(kicker: 'Shortcuts', title: 'What do you need?'),
            const SizedBox(height: AwaTheme.gapM),
            _QuickActions(
              onScan: () => _openScanner(context),
              onWallet: () => Navigator.push(context,
                  MaterialPageRoute(builder: (_) => WalletScreen(uid: user.uid, name: _name))),
              onCheckIn: () => Navigator.push(context,
                  MaterialPageRoute(builder: (_) => CheckInScreen(uid: user.uid, name: _name))),
              onAnnouncements: () => Navigator.push(context,
                  MaterialPageRoute(builder: (_) => AnnouncementsScreen(uid: user.uid, role: role))),
              onChangePassword: () => Navigator.push(context,
                  MaterialPageRoute(builder: (_) => ChangePasswordScreen(uid: user.uid))),
            ),
            const SizedBox(height: AwaTheme.gapXl),
            Text('Notifications', style: text.titleLarge?.copyWith(fontWeight: FontWeight.w700)),
            const SizedBox(height: AwaTheme.gapS),
            _Notifications(uid: user.uid),
            const SizedBox(height: AwaTheme.gapM),
            Center(
              child: Text(
                'Signed in as ${user.email ?? ''}',
                style: text.bodySmall?.copyWith(color: scheme.onSurfaceVariant),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _RolePill extends StatelessWidget {
  final String role;
  const _RolePill({required this.role});

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final label = role.isEmpty ? 'user' : '${role[0].toUpperCase()}${role.substring(1)}';
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: scheme.primary.withValues(alpha: 0.10),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: scheme.primary,
          fontWeight: FontWeight.w600,
          fontSize: 12,
        ),
      ),
    );
  }
}

class _QuickActions extends StatelessWidget {
  final VoidCallback onScan;
  final VoidCallback onWallet;
  final VoidCallback onCheckIn;
  final VoidCallback onAnnouncements;
  final VoidCallback onChangePassword;

  const _QuickActions({
    required this.onScan,
    required this.onWallet,
    required this.onCheckIn,
    required this.onAnnouncements,
    required this.onChangePassword,
  });

  @override
  Widget build(BuildContext context) {
    // Grow tiles with the user's text size so nothing ever clips.
    final scale = MediaQuery.textScalerOf(context).scale(1.0).clamp(1.0, 1.8);
    final items = <_ActionSpec>[
      _ActionSpec('Scan QR code', Icons.qr_code_scanner, onScan),
      _ActionSpec('Wallet', Icons.account_balance_wallet_outlined, onWallet),
      _ActionSpec('Check-in', Icons.how_to_reg_outlined, onCheckIn),
      _ActionSpec('Announcements', Icons.campaign_outlined, onAnnouncements),
      _ActionSpec('Change password', Icons.lock_reset, onChangePassword),
    ];
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: items.length,
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: AwaTheme.gapM,
        crossAxisSpacing: AwaTheme.gapM,
        mainAxisExtent: 118 * scale,
      ),
      itemBuilder: (context, i) => _QuickTile(spec: items[i]),
    );
  }
}

class _ActionSpec {
  final String label;
  final IconData icon;
  final VoidCallback onTap;
  const _ActionSpec(this.label, this.icon, this.onTap);
}

class _QuickTile extends StatelessWidget {
  final _ActionSpec spec;
  const _QuickTile({required this.spec});

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return AwaCard(
      tinted: true,
      onTap: spec.onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: scheme.primary.withValues(alpha: 0.14),
              borderRadius: BorderRadius.circular(AwaTheme.radiusSm),
            ),
            child: Icon(spec.icon, color: scheme.primary, size: 24),
          ),
          const Spacer(),
          Text(
            spec.label,
            style: Theme.of(context).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w600),
          ),
        ],
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
        if (snap.hasError) {
          return const InlineMessage(text: 'Could not load notifications.', isError: true);
        }
        if (!snap.hasData) {
          return const Padding(
            padding: EdgeInsets.all(AwaTheme.gapL),
            child: Center(child: CircularProgressIndicator()),
          );
        }
        final docs = snap.data!.docs.toList()
          ..sort((a, b) {
            final ta = (a.data()['createdAt'] as Timestamp?)?.millisecondsSinceEpoch ?? 1 << 50;
            final tb = (b.data()['createdAt'] as Timestamp?)?.millisecondsSinceEpoch ?? 1 << 50;
            return tb.compareTo(ta);
          });
        if (docs.isEmpty) {
          return const AwaCard(
            child: EmptyState(
              icon: Icons.notifications_none,
              title: 'You are all caught up',
              message: 'New notifications will show up here.',
            ),
          );
        }
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
              return Padding(
                padding: const EdgeInsets.only(bottom: AwaTheme.gapS),
                child: _NotificationTile(
                  title: '${n['title'] ?? ''}',
                  message: '${n['message'] ?? ''}',
                  unread: isUnread,
                  onTap: isUnread
                      ? () async {
                          try {
                            await d.reference.update({'read': true});
                          } catch (_) {
                            // Offline or rules: stays unread, no crash.
                          }
                        }
                      : null,
                ),
              );
            }),
          ],
        );
      },
    );
  }
}

class _NotificationTile extends StatelessWidget {
  final String title;
  final String message;
  final bool unread;
  final VoidCallback? onTap;

  const _NotificationTile({
    required this.title,
    required this.message,
    required this.unread,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return AwaCard(
      onTap: onTap,
      tinted: unread,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            margin: const EdgeInsets.only(top: 6),
            width: 10,
            height: 10,
            decoration: BoxDecoration(
              color: unread ? scheme.primary : scheme.outlineVariant,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: AwaTheme.gapS + AwaTheme.gapXs),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        fontWeight: unread ? FontWeight.w700 : FontWeight.w500,
                      ),
                ),
                if (message.isNotEmpty) ...[
                  const SizedBox(height: AwaTheme.gapXs),
                  Text(
                    message,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: scheme.onSurfaceVariant,
                        ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

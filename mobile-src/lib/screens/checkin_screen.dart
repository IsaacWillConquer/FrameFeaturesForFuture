import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';

import '../config/app_config.dart';
import '../core/auth_service.dart';
import '../ui/awa_theme.dart';
import '../ui/awa_widgets.dart';

// Record a visit and see recent check-ins. Same shape as the web checkins collection.
class CheckInScreen extends StatefulWidget {
  final String uid;
  final String name;
  const CheckInScreen({super.key, required this.uid, required this.name});

  @override
  State<CheckInScreen> createState() => _CheckInScreenState();
}

class _CheckInScreenState extends State<CheckInScreen> {
  final _note = TextEditingController();
  String _message = '';
  String _error = '';

  Future<void> _checkIn() async {
    setState(() {
      _message = '';
      _error = '';
    });
    try {
      await FirebaseFirestore.instance.collection(AppConfig.checkins).add({
        'uid': widget.uid,
        'name': widget.name,
        'note': _note.text.trim().isEmpty ? 'Walk-in' : _note.text.trim(),
        'createdAt': FieldValue.serverTimestamp(),
      });
      await AuthService.logAction(widget.uid, 'checkin', _note.text.trim());
      if (mounted) {
        setState(() {
          _message = 'Checked in. Welcome!';
          _note.clear();
        });
      }
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    }
  }

  @override
  void dispose() {
    _note.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final stream = FirebaseFirestore.instance
        .collection(AppConfig.checkins)
        .where('uid', isEqualTo: widget.uid)
        .snapshots();
    return Scaffold(
      appBar: AppBar(title: const Text('Check-in')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
          children: [
            const AwaSectionTitle(kicker: 'Today', title: 'Record your visit'),
            const SizedBox(height: AwaTheme.gapM),
            AwaCard(
              child: Column(
                children: [
                  TextField(
                    controller: _note,
                    textInputAction: TextInputAction.done,
                    onSubmitted: (_) => _checkIn(),
                    decoration: const InputDecoration(
                      labelText: 'Purpose (optional)',
                      prefixIcon: Icon(Icons.edit_note),
                    ),
                  ),
                  if (_error.isNotEmpty) ...[
                    const SizedBox(height: AwaTheme.gapM),
                    InlineMessage(text: _error, isError: true),
                  ],
                  if (_message.isNotEmpty) ...[
                    const SizedBox(height: AwaTheme.gapM),
                    InlineMessage(text: _message),
                  ],
                  const SizedBox(height: AwaTheme.gapM),
                  FilledButton.icon(
                    onPressed: _checkIn,
                    icon: const Icon(Icons.how_to_reg),
                    label: const Text('Check in'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AwaTheme.gapXl),
            const AwaSectionTitle(kicker: 'History', title: 'Recent check-ins'),
            const SizedBox(height: AwaTheme.gapM),
            StreamBuilder<QuerySnapshot<Map<String, dynamic>>>(
              stream: stream,
              builder: (context, snap) {
                if (snap.hasError) {
                  return const InlineMessage(text: 'Could not load check-ins.', isError: true);
                }
                if (!snap.hasData) {
                  return const Padding(
                    padding: EdgeInsets.all(AwaTheme.gapL),
                    child: Center(child: CircularProgressIndicator()),
                  );
                }
                final docs = snap.data!.docs.toList()
                  ..sort((a, b) {
                    final ta = (a.data()['createdAt'] as Timestamp?)?.millisecondsSinceEpoch ?? 0;
                    final tb = (b.data()['createdAt'] as Timestamp?)?.millisecondsSinceEpoch ?? 0;
                    return tb.compareTo(ta);
                  });
                if (docs.isEmpty) {
                  return const AwaCard(
                    child: EmptyState(
                      icon: Icons.event_available_outlined,
                      title: 'No check-ins yet',
                      message: 'Your visit history will appear here.',
                    ),
                  );
                }
                return Column(
                  children: docs.take(20).map((d) {
                    final v = d.data();
                    return Padding(
                      padding: const EdgeInsets.only(bottom: AwaTheme.gapS),
                      child: _CheckInRow(
                        note: (v['note'] ?? '').toString(),
                        when: v['createdAt'] is Timestamp
                            ? (v['createdAt'] as Timestamp).toDate().toLocal()
                            : null,
                      ),
                    );
                  }).toList(),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _CheckInRow extends StatelessWidget {
  final String note;
  final DateTime? when;
  const _CheckInRow({required this.note, required this.when});

  static const _months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  String get _label {
    if (when == null) return '';
    final h = when!.hour % 12 == 0 ? 12 : when!.hour % 12;
    final ampm = when!.hour < 12 ? 'AM' : 'PM';
    final min = when!.minute.toString().padLeft(2, '0');
    return '${_months[when!.month - 1]} ${when!.day}, $h:$min $ampm';
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final text = Theme.of(context).textTheme;
    return AwaCard(
      padding: const EdgeInsets.symmetric(horizontal: AwaTheme.gapM, vertical: AwaTheme.gapS + AwaTheme.gapXs),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: scheme.primary.withValues(alpha: 0.12),
              shape: BoxShape.circle,
            ),
            child: Icon(Icons.check, size: 20, color: scheme.primary),
          ),
          const SizedBox(width: AwaTheme.gapM),
          Expanded(
            child: Text(
              note.isEmpty ? 'Visit' : note,
              style: text.titleSmall?.copyWith(fontWeight: FontWeight.w600),
            ),
          ),
          if (_label.isNotEmpty)
            Text(_label, style: text.bodySmall?.copyWith(color: scheme.onSurfaceVariant)),
        ],
      ),
    );
  }
}

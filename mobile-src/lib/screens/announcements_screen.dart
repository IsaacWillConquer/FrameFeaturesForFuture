import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';

import '../config/app_config.dart';
import '../core/auth_service.dart';
import '../ui/awa_theme.dart';
import '../ui/awa_widgets.dart';

// Read announcements; staff and admin can also post.
class AnnouncementsScreen extends StatefulWidget {
  final String uid;
  final String role;
  const AnnouncementsScreen({super.key, required this.uid, required this.role});

  @override
  State<AnnouncementsScreen> createState() => _AnnouncementsScreenState();
}

class _AnnouncementsScreenState extends State<AnnouncementsScreen> {
  final _title = TextEditingController();
  final _body = TextEditingController();
  bool _busy = false;
  String _error = '';

  bool get _canPost => AppConfig.hasRole(widget.role, 'staff');

  Future<void> _post() async {
    if (_title.text.trim().isEmpty || _body.text.trim().isEmpty) {
      setState(() => _error = 'A title and a message are required.');
      return;
    }
    setState(() {
      _busy = true;
      _error = '';
    });
    try {
      await FirebaseFirestore.instance
          .collection(AppConfig.announcements)
          .add({
        'title': _title.text.trim(),
        'body': _body.text.trim(),
        'createdBy': widget.uid,
        'createdAt': FieldValue.serverTimestamp(),
      });
      await AuthService.logAction(widget.uid, 'announcement_create', _title.text.trim());
      if (mounted) {
        setState(() {
          _title.clear();
          _body.clear();
        });
      }
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    }
    if (mounted) setState(() => _busy = false);
  }

  @override
  void dispose() {
    _title.dispose();
    _body.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final stream = FirebaseFirestore.instance
        .collection(AppConfig.announcements)
        .snapshots();
    return Scaffold(
      appBar: AppBar(title: const Text('Announcements')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
          children: [
            if (_canPost) ...[
              const AwaSectionTitle(kicker: 'Staff', title: 'Post an announcement'),
              const SizedBox(height: AwaTheme.gapM),
              AwaCard(
                child: Column(
                  children: [
                    TextField(
                      controller: _title,
                      decoration: const InputDecoration(
                        labelText: 'Title',
                        prefixIcon: Icon(Icons.title),
                      ),
                    ),
                    const SizedBox(height: AwaTheme.gapM),
                    TextField(
                      controller: _body,
                      minLines: 2,
                      maxLines: 4,
                      decoration: const InputDecoration(
                        labelText: 'Message',
                        alignLabelWithHint: true,
                      ),
                    ),
                    if (_error.isNotEmpty) ...[
                      const SizedBox(height: AwaTheme.gapM),
                      InlineMessage(text: _error, isError: true),
                    ],
                    const SizedBox(height: AwaTheme.gapM),
                    FilledButton.icon(
                      onPressed: _busy ? null : _post,
                      icon: const Icon(Icons.send),
                      label: Text(_busy ? 'Posting...' : 'Post'),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AwaTheme.gapXl),
            ],
            const AwaSectionTitle(kicker: 'Feed', title: 'Recent'),
            const SizedBox(height: AwaTheme.gapM),
            StreamBuilder<QuerySnapshot<Map<String, dynamic>>>(
              stream: stream,
              builder: (context, snap) {
                if (snap.hasError) {
                  return const InlineMessage(text: 'Could not load announcements.', isError: true);
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
                      icon: Icons.campaign_outlined,
                      title: 'No announcements yet',
                      message: 'Updates from staff will appear here.',
                    ),
                  );
                }
                return Column(
                  children: docs.map((d) {
                    final a = d.data();
                    return Padding(
                      padding: const EdgeInsets.only(bottom: AwaTheme.gapS),
                      child: AwaCard(
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(
                                color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.12),
                                shape: BoxShape.circle,
                              ),
                              child: Icon(
                                Icons.campaign,
                                size: 20,
                                color: Theme.of(context).colorScheme.primary,
                              ),
                            ),
                            const SizedBox(width: AwaTheme.gapM),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    '${a['title'] ?? ''}',
                                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                          fontWeight: FontWeight.w700,
                                        ),
                                  ),
                                  if ('${a['body'] ?? ''}'.isNotEmpty) ...[
                                    const SizedBox(height: AwaTheme.gapXs),
                                    Text(
                                      '${a['body'] ?? ''}',
                                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                            color: Theme.of(context).colorScheme.onSurfaceVariant,
                                          ),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                          ],
                        ),
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

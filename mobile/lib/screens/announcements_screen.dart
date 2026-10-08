import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';

import '../config/app_config.dart';
import '../core/auth_service.dart';

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
          padding: const EdgeInsets.all(16),
          children: [
            if (_canPost) ...[
              Text('Post an announcement', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 8),
              TextField(
                controller: _title,
                decoration: const InputDecoration(labelText: 'Title', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _body,
                minLines: 2,
                maxLines: 4,
                decoration: const InputDecoration(labelText: 'Message', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 8),
              if (_error.isNotEmpty)
                Semantics(liveRegion: true, child: Text(_error, style: TextStyle(color: Theme.of(context).colorScheme.error))),
              FilledButton(
                onPressed: _busy ? null : _post,
                child: Text(_busy ? 'Posting...' : 'Post'),
              ),
              const Divider(height: 32),
            ],
            Text('Recent', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            StreamBuilder<QuerySnapshot<Map<String, dynamic>>>(
              stream: stream,
              builder: (context, snap) {
                if (snap.hasError) return const Text('Could not load announcements.');
                if (!snap.hasData) {
                  return const Padding(
                    padding: EdgeInsets.all(16),
                    child: CircularProgressIndicator(),
                  );
                }
                final docs = snap.data!.docs.toList()
                  ..sort((a, b) {
                    final ta = (a.data()['createdAt'] as Timestamp?)?.millisecondsSinceEpoch ?? 0;
                    final tb = (b.data()['createdAt'] as Timestamp?)?.millisecondsSinceEpoch ?? 0;
                    return tb.compareTo(ta);
                  });
                if (docs.isEmpty) return const Text('No announcements yet.');
                return Column(
                  children: docs.map((d) {
                    final a = d.data();
                    return Card(
                      child: ListTile(
                        title: Text('${a['title'] ?? ''}'),
                        subtitle: Text('${a['body'] ?? ''}'),
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

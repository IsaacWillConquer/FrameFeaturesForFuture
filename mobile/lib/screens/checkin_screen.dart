import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';

import '../config/app_config.dart';
import '../core/auth_service.dart';

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
          padding: const EdgeInsets.all(16),
          children: [
            TextField(
              controller: _note,
              decoration: const InputDecoration(
                labelText: 'Purpose (optional)',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            if (_error.isNotEmpty)
              Semantics(liveRegion: true, child: Text(_error, style: TextStyle(color: Theme.of(context).colorScheme.error))),
            if (_message.isNotEmpty)
              Text(_message, style: const TextStyle(color: Colors.green)),
            const SizedBox(height: 8),
            FilledButton(onPressed: _checkIn, child: const Text('Check in')),
            const Divider(height: 32),
            Text('Recent check-ins', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            StreamBuilder<QuerySnapshot<Map<String, dynamic>>>(
              stream: stream,
              builder: (context, snap) {
                if (snap.hasError) return const Text('Could not load check-ins.');
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
                if (docs.isEmpty) return const Text('No check-ins yet.');
                return Column(
                  children: docs.take(20).map((d) {
                    final v = d.data();
                    return ListTile(
                      title: Text((v['note'] ?? '').toString()),
                      trailing: Text(
                        v['createdAt'] is Timestamp
                            ? (v['createdAt'] as Timestamp)
                                .toDate()
                                .toLocal()
                                .toString()
                                .substring(0, 16)
                            : '',
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

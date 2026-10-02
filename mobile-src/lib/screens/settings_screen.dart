import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';

import '../config/app_config.dart';
import '../core/app_prefs.dart';

// Text size + dark mode. Saved on the account, so the web app shows the same settings.
class SettingsScreen extends StatefulWidget {
  final String uid;
  const SettingsScreen({super.key, required this.uid});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  late String _size;
  late bool _dark;

  @override
  void initState() {
    super.initState();
    final prefs = AppPrefs.notifier.value;
    _size = (prefs['textSize'] as String?) ?? 'normal';
    _dark = prefs['dark'] == true;
  }

  Future<void> _save(String key, dynamic value) async {
    // Instant on this phone...
    AppPrefs.apply({...AppPrefs.notifier.value, key: value});
    // ...and saved to the account (only this one setting, so web-only ones stay untouched)
    try {
      await FirebaseFirestore.instance
          .collection(AppConfig.users)
          .doc(widget.uid)
          .update({'prefs.$key': value});
    } catch (_) {/* offline is fine, it still applies on this phone */}
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Text('Text size', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            SegmentedButton<String>(
              segments: const [
                ButtonSegment(value: 'normal', label: Text('Normal')),
                ButtonSegment(value: 'large', label: Text('Large')),
                ButtonSegment(value: 'xlarge', label: Text('Extra large')),
              ],
              selected: {_size},
              onSelectionChanged: (s) {
                setState(() => _size = s.first);
                _save('textSize', s.first);
              },
            ),
            const SizedBox(height: 16),
            SwitchListTile(
              title: const Text('Dark mode'),
              value: _dark,
              onChanged: (v) {
                setState(() => _dark = v);
                _save('dark', v);
              },
            ),
          ],
        ),
      ),
    );
  }
}

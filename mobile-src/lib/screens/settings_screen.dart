import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';

import '../config/app_config.dart';
import '../core/app_prefs.dart';
import '../ui/awa_theme.dart';
import '../ui/awa_widgets.dart';

// Text size + display options. Saved on the account, so the web app shows the same settings.
class SettingsScreen extends StatefulWidget {
  final String uid;
  const SettingsScreen({super.key, required this.uid});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  late String _size;
  late bool _dark;
  late bool _contrast;
  late bool _reduceMotion;
  late bool _dyslexia;

  @override
  void initState() {
    super.initState();
    final prefs = AppPrefs.notifier.value;
    _size = (prefs['textSize'] as String?) ?? 'normal';
    _dark = prefs['dark'] == true;
    _contrast = prefs['contrast'] == true;
    _reduceMotion = prefs['reduceMotion'] == true;
    _dyslexia = prefs['dyslexia'] == true;
  }

  Future<void> _save(String key, dynamic value) async {
    // Instant on this phone...
    AppPrefs.apply({...AppPrefs.notifier.value, key: value});
    // ...and saved to the account (only this one setting)
    try {
      await FirebaseFirestore.instance
          .collection(AppConfig.users)
          .doc(widget.uid)
          .update({'prefs.$key': value});
    } catch (_) {/* offline is fine, it still applies on this phone */}
  }

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
          children: [
            const AwaSectionTitle(kicker: 'Display', title: 'Reading comfort'),
            const SizedBox(height: AwaTheme.gapM),
            AwaCard(
              padding: const EdgeInsets.all(AwaTheme.gapM),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Text size', style: text.titleSmall?.copyWith(fontWeight: FontWeight.w600)),
                  const SizedBox(height: AwaTheme.gapS),
                  SizedBox(
                    width: double.infinity,
                    child: SegmentedButton<String>(
                      showSelectedIcon: false,
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
                  ),
                ],
              ),
            ),
            const SizedBox(height: AwaTheme.gapM),
            AwaCard(
              padding: EdgeInsets.zero,
              child: Column(
                children: [
                  SwitchListTile(
                    secondary: const Icon(Icons.dark_mode_outlined),
                    title: const Text('Dark mode'),
                    value: _dark,
                    onChanged: (v) {
                      setState(() => _dark = v);
                      _save('dark', v);
                    },
                  ),
                  const Divider(height: 1, indent: 16, endIndent: 16),
                  SwitchListTile(
                    secondary: const Icon(Icons.contrast),
                    title: const Text('High contrast'),
                    subtitle: const Text('Stronger borders and darker text.'),
                    value: _contrast,
                    onChanged: (v) {
                      setState(() => _contrast = v);
                      _save('contrast', v);
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: AwaTheme.gapXl),
            const AwaSectionTitle(kicker: 'Motion', title: 'Movement & text'),
            const SizedBox(height: AwaTheme.gapM),
            AwaCard(
              padding: EdgeInsets.zero,
              child: Column(
                children: [
                  SwitchListTile(
                    secondary: const Icon(Icons.animation),
                    title: const Text('Reduce motion'),
                    value: _reduceMotion,
                    onChanged: (v) {
                      setState(() => _reduceMotion = v);
                      _save('reduceMotion', v);
                    },
                  ),
                  const Divider(height: 1, indent: 16, endIndent: 16),
                  SwitchListTile(
                    secondary: const Icon(Icons.text_fields),
                    title: const Text('Dyslexia-friendly spacing'),
                    value: _dyslexia,
                    onChanged: (v) {
                      setState(() => _dyslexia = v);
                      _save('dyslexia', v);
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

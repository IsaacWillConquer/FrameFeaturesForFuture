import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

import '../ui/awa_theme.dart';
import '../ui/awa_widgets.dart';

// Camera scan with a type-the-code fallback (camera must never be the only way).
// When payMode is true the screen returns the scanned value to the caller
// (used by the wallet's scan-to-pay); otherwise it just displays it.
class ScanScreen extends StatefulWidget {
  final bool payMode;
  const ScanScreen({super.key, this.payMode = false});

  @override
  State<ScanScreen> createState() => _ScanScreenState();
}

class _ScanScreenState extends State<ScanScreen> {
  final _typed = TextEditingController();
  String? _result;
  bool _cameraOn = false;

  void _got(String value, {bool fromCamera = false}) {
    // The camera fires many times per second, so only the camera path is guarded.
    // Typed codes always go through (you can enter a second code).
    if (fromCamera && _result != null) return;
    if (widget.payMode) {
      if (mounted) Navigator.pop(context, value);
      return;
    }
    setState(() {
      _result = value;
      _cameraOn = false; // removing the widget releases the camera
    });
  }

  @override
  void dispose() {
    _typed.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    final scheme = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(title: Text(widget.payMode ? 'Scan a payment code' : 'Scan QR code')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
          children: [
            if (widget.payMode)
              Padding(
                padding: const EdgeInsets.only(bottom: AwaTheme.gapM),
                child: Text(
                  'Point the camera at an AWA payment or profile code.',
                  style: text.bodyMedium?.copyWith(color: scheme.onSurfaceVariant),
                ),
              ),
            if (_cameraOn)
              ClipRRect(
                borderRadius: BorderRadius.circular(AwaTheme.radius),
                child: SizedBox(
                  height: 320,
                  child: MobileScanner(
                    onDetect: (capture) {
                      for (final b in capture.barcodes) {
                        final v = b.rawValue;
                        if (v != null && v.isNotEmpty) {
                          _got(v, fromCamera: true);
                          break;
                        }
                      }
                    },
                    errorBuilder: (context, error, child) =>
                        const Center(child: Text('Camera unavailable. Type the code below.')),
                  ),
                ),
              )
            else
              FilledButton.icon(
                onPressed: () => setState(() {
                  _result = null;
                  _cameraOn = true;
                }),
                icon: const Icon(Icons.qr_code_scanner),
                label: const Text('Scan with camera'),
              ),
            const SizedBox(height: AwaTheme.gapXl),
            const AwaSectionTitle(kicker: 'No camera?', title: 'Type the code'),
            const SizedBox(height: AwaTheme.gapM),
            TextField(
              controller: _typed,
              decoration: const InputDecoration(
                labelText: 'Or type the code',
                prefixIcon: Icon(Icons.keyboard),
              ),
            ),
            const SizedBox(height: AwaTheme.gapM),
            OutlinedButton.icon(
              onPressed: () {
                if (_typed.text.trim().isNotEmpty) _got(_typed.text.trim());
              },
              icon: const Icon(Icons.check),
              label: const Text('Use this code'),
            ),
            if (_result != null) ...[
              const SizedBox(height: AwaTheme.gapM),
              InlineMessage(text: 'Scanned: $_result'),
            ],
          ],
        ),
      ),
    );
  }
}

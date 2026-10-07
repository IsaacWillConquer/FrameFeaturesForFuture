import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

// Camera scan with a type-the-code fallback (camera must never be the only way)
class ScanScreen extends StatefulWidget {
  const ScanScreen({super.key});

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
    return Scaffold(
      appBar: AppBar(title: const Text('Scan QR code')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            if (_cameraOn)
              SizedBox(
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
              )
            else
              FilledButton(
                onPressed: () => setState(() {
                  _result = null;
                  _cameraOn = true;
                }),
                child: const Text('Scan with camera'),
              ),
            const SizedBox(height: 24),
            TextField(
              controller: _typed,
              decoration: const InputDecoration(labelText: 'Or type the code', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 8),
            OutlinedButton(
              onPressed: () {
                if (_typed.text.trim().isNotEmpty) _got(_typed.text.trim());
              },
              child: const Text('Use this code'),
            ),
            if (_result != null)
              Semantics(
                liveRegion: true,
                child: Padding(
                  padding: const EdgeInsets.only(top: 16),
                  child: Text('Scanned: $_result'),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

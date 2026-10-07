import 'package:local_auth/local_auth.dart';

import '../config/app_config.dart';

class BiometricService {
  static final _auth = LocalAuthentication();

  // True if the phone has a fingerprint/face OR a screen lock (PIN/pattern)
  static Future<bool> available() async {
    try {
      return await _auth.isDeviceSupported();
    } catch (_) {
      return false;
    }
  }

  // biometricOnly: false lets the phone fall back to its PIN/pattern,
  // so a failed fingerprint never locks the person out.
  static Future<bool> unlock() async {
    try {
      return await _auth.authenticate(
        localizedReason: 'Unlock ${AppConfig.appName}',
        options: const AuthenticationOptions(biometricOnly: false, stickyAuth: true),
      );
    } catch (_) {
      return false;
    }
  }
}

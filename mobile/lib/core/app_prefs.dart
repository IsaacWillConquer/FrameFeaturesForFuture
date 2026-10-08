import 'package:flutter/foundation.dart';

// The person's accessibility settings. Same keys as the web app:
// textSize, dark, contrast, reduceMotion, dyslexia.
// main.dart listens to this, so changing it restyles the whole app instantly.
class AppPrefs {
  static final ValueNotifier<Map<String, dynamic>> notifier =
      ValueNotifier<Map<String, dynamic>>(<String, dynamic>{});

  static void apply(Map<String, dynamic>? prefs) {
    notifier.value =
        prefs == null ? <String, dynamic>{} : Map<String, dynamic>.from(prefs);
  }

  static bool get dark => notifier.value['dark'] == true;
  static bool get contrast => notifier.value['contrast'] == true;
  static bool get reduceMotion => notifier.value['reduceMotion'] == true;
  static bool get dyslexia => notifier.value['dyslexia'] == true;

  static double textFactor(Map<String, dynamic> prefs) {
    switch (prefs['textSize']) {
      case 'large':
        return 1.2;
      case 'xlarge':
        return 1.4;
      default:
        return 1.0;
    }
  }
}

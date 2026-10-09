import 'package:flutter/material.dart';

// AWA mobile design system.
//
// One brand seed (the same blue the web app uses) drives light + dark, so the
// phone and the site feel like one product. Everything is built on Material 3,
// and the accessibility options (text size, dark, high contrast, dyslexia
// spacing) are applied on top so a "pretty" UI never costs anyone readability.
class AwaTheme {
  AwaTheme._();

  // Brand seed = web/src/index.css --primary (#1d4ed8).
  static const Color seed = Color(0xFF1D4ED8);

  // Airy, soft canvases (light slate / deep navy, matching the web canvas).
  static const Color _lightCanvas = Color(0xFFF4F6FB);
  static const Color _darkCanvas = Color(0xFF0B1120);

  // 8-point grid.
  static const double gapXs = 4;
  static const double gapS = 8;
  static const double gapM = 16;
  static const double gapL = 24;
  static const double gapXl = 32;

  static const double radius = 20;
  static const double radiusSm = 14;

  // Adds letter spacing + line height for the dyslexia-friendly option.
  static TextTheme _spaced(TextTheme t) {
    TextStyle? s(TextStyle? x) => x?.copyWith(letterSpacing: 0.6, height: 1.6);
    return t.copyWith(
      displayLarge: s(t.displayLarge),
      displayMedium: s(t.displayMedium),
      displaySmall: s(t.displaySmall),
      headlineLarge: s(t.headlineLarge),
      headlineMedium: s(t.headlineMedium),
      headlineSmall: s(t.headlineSmall),
      titleLarge: s(t.titleLarge),
      titleMedium: s(t.titleMedium),
      titleSmall: s(t.titleSmall),
      bodyLarge: s(t.bodyLarge),
      bodyMedium: s(t.bodyMedium),
      bodySmall: s(t.bodySmall),
      labelLarge: s(t.labelLarge),
      labelMedium: s(t.labelMedium),
      labelSmall: s(t.labelSmall),
    );
  }

  static ThemeData build(Brightness brightness, Map<String, dynamic> prefs) {
    final contrast = prefs['contrast'] == true;
    final isDark = brightness == Brightness.dark;
    var scheme = ColorScheme.fromSeed(
      seedColor: seed,
      brightness: brightness,
      contrastLevel: contrast ? 1.0 : 0.0,
    );
    // fromSeed mutes the seed into a tonal palette; pin the brand blue so the
    // phone matches the web's crisp primary. High-contrast is left as-is so its
    // black/white/yellow scheme keeps working.
    if (!contrast) {
      scheme = scheme.copyWith(
        primary: isDark ? const Color(0xFF3B82F6) : const Color(0xFF1D4ED8),
        onPrimary: isDark ? const Color(0xFF07173A) : Colors.white,
        primaryContainer: isDark ? const Color(0xFF1E3A8A) : const Color(0xFFDBEAFE),
        onPrimaryContainer: isDark ? const Color(0xFFDBEAFE) : const Color(0xFF1E3A8A),
      );
    }
    final canvas = isDark ? _darkCanvas : _lightCanvas;
    final rounded = BorderRadius.circular(radiusSm);
    final hairline = scheme.outlineVariant.withValues(alpha: 0.55);

    final base = ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      brightness: brightness,
      scaffoldBackgroundColor: canvas,
      // Keeps tap targets at least 48dp (accessibility).
      materialTapTargetSize: MaterialTapTargetSize.padded,
      splashFactory: InkSparkle.splashFactory,
    );

    final themed = base.copyWith(
      textTheme: base.textTheme.apply(
        bodyColor: scheme.onSurface,
        displayColor: scheme.onSurface,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: canvas,
        foregroundColor: scheme.onSurface,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleTextStyle: base.textTheme.titleLarge?.copyWith(
          fontWeight: FontWeight.w700,
          color: scheme.onSurface,
        ),
      ),
      cardTheme: CardThemeData(
        color: scheme.surface,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radius),
          side: BorderSide(color: hairline),
        ),
      ),
      inputDecorationTheme: InputDecorationThemeData(
        filled: true,
        fillColor: scheme.surfaceContainerLowest,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        labelStyle: TextStyle(color: scheme.onSurfaceVariant),
        floatingLabelStyle: TextStyle(color: scheme.primary),
        border: OutlineInputBorder(
          borderRadius: rounded,
          borderSide: BorderSide(color: scheme.outlineVariant),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: rounded,
          borderSide: BorderSide(color: scheme.outlineVariant),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: rounded,
          borderSide: BorderSide(color: scheme.primary, width: 1.8),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: rounded,
          borderSide: BorderSide(color: scheme.error),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: rounded,
          borderSide: BorderSide(color: scheme.error, width: 1.8),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          minimumSize: const Size(64, 52),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: rounded),
          textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          minimumSize: const Size(64, 52),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          side: BorderSide(color: scheme.outlineVariant),
          shape: RoundedRectangleBorder(borderRadius: rounded),
          foregroundColor: scheme.onSurface,
          textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          minimumSize: const Size(48, 44),
          foregroundColor: scheme.primary,
          textStyle: const TextStyle(fontWeight: FontWeight.w600),
        ),
      ),
      segmentedButtonTheme: SegmentedButtonThemeData(
        style: ButtonStyle(
          shape: WidgetStatePropertyAll(
            RoundedRectangleBorder(borderRadius: rounded),
          ),
          padding: const WidgetStatePropertyAll(
            EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          ),
        ),
      ),
      listTileTheme: const ListTileThemeData(
        contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      ),
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        backgroundColor: scheme.inverseSurface,
        contentTextStyle: TextStyle(color: scheme.onInverseSurface),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(radiusSm)),
      ),
      dividerTheme: DividerThemeData(color: hairline, thickness: 1, space: 1),
    );

    if (prefs['dyslexia'] == true) {
      return themed.copyWith(textTheme: _spaced(themed.textTheme));
    }
    return themed;
  }
}

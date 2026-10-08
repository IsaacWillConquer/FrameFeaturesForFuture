# AWA mobile (Flutter, Android first)

The resident-side companion to the AWA web app: login, email verification, 2FA, biometric app-lock,
wallet (with QR pay/receive), check-in, announcements and accessibility settings.

**Source of truth is `../mobile-src/lib`.** The files here under `lib/` are a copy — edit
`mobile-src/lib` first, then copy it over (see `../mobile-src/README.md` for the full setup).

## Before it will build
`lib/firebase_options.dart` is generated and **not committed**. Run, from this folder:

```
flutterfire configure   # pick the AWA Firebase project, Android only
flutter run             # with a phone (USB debugging) or emulator
```

`flutter analyze` will show two `firebase_options.dart` errors until that step is done — that is
expected, not a code fault.

## What's here
- `lib/main.dart` — app entry, theming (text size, dark, contrast, reduce motion, dyslexia), idle logout.
- `lib/config/app_config.dart` — collection names, roles, idle timeout.
- `lib/core/` — auth, TOTP, biometrics, login limiter, payment QR, idle watcher, prefs.
- `lib/screens/` — auth gate and every screen.

Setup, permissions and known limitations: `../mobile-src/README.md` and `../docs/HANDOFF.md`.

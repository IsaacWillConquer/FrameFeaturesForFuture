# TODO — pick up here

**Updated Oct 8, 2026.** Web is built, lint-clean and **builds**. Mobile source is lint-clean
except the expected `firebase_options.dart` import (needs `firebase login`). Nothing is deployed
or live-tested yet. Full context: `docs/HANDOFF.md`.

## Done — don't redo
- Web v3: design system, app shell, all pages, CRUD kit, P1 security, security extras, P4 extras
  (wallet, SMS, AI, check-in, voice, TTS, PWA).
- Firestore rules hardened: `ai_chats` read fixed (was blocking history), `public_profiles` +
  `support_requests` added, and wallet credits are now rules-safe. **Wallet transfers and AI chat
  history work for normal users** (they used to fail with permission-denied).
- Wallet recipients now come from `public_profiles` (no longer blocked by the `users` rule).
- Fallback chain is functional and honest: "Ask staff for help" files a real support request, and
  staff resolve them at **`/admin/support`**. 2FA status now **fails closed**.
- PWA install: manifest + real PNG icons (192/512) + minimal service worker.
- Deferred extras built: **scan-to-pay QR** (wallet), **voice commands**, **i18n** (shell/nav/auth,
  English + Filipino, language toggle).
- Mobile (source in `mobile-src/lib`, synced to `mobile/lib`): register, forgot password, forced
  first-login change, **persisted** login lockout, idle logout (**all screens**), full a11y prefs,
  wallet + **scan-to-pay** + **QR pay/receive** (`qr_flutter`), check-in, announcements,
  mark-all-read, show/hide password toggles. Android **`INTERNET` permission** added for release.
  `flutter analyze` = only the 2 expected `firebase_options.dart` errors.
- Lint: web 0 errors / 0 warnings; web build success. Docs: ERD, user manual, a11y statement,
  defense notes.

## 1. Commit the working copy
- [ ] `git add -A` and commit (rules, new services/pages, PWA, i18n, voice commands, mobile, docs).

## 2. Firebase setup (needs your console / login)
- [ ] Email/Password + Google auth ON; Firestore created; **publish `web/firestore.rules`**
      (required — the old rules break wallet transfers, AI history, and `/admin/support`).
- [ ] Make the first admin: register on web, then console → `users` → your doc → `role` = `admin`.

## 3. Live test + deploy (QR camera + WebAuthn need HTTPS)
- [ ] `npm run dev` in `web/`; run T1–T95 in `docs/AWA-test-guide.md`.
- [ ] `npm run deploy`; test the live URL (T66–T70) + QR camera on your PHONE (T71).

## 4. Mobile (blocked on `firebase login`)
- [ ] In `mobile/`: `flutterfire configure` (AWA project, Android) → creates `firebase_options.dart`.
      This is the only thing keeping `flutter analyze` from being fully clean.
- [ ] `flutter run`; then tests M1–M13.
- Mobile already has: register, forgot password, forced first-login change, persisted login lockout,
  idle logout (all screens), full a11y prefs, wallet + scan-to-pay + QR pay/receive, check-in,
  announcements, mark-all-read. Android `INTERNET` permission added (needed for release).

## 5. Reveal day (Oct 10) — topic modules
- [ ] Fill the feature map in `docs/AWA-blueprint-and-todo.md` §4.
- [ ] One `web/src/modules/<entity>/` folder per entity (CRUD kit + config).
- [ ] Copy the `items` rules block per new collection; edit `web/src/config/appConfig.js`.

## 6. Still optional (not blockers)
- [ ] Mobile-only gaps: Google sign-in, WebAuthn/face enrollment, 2FA enable/disable, profile edit,
      admin screens (users/audit/support), TTS read-aloud.
- [ ] Lighthouse a11y audit + NVDA/TalkBack pass (needs the live app).

## Dates
Health break Oct 7–9 · Dev window Oct 10–29 · **Submit Oct 28 (real deadline)**

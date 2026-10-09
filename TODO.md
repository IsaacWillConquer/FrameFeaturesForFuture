# TODO — pick up here

**Updated Oct 9, 2026.** Web is built, lint-clean and **builds**. Mobile now **builds and runs on
an Android emulator** (Kotlin 2.3 build fix + a local `firebase_options.dart`, see §4). Mobile
startup, login, settings, locks, QR fallback and logout were hand-tested on the emulator. Wallet,
check-in and announcements initially failed on stale deployed rules, but **pass now that
`web/firestore.rules` is published**. Nothing is deployed to Hosting yet. Full context:
`docs/HANDOFF.md`.

## Mobile UI refresh (Oct 9)
- New design system under `mobile-src/lib/ui/`: `awa_theme.dart` (brand theme — one blue seed
  `#1D4ED8`, matching the web; globally rounded inputs/cards/buttons) + `awa_widgets.dart`
  (`AwaCard`, `AwaSectionTitle`, `EmptyState`, `InlineMessage`, `AvatarChip`, `AwaLogoMark`,
  `AwaIntro`, `CenteredScroll`).
- All 15 screens restyled: branded login/register; home with avatar + role pill + quick-action grid
  + notification empty state; wallet balance hero + carded send/QR/transactions; check-in &
  announcements cards with empty states; grouped settings; scan. **Logic untouched** — only the
  presentation layer changed.
- Accessibility preserved: text size, dark, high contrast, dyslexia spacing, reduce motion all still
  apply (verified on the emulator). `flutter analyze` clean; `flutter build apk --debug` succeeds.

## Mobile emulator test pass (Oct 9) — findings
- **Passed:** app launches + Firebase init; login screen; wrong-password error; login lockout
  (5 tries) **persists across a full app restart**; forgot-password; register validation;
  change-password validation; Settings (large text + dark mode) apply instantly; Home shows
  name/role; QR typed fallback; log out → login with theme reset.
- **Fixed after publishing rules:** Wallet/Check-in/Announcements first failed with
  `permission-denied` because the deployed rules were the **old "starting point"** (`9c23030`).
  After publishing `web/firestore.rules`, **re-tested and they pass**: wallet auto-created (500) and
  top-up worked (500 → 600, "Added 100.0"), check-in recorded ("Checked in. Welcome!" + row in
  Recent), announcements load cleanly. (User-to-user transfer not tested — needs a 2nd account.)
- **Not tested:** M1/M3/M4/M5 (need a real account / biometrics), M7/M8/M11 (need web side),
  camera scan (needs a physical device).

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
  `flutter analyze` = **clean** (Oct 9, after the Kotlin build fix + local `firebase_options.dart`).
- Lint: web 0 errors / 0 warnings; web build success. Docs: ERD, user manual, a11y statement,
  defense notes.

## 1. Commit the working copy
- [ ] `git add -A` and commit (rules, new services/pages, PWA, i18n, voice commands, mobile, docs).

## 2. Firebase setup (needs your console / login)
- [x] Email/Password + Firestore created and working (confirmed by the Oct 9 emulator login).
- [x] **Publish `web/firestore.rules`** — **done Oct 9** (was the cause of mobile Wallet/Check-in/
      Announcements permission-denied; re-tested and passing after publishing).
- [ ] Make the first admin: register on web, then console → `users` → your doc → `role` = `admin`.

## 3. Live test + deploy (QR camera + WebAuthn need HTTPS)
- [ ] `npm run dev` in `web/`; run T1–T95 in `docs/AWA-test-guide.md`.
- [ ] `npm run deploy`; test the live URL (T66–T70) + QR camera on your PHONE (T71).

## 4. Mobile (builds + runs on emulator; finish setup for a real device)
- [ ] **Build fix applied Oct 9** (keep it): Kotlin plugin 2.1.0 → **2.3.0** in
      `mobile/android/settings.gradle.kts` (firebase_auth ships Kotlin 2.3 metadata), and
      `kotlinOptions.jvmTarget` → `compilerOptions {}` in `mobile/android/app/build.gradle.kts`.
- [ ] Run `flutterfire configure` (AWA project, Android) to replace the **local, gitignored**
      `firebase_options.dart` (I generated a throwaway one from `web/.env` to run on the emulator).
- [ ] `flutter run` on a phone; then tests M1–M13.
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

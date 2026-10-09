# AWA — Handoff doc (for a new model / new session)

Read this top to bottom, then continue work. Last updated: **Oct 8, 2026 (audit fixes, extras, and cleanup — committed)**.

---

## 1. What this project is

**AWA** is an accessibility-first web + mobile portal built on Firebase, for a final/capstone project.
The "topic" (the actual subject matter, e.g. Barangay Health Portal) is revealed on **Oct 10**; until then
the app is topic-agnostic scaffolding with a demo CRUD module. Everything is designed so the topic can be
plugged in by editing ONE config file (`web/src/config/appConfig.js`) and adding `modules/<entity>/` folders.

Solo project. Free Firebase Spark plan. No server code (that's a deliberate, documented limitation).

## 2. Stack

| Layer | Tech | Versions (installed) |
|---|---|---|
| Web | React + Vite + Tailwind | React 19, Vite 6, Tailwind 4, react-router-dom 7 |
| Backend | Firebase Auth + Firestore (+ Hosting) | firebase 12 (Spark/free plan) |
| Web features | face-api, WebAuthn, TOTP, QR, Web Speech | @vladmandic/face-api 1.7.15, otpauth 9.3, html5-qrcode 2.3.8, qrcode.react 4.1 |
| Mobile | Flutter (Android first) | Flutter 3.35.5 / Dart 3.9.2 |
| Tooling | Node, ESLint 9 + jsx-a11y | Node 24, npm 11 |

## 3. Repo layout

```
FinalProject_AWA/
├── web/               React app — run everything web from in here
│   ├── src/
│   │   ├── config/    firebase.js, appConfig.js  ← THE file to edit on reveal day
│   │   ├── core/      topic-agnostic: auth, security, qr, notifications, a11y, crud, ui, layout, guards
│   │   ├── adapters/  smsService, paymentService, aiService, speechService (simulated now, real later)
│   │   ├── modules/   topic stuff. Only demo/ (Items CRUD kit example) until Oct 10
│   │   ├── pages/     one page per route (Login, Register, Dashboard, Security, Users, ...)
│   │   └── routes/AppRoutes.jsx
│   ├── firestore.rules   the REAL security layer (published to Firebase)
│   └── firebase.json     hosting config (public: dist)
├── mobile/            REAL Flutter project (flutter create'd Oct 7, 2026). Not committed yet.
├── mobile-src/        Source of truth for mobile lib/ + README. Copy INTO mobile/ AFTER flutter create.
├── docs/              PROJECT-BRIEF, blueprint + todo, test guide, security explained, HANDOFF (this file)
└── .gitignore
```

**Invariant: `core/` never imports from `modules/`.** Topic code lives only in `modules/`.

## 4. Current state (as of Oct 8, 2026, after audit + fixes)

**Done and committed (7 commits on master, no remote):**
- Web v3 complete: design system + dark/high-contrast tokens, accessible UI kit, app shell,
  all pages, config-driven CRUD kit (`core/crud/CrudPage.jsx`).
- P1 security: email verification enforced, TOTP 2FA + hashed recovery codes, QR gen/scan,
  face recognition (descriptors only), WebAuthn biometrics, verification fallback chain, notifications.
- Security extras: login limiter (5 tries, escalating lock 2/4/8 min), idle auto-logout (13/15 min),
  login history, trusted devices, re-verify page.
- P4 extras (all simulated): wallet + QR payments, SMS outbox, AI helper (demo replies), check-in + ID card,
  voice input, read-aloud (TTS), CSV/print reports.
- **Oct 7 audit fixes** (`0486d21`): recovery codes burn in a `runTransaction`; wallet transfer is one
  atomic `writeBatch`; null guards on missing 2FA doc; fail-closed on profile-load error; AI history
  client-sorted (no composite index); limiter no longer resets + escalates; face re-enroll replaces +
  testFace checks all; face-check rows filtered from Recent logins; 44px targets; IdleGuard tokens.
- **Oct 7 features** (`6a68fec`): zero-dep `BarChart` + dashboard 7-day chart + staff system stats;
  announcement edit (admin-only); first-login forced change-password (`mustChangePassword` flag +
  `/change-password` gate); PWA (manifest + icon + meta; service worker + PNG icons added Oct 8); TTS stop toggle +
  rate slider + read-page button in topbar; voice input in announcements/SMS/wallet/check-in;
  pagination in CRUD kit + audit log + my activity; `2fa_failed` audit trail; staff notify-user +
  users search/CSV; liveness-lite (two frames 1s apart, movement check).
- Mobile (`3d9dafe`, `7349049`): `mobile/` scaffolded from `mobile-src/lib`, deps + 3 Android edits,
  unhandled-async guards, `AppConfig.appName` used everywhere. `flutter analyze`: only the 2 expected
  `firebase_options.dart` errors remain.
- Lint: **0 errors / 0 warnings**. Build: success.
- **Oct 8:** all 26 lint warnings fixed (0 errors / 0 warnings, build clean) + the 4 remaining
  docs written (ERD, user manual, a11y statement, defense notes).

**Oct 8 — audit fixes, extensions, and cleanup (committed):**
- **Rules fixed:** `ai_chats` read used `request.resource` on a read (blocked history) — now keyed
  on `resource`; added `public_profiles` (safe uid/name/email mirror, readable by any signed-in
  user) and `support_requests`; `wallets` now allow credit-only cross-user writes so a normal user
  can send a simulated payment. `transactions` create is scoped to the owner/sender.
- **Wallet:** recipient list reads `public_profiles` (the old `users` query was denied for normal
  users); errors are surfaced; added **scan-to-pay QR** (encode/parse in `core/qr/paymentQR.js`,
  plus a "my receive code").
- **Fallback chain is now functional + honest:** "Ask staff for help" files a real support request
  (`core/support/supportService.js`), staff resolve them at `/admin/support` (new nav + route).
- **2FA fails closed:** `AuthProvider.securityError` + `ProtectedRoute` locked screen if the
  `totp/{uid}` read fails (previously it silently disabled 2FA).
- **PWA install:** `public/sw.js` (registered in `main.jsx`, production only) + real PNG icons
  (`icon-192.png`, `icon-512.png`) + updated `manifest.json` / `index.html`.
- **Deferred extras:** voice commands (`core/a11y/voiceCommands.js` + topbar mic), minimal **i18n**
  (`core/i18n/`, English + Filipino, toggle in topbar + `/accessibility`), scan-to-pay QR.
- **Mobile parity** (edit `mobile-src/lib`, then copy to `mobile/lib`): register, forgot password,
  forced first-login change, login lockout (**persisted on device**), idle logout (**now applied
  above the Navigator, so it covers every screen**), contrast/reduce-motion/dyslexia prefs, wallet
  with **scan-to-pay + QR pay/receive** (`core/payment_qr.dart`, `qr_flutter`), check-in,
  announcements, mark-all-read, transactional recovery-code burn, 2fa_failed log, show/hide password
  toggles. Android: added the **`INTERNET` permission for release builds**, app label is now "AWA".
  `flutter analyze`: only the 2 expected `firebase_options.dart` errors.
- Web lint 0/0; web build succeeds.
- **Cleanup:** removed dead code (`core/ui/Toast.jsx` + its provider mount, `core/ui/IconButton.jsx`,
  `getFaceChecks`) and the redundant `modules/.gitkeep`; `.gitignore` covers build output. Docs
  refreshed for the new collections and to drop the stale "toasts"/"PWA-lite"/"26 warnings" claims.

**Oct 9 — mobile emulator test pass:**
- Got the mobile app **building and running on an Android 15 emulator**. Two real build blockers
  fixed: Kotlin Gradle plugin `2.1.0` → **`2.3.0`** (`mobile/android/settings.gradle.kts`; the new
  `firebase_auth` pulls Kotlin 2.3.0 metadata) and `kotlinOptions.jvmTarget` → `compilerOptions {}`
  (`mobile/android/app/build.gradle.kts`). Also restored a broken `firebase_options.dart` import in
  `main.dart`. A **local, gitignored** `lib/firebase_options.dart` was generated from `web/.env` to
  run it; the real one still needs `firebase login` + `flutterfire configure`.
- Hand-tested on the emulator: launch + Firebase init, login, wrong-password error, login lockout
  (**persists across a full app restart**), forgot-password, register + change-password validation,
  Settings (large text + dark mode apply instantly), Home name/role, QR typed fallback, logout +
  theme reset. All pass.
- **Findings:** Wallet/Check-in/Announcements first failed with `cloud_firestore/permission-denied`
  — root cause was **not code**: the deployed rules were still the old "starting point" (`9c23030`).
  After **publishing `web/firestore.rules`**, re-tested: wallet auto-created (500) and top-up worked
  (500 → 600), check-in recorded, announcements load. All green. (User-to-user transfer still needs a
  2nd account.)
- Not testable on the emulator: M1/M3/M4/M5 (need a real account + biometrics), M7/M8/M11 (need the
  web side), camera scan (needs a physical device). A benign Android "16 KB page-size" dialog shows
  on first launch (API 36 emulator; prebuilt `.so`s aren't 16 KB aligned).
- **Mobile UI refresh (Oct 9):** added `mobile-src/lib/ui/` — `awa_theme.dart` (brand theme, one blue
  seed `#1D4ED8` matching the web, global rounded inputs/cards/buttons) and `awa_widgets.dart`
  (`AwaCard`, `AwaSectionTitle`, `EmptyState`, `InlineMessage`, `AvatarChip`, `AwaLogoMark`, `AwaIntro`,
  `CenteredScroll`). All 15 screens restyled (logic unchanged); `main.dart` now builds the theme via
  `AwaTheme.build`. `flutter analyze` clean, debug APK builds, and login/register/home/wallet/check-in/
  settings verified on the emulator — including dark, high-contrast, large-text and dyslexia modes.

**NOT done (in order):**
1. Commit the working copy (web + mobile + docs + the Android Kotlin build fix).
2. `firebase login` + `flutterfire configure` in `mobile/` to replace the local throwaway
   `firebase_options.dart`.
3. Run the live web test pass (T1–T95 + the remaining M tests) and deploy. (`web/firestore.rules`
   is now published — mobile wallet/check-in/announcements verified working Oct 9.)
4. Reveal day (Oct 10): fill feature map, create `modules/<entity>/` per topic entity.
5. Mobile-only gaps + skipped features (see TODO.md §6).

## 5. Run commands

**Web (from `web/`):**
```
npm install          # already done
npm run dev          # dev server (localhost:5173)
npm run lint         # eslint src — currently 0 errors
npm run build        # production build to dist/
npm run deploy       # build + firebase deploy (needs firebase login)
```
`web/.env` is populated from the Firebase console. Restart `npm run dev` after editing it.

**Mobile (from repo root, then `mobile/`):**
```
flutter create --org com.awa --project-name awa_mobile mobile   # DONE Oct 7
# copy mobile-src/lib/* over mobile/lib/                         # DONE
dart pub global activate flutterfire_cli                         # DONE
cd mobile && flutterfire configure                               # TODO — needs firebase login
flutter run                                                      # TODO — needs a phone/emulator
```
All 3 Android edits are already applied. No Android device was connected on Oct 7 (only Windows/Chrome/Edge).

**First admin:** register on web, then in Firestore > users > your doc, set `role` to `admin`
(console access bypasses the security rules).

## 6. Conventions & invariants (do not break these)

- Roles are level numbers: `user(1) < staff(2) < admin(3)`. Check with `hasRole(role, minRole)` from `appConfig.js`. Higher does everything lower can.
- React components: `PascalCase.jsx`. Services and hooks: `camelCase.js`. Dart files: `snake_case.dart`.
- Firestore collections: lowercase plural (`users`, `logs`, ...). Fields: `camelCase`. Log actions: `snake_case` (`items_create`).
- All collection names come from `COLLECTIONS` in `appConfig.js` — never hardcode a collection name.
- Navigation lives in `NAV` in `appConfig.js` (single source for sidebar + dashboard quick actions).
- New topic collection = copy the `items` block in `firestore.rules` + a config for `CrudPage.jsx`.
- Accessibility is a requirement, not polish: semantic HTML, labels, 44px targets, aria-live status messages,
  focus ring, skip link, every verification method has a fallback. WCAG 2.1 AA target (Lighthouse 90+).

## 7. Data model (Firestore)

| Collection | Fields |
|---|---|
| `users/{uid}` | email, name, role, active, prefs{textSize, dark, contrast, reduceMotion, dyslexia}, createdAt |
| `public_profiles/{uid}` | uid, name, email (safe mirror any signed-in user can read — wallet recipients) |
| `support_requests/{auto}` | uid, name, email, reason, note, status, createdAt (+ resolvedBy/resolvedAt) |
| `logs/{auto}` | uid, action, details, createdAt |
| `notifications/{auto}` | userId, title, message, read, createdAt |
| `totp/{uid}` | secret, enabled, recovery[] (SHA-256 hashes only), createdAt |
| `sms_outbox/{auto}` | to, message, status, createdAt |
| `announcements/{auto}` | title, body, createdAt (staff/admin post) |
| `login_history/{auto}` | uid, ... |
| `trusted_devices/{auto}`, `webauthn_credentials/{auto}`, `face_descriptors/{auto}` | owner-only rows |
| `wallets/{uid}`, `transactions/{auto}` | simulated balance + ledger |
| `checkins/{auto}`, `ai_chats/{auto}` | simulated |
| `items/{auto}` (demo) | name, category, quantity, notes, createdBy, createdAt, updatedAt |

Topic collections get added Oct 10 (before any topic code).

## 8. Key files map (where things live)

| Feature | File(s) |
|---|---|
| Auth state + role + 2FA flag | `web/src/core/auth/AuthProvider.jsx` |
| Route guards (order matters: loading → login → deactivated → unverified → 2FA → role) | `web/src/core/guards/ProtectedRoute.jsx` |
| TOTP setup + recovery codes | `web/src/core/security/totpService.js`, `pages/Security.jsx`, `pages/TwoFactorVerify.jsx` |
| Face recognition / WebAuthn / fallback chain | `web/src/core/security/` (faceService, FaceCapture, webauthnService, VerificationFallback) |
| Login limiter / idle logout | `web/src/core/security/loginLimiter.js`, `IdleGuard.jsx` (times in `appConfig.js`) |
| Notifications | `web/src/core/notifications/` (service + hook), bell in `core/layout/Topbar.jsx` |
| Read-aloud / voice input | `web/src/core/a11y/ReadAloud.jsx`, `VoiceInput.jsx` |
| Accessibility settings | `web/src/pages/Accessibility.jsx` + `core/a11y/A11yProvider.jsx` (saved to `users/{uid}.prefs`) |
| CRUD kit | `web/src/core/crud/CrudPage.jsx` + `useCollection.js`; example config `modules/demo/itemsConfig.js` |
| Simulated services | `web/src/adapters/` (sms, payment, ai, speech) |
| Firestore rules | `web/firestore.rules` (must be re-published after changes) |
| Mobile gate / 2FA / biometrics | `mobile-src/lib/screens/auth_gate.dart`, `two_factor_screen.dart`, `core/biometric_service.dart` |

## 9. Security model in one paragraph

`firestore.rules` is the only truly trustworthy layer (runs on Firebase servers for every read/write).
Everything in React is convenience: `AuthProvider` loads user + role + 2FA flag; `ProtectedRoute` gates pages
in a fixed order. 2FA is verified client-side (no server on Spark — known, documented limit). Recovery codes
are stored as SHA-256 hashes. Login lockout + idle logout are browser-side. Deactivation applies on next
load/login. Full plain-language explanations: `docs/AWA-security-explained.md`.

## 10. Testing

- Web tests: `docs/AWA-test-guide.md` (T1–T95 web, M1–M13 mobile). **None have been run live yet** —
  the biggest open item before reveal day. T86–T95 cover the Oct 7 features. Part E has the bug-report
  template. **Mobile was partially hand-tested on an emulator Oct 9** (see §4): startup/auth/settings/
  QR/lockout/logout pass, and Wallet/Check-in/Announcements pass after publishing the rules.
- Lint: `npm run lint` → **0 errors, 0 warnings** (Oct 8: all 26 fixed — render-phase adjustments
  instead of set-state-in-effect, `'` entities, `alive` flags on async effects, extracted
  fetch helpers for purity).
- Failed password logins are NOT audit-logged (the rules require a signed-in uid to write to `logs`;
  anonymous writes would be spam-able). Failed 2FA attempts ARE logged (`2fa_failed`) — the user is
  signed in at that point.
- No unit test runner on the web side (test guide is manual). Mobile has a placeholder smoke test.

## 11. Gotchas (learned the hard way)

1. **StrictMode is intentionally removed** in `web/src/main.jsx` — in dev it double-runs effects and makes
   the QR scanner start two cameras on one element. Don't re-add it.
2. `.env` values are required; restart `npm run dev` after editing it.
3. After changing `firestore.rules`, re-paste/publish in the console (or `firebase deploy --only firestore:rules`).
4. Dark mode is a color-override approach — a few screens may need touch-ups (state as known limit).
5. TOTP codes always wrong → phone clock off (turn on automatic time).
6. Camera/WebAuthn need HTTPS or localhost — test QR camera on the deployed URL, not laptop-localhost-from-phone.
7. Windows + Flutter: `flutter pub add` prints a symlink warning — enable Developer Mode
   (`start ms-settings:developers`) before building plugins. Doesn't block `pub add`.
8. local_auth needs: `minSdk = 23`, `USE_BIOMETRIC` permission, `FlutterFragmentActivity` (all applied Oct 7).
9. Mobile **has** register, persisted login lockout, idle logout (all screens) and forgot-password
   (verified on the emulator Oct 9). Still mobile-only gaps: Google sign-in, WebAuthn/face, 2FA
   enable/disable, profile edit, admin screens, TTS.
10. Firebase CLI on this machine is installed but **not logged in**; `flutterfire` CLI is installed globally.
11. **Mobile won't build on the old Kotlin plugin.** `firebase_auth` (6.7.0) pulls Kotlin 2.3.0
    metadata, so `mobile/android/settings.gradle.kts` must use `org.jetbrains.kotlin.android` **2.3.0**
    (not 2.1.0), and the app module must use the `kotlin { compilerOptions { jvmTarget = … } }` DSL
    (the old `kotlinOptions { jvmTarget = "11" }` is an error on Kotlin 2.3). Verify with
    `flutter build apk --debug` then `flutter run`.

## 12. Next steps (prioritized)

1. **Commit the working copy:** rules + new web services/pages (public_profiles, support requests,
   payment QR, i18n, voice commands, PWA), mobile parity, and docs. See `TODO.md` §1.
2. **Finish mobile setup:** `firebase login`, then in `mobile/`: `flutterfire configure` (pick the AWA
   Firebase project, Android only), then `flutter run` on a phone. Then test guide Part C (M1–M13).
3. **Publish rules + Web live test + deploy:** re-publish `web/firestore.rules`, test guide T1–T95
   (Parts A–B13), `npm run deploy`, then T66–T71 on the live URL.
4. **Reveal day (Oct 10):** fill the feature map in `docs/AWA-blueprint-and-todo.md` §4, create one
   `modules/<entity>/` folder per topic entity, apply the CRUD kit, copy the rules block per collection.
5. Still optional: mobile-only gaps (Google sign-in, WebAuthn/face, 2FA enable, profile edit, admin
   screens, TTS) and skipped features. Cut order if time slips: P4 extras → P3 → P2 polish.
   P1 + auth + roles + rules never get cut.

## 13. Dates

- Health break: Oct 7–9 · Dev window: Oct 10–29 · **Submit Oct 28 (real deadline)**

## 14. How to hand off to the next model

1. Read this file, `docs/PROJECT-BRIEF.md`, and `docs/AWA-blueprint-and-todo.md` §2.
2. Check `git log --oneline -5` and `git status` for what changed since this doc.
3. Update §4 (current state) and §12 (next steps) of THIS file at the end of every working session —
   that's what makes the next handoff cheap. Keep it short; details belong in the other docs.

# AWA project brief (workflow steps 1 and 2)

## Step 1: brief
- **Stack:** React + Vite + Tailwind, Firebase Auth + Firestore (free Spark plan), Flutter mobile app, Firebase Hosting
- **Roles:** `user` (1), `staff` (2), `admin` (3). Higher number can do everything lower can.
- **Naming**
  - React components: `PascalCase.jsx`. Services and hooks: `camelCase.js`
  - Firestore collections: lowercase plural. Fields: `camelCase`
  - Log actions: `snake_case` like `items_create`
  - Dart files: `snake_case.dart`
- **Rule:** `core/` never imports from `modules/`. Topic stuff lives only in `modules/`.

## Step 2: schema (locked)

| Collection | Fields | Status |
|---|---|---|
| `users/{uid}` | email, name, role, active, prefs{textSize, dark, contrast, reduceMotion, dyslexia}, createdAt | built |
| `logs/{auto}` | uid, action, details, createdAt | built |
| `notifications/{auto}` | userId, title, message, read, createdAt | built |
| `totp/{uid}` | secret, enabled, recovery[] (hashes), createdAt | built |
| `sms_outbox/{auto}` | to, message, status, createdAt | built (simulated) |
| `items/{auto}` (demo only) | name, category, quantity, notes, createdBy, createdAt, updatedAt | built |
| `announcements/{auto}` | title, body, createdAt | built |
| `trusted_devices/{auto}`, `login_history/{auto}` | owner-only rows | built |
| `webauthn_credentials/{auto}`, `face_descriptors/{auto}` | owner-only, descriptors not photos | built |
| `wallets/{uid}`, `transactions/{auto}` | simulated balance + ledger | built (simulated) |
| `checkins/{auto}`, `ai_chats/{auto}` | check-in rows, chat history | built (simulated) |

Planned, not built yet: topic collections (decided on reveal day, before any topic code).

## Build order (steps 3 to 6)

| Step | What | Status (Oct 8, 2026) |
|---|---|---|
| 3.1 | Early bare-bones deploy | superseded — full app built first |
| 3.2 | **User slice**: register, verify, login, 2FA, notifications, accessibility | code done, NOT live-tested (T1–T65) |
| 3.3 | **Staff slice:** items CRUD, user list, audit log | code done |
| 3.4 | **Admin slice:** role changes, deactivate | code done |
| 4 | One feature per request: face, biometrics, wallet, SMS, AI | done (face/biometrics/wallet/SMS/AI built) |
| 5 | Mobile app | scaffolded Oct 7 (`mobile/` created, deps + Android edits applied); remaining: `flutterfire configure` (needs `firebase login`) + on-device run/tests (M1–M13) |
| 6 | Reveal day: static page skeletons per entity first, then logic, one role at a time | Oct 10 |

## Current snapshot (Oct 8, 2026)

- Web v3 fully built (design system, all pages, P1 security, P4 simulated extras), plus the Oct 8
  audit fixes (rules, wallet, fallback chain, PWA service worker, i18n, voice commands) and cleanup.
  Lint: 0 errors / 0 warnings. Build: success.
- Mobile `mobile/` scaffolded from `mobile-src/lib` and extended to parity (register, forgot password,
  lockout, idle logout, prefs, wallet, check-in, announcements); `firebase_options.dart` still needs
  `flutterfire configure`.
- Not done: live test pass (docs/AWA-test-guide.md T1–T95), publish rules + deploy to Hosting,
  topic modules (Oct 10).
- Full current state + next steps: `docs/HANDOFF.md`.

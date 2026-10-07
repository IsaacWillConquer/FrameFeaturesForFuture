# AWA — Handoff doc (for a new model / new session)

Read this top to bottom, then continue work. Last updated: **Oct 7, 2026** (health break).

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

## 4. Current state (as of Oct 7, 2026)

**Done and committed (2 commits on master, no remote):**
- Web v3 complete: design system + dark/high-contrast tokens, accessible UI kit, app shell
  (sidebar/topbar per role), all pages, config-driven CRUD kit (`core/crud/CrudPage.jsx`).
- P1 security: email verification enforced, TOTP 2FA + hashed recovery codes, QR gen/scan,
  face recognition (descriptors only), WebAuthn biometrics, verification fallback chain, notifications.
- Security extras: login limiter (5 tries → 2 min lock), idle auto-logout (warn 13 / logout 15 min),
  login history, trusted devices, re-verify for sensitive actions.
- P4 extras (all simulated): wallet + QR payments, SMS outbox, AI helper (demo replies), check-in + ID card,
  voice input, read-aloud (TTS), CSV/print reports.
- Lint: **0 errors** (23 warnings, all non-blocking — see §11). Build: success.

**Done today (Oct 7), NOT yet committed:**
- Scaffolded the real `mobile/` Flutter project (`flutter create --org com.awa --project-name awa_mobile mobile`).
- Copied `mobile-src/lib/` → `mobile/lib/`, added deps (`firebase_core firebase_auth cloud_firestore
  local_auth mobile_scanner otp crypto`), applied all 3 Android edits (minSdk 23, USE_BIOMETRIC,
  FlutterFragmentActivity), replaced the default `widget_test.dart`.
- `flutter analyze`: only 2 errors remain — the missing `firebase_options.dart` (needs step below).

**NOT done (in order):**
1. `firebase login` + `flutterfire configure` in `mobile/` (generates `firebase_options.dart`,
   registers the Android app in the Firebase console). **Blocked: needs the user's Firebase login.**
2. Run web test guide Parts A/B (T1–T71) against the real Firebase project, then deploy to Hosting.
3. Reveal day (Oct 10): fill feature map, create `modules/<entity>/` per topic entity.
4. Optional cleanup: 23 lint warnings. Remaining docs: ERD, user manual, a11y statement, defense notes.

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
- Accessibility is a requirement, not polish: semantic HTML, labels, 44px targets, aria-live toasts,
  focus ring, skip link, every verification method has a fallback. WCAG 2.1 AA target (Lighthouse 90+).

## 7. Data model (Firestore)

| Collection | Fields |
|---|---|
| `users/{uid}` | email, name, role, active, prefs{textSize, dark, contrast, reduceMotion, dyslexia}, createdAt |
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

- Web tests: `docs/AWA-test-guide.md` (T1–T71 web, M1–M13 mobile). **None have been run yet** — that's the
  biggest open item before reveal day. Part E has the bug-report template.
- Lint: `npm run lint` → 0 errors, 23 warnings (react-hooks `set-state-in-effect` in ~10 components,
  `purity` in IdleGuard, unescaped `'` entities, 2 exhaustive-deps). All non-blocking; fix only if asked.
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
9. Mobile login lockout / idle logout / register / forgot-password are web-only for now (see mobile README).
10. Firebase CLI on this machine is installed but **not logged in**; `flutterfire` CLI is installed globally.

## 12. Next steps (prioritized)

1. **Finish mobile setup:** `firebase login`, then in `mobile/`: `flutterfire configure` (pick the AWA
   Firebase project, Android only), then `flutter run` on a phone. Then test guide Part C (M1–M13).
2. **Web live test + deploy:** test guide Parts A/B (T1–T71), `npm run deploy`, then T66–T71 on the live URL.
3. **Reveal day (Oct 10):** fill the feature map in `docs/AWA-blueprint-and-todo.md` §4, create one
   `modules/<entity>/` folder per topic entity, apply the CRUD kit, copy the rules block per collection.
4. Then per request: face/liveness polish, login UX, docs (ERD, user manual, a11y statement, defense notes).
5. Cut order if time slips: P4 extras → P3 → P2 polish. P1 + auth + roles + rules never get cut.

## 13. Dates

- Health break: Oct 7–9 · Dev window: Oct 10–29 · **Submit Oct 28 (real deadline)**

## 14. How to hand off to the next model

1. Read this file, `docs/PROJECT-BRIEF.md`, and `docs/AWA-blueprint-and-todo.md` §2.
2. Check `git log --oneline -5` and `git status` for what changed since this doc.
3. Update §4 (current state) and §12 (next steps) of THIS file at the end of every working session —
   that's what makes the next handoff cheap. Keep it short; details belong in the other docs.

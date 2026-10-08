# AWA web

1. `npm install`
2. Copy `.env.example` to `.env` and fill in your Firebase web app config
3. Firebase console: turn on Authentication (Email/Password + Google) and Firestore
4. `npm run dev`
5. Paste `firestore.rules` into Firestore > Rules (or `firebase deploy --only firestore:rules`)
6. First admin: register, then in Firestore > users > your doc, change `role` to `admin`

Folders: `core/` = topic-agnostic (never import from `modules/`), `modules/` = topic stuff
(`demo/` holds the CRUD kit example until reveal day), `adapters/` = fake-now / real-later
services, `config/appConfig.js` = roles, collection names, and navigation.

## v2 additions
- 2FA (authenticator app) at /security, check at /2fa. Secrets live in `totp/{uid}` (owner-only in the rules). Checked in the browser: known limitation.
- Notifications: bell count in the navbar, page at /notifications ("Send test to myself" button to try it).
- QR: /qr-demo makes and scans QR codes (camera needs HTTPS or localhost; typing the code always works).
- Read aloud buttons use the browser's text-to-speech.
- `npm run deploy` builds and runs `firebase deploy`. Re-paste `firestore.rules` after pulling v2 (new `totp` rules).

## v3 additions
- Config-driven CRUD kit: `core/crud/CrudPage.jsx` + a config file (see `modules/demo/itemsConfig.js`, route /items). Copy the `items` block in `firestore.rules` for each new collection.
- Admin: /admin/users (staff view, admin edits roles/deactivates), /admin/logs (audit log, last 100). Deactivated accounts get blocked.
- /activity = your own login history. Login form locks for 2 min after 5 wrong passwords (browser-side). Auto logout after 15 min idle (warning at 13; times in appConfig.js).
- /accessibility: text size, dark mode, high contrast, reduce motion, dyslexia spacing. Saved on the account (`users/{uid}.prefs`) so mobile can read it later.
- Re-paste `firestore.rules` again (new `items` block, own-log read).

## v4 additions (P1 security + P4 extras)
- **Biometrics (WebAuthn)** at /biometrics: platform-authenticator check, register/verify. Credential ids in `webauthn_credentials/{uid}` (owner-only). Needs HTTPS or localhost.
- **Face recognition** at /biometrics: face-api.js, stores **descriptors only, never photos** in `face_descriptors/{uid}`.
- **Verification fallback chain** (`core/security/VerificationFallback.jsx`): face → biometric → TOTP → typed, so no method can lock someone out. Used at /verify-identity for re-verification of sensitive actions.
- **Devices & history** at /devices: trusted devices list + login history (`trusted_devices`, `login_history`).
- **Wallet + QR payment (simulated)** at /wallet: fake balance in `wallets/{uid}`, ledger in `transactions`, pay to another user by picking them. `adapters/paymentService.js`.
- **SMS outbox (simulated)** at /admin/sms (staff+): saves to `sms_outbox`, no real provider. `adapters/smsService.js`.
- **AI helper (simulated)** at /ai: demo replies; set `VITE_AI_ENDPOINT` to go live (never put a provider key in the browser). `adapters/aiService.js`.
- **Check-in + ID card** at /check-in: check-in rows in `checkins`, printable ID card.
- **Voice input** (`core/a11y/VoiceInput.jsx`): speech-to-text for forms (Chrome/Edge only, needs HTTPS).
- **CSV/print reports**: export buttons on the tables.

## v4.1 additions (Oct 7: audit fixes + features)
- Fixed: atomic recovery-code burn (`runTransaction`), atomic wallet transfer (`writeBatch`), fail-closed on profile-load error, limiter escalates (2/4/8 min), face re-enroll replaces, 44px targets, 2fa_failed audit trail.
- New: dashboard **charts + staff system stats** (zero-dep `core/ui/BarChart.jsx`), announcement **edit** (admin), **first-login forced change-password** (`/change-password`, `mustChangePassword` flag), **PWA** (`public/manifest.json` + PNG icons; service worker + icons added Oct 8), TTS **stop toggle + speed slider + read-page button** (topbar), **voice input** in announcements/SMS/wallet/check-in, **pagination** (CRUD kit, audit log, my activity), staff **notify-user** action + users search/CSV, **liveness-lite** (two frames, movement check).
- Failed password logins are not audit-logged (rules require a signed-in uid) — failed 2FA attempts are.

## v5 additions (Oct 8: audit fixes, extras, cleanup)
- **Rules fixed:** `ai_chats` read (AI history), wallet transfers (credit-only `walletCreditOk`),
  `transactions` create scoped. New `public_profiles` (wallet recipients) and `support_requests`.
- **Wallet** now lists recipients from `public_profiles`, surfaces errors, and has **scan-to-pay QR**
  (`core/qr/paymentQR.js`) plus a "my receive code".
- **Fallback chain is functional:** "Ask staff for help" files a real support request; staff resolve
  at `/admin/support`. 2FA status now **fails closed**.
- **Extras:** **voice commands** (`core/a11y/voiceCommands.js` + topbar mic), **i18n** (English +
  Filipino; toggle in the topbar and `/accessibility`), **PWA service worker** + real PNG icons.
- **Cleanup:** removed `core/ui/Toast.jsx`, `core/ui/IconButton.jsx`, and `getFaceChecks` (all dead).
  Status messages rely on `Alert` ARIA live regions.

## Status (Oct 8, 2026)
Lint: 0 errors / 0 warnings. Build: success. Not yet live-tested against a real Firebase project
(see docs/AWA-test-guide.md, T1–T95) and not yet deployed.

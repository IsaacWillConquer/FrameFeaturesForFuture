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

## Status (Oct 7, 2026)
Lint: 0 errors (23 non-blocking warnings). Build: success. Not yet live-tested against a real
Firebase project (see docs/AWA-test-guide.md) and not yet deployed.

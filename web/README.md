# AWA web

1. `npm install`
2. Copy `.env.example` to `.env` and fill in your Firebase web app config
3. Firebase console: turn on Authentication (Email/Password + Google) and Firestore
4. `npm run dev`
5. Paste `firestore.rules` into Firestore > Rules (or `firebase deploy --only firestore:rules`)
6. First admin: register, then in Firestore > users > your doc, change `role` to `admin`

Folders: `core/` = topic-agnostic (never import from `modules/`), `modules/` = topic stuff (empty until reveal),
`adapters/` = fake-now / real-later services, `config/appConfig.js` = roles and collection names.

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

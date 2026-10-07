# AWA project

**Accessibility-first web + mobile portal on Firebase.** Topic-agnostic scaffolding until reveal day
(Oct 10); the topic plugs in via one config file. Submit: **Oct 28**.

```
FinalProject_AWA/
├── web/          React app (run everything web from in here)
├── mobile/       REAL Flutter project (flutter create'd Oct 7 — commit pending)
├── mobile-src/   Flutter source of truth: lib/ + README. Copy into mobile/ AFTER flutter create
├── docs/         PROJECT-BRIEF, blueprint + todo, test guide, security explained, HANDOFF
└── .gitignore
```

**New to the project (or a new model session)?** Start with `docs/HANDOFF.md` — it has the current
state, run commands, conventions, gotchas, and next steps in one place.

## Status (Oct 7, 2026)

- **Web v3 built and committed:** design system, app shell, all pages, CRUD kit, P1 security
  (email verification, 2FA, QR, face, biometrics, fallback chain, notifications) and P4 extras
  (wallet, SMS, AI, check-in, voice). Lint: 0 errors. Build: success.
- **Mobile scaffolded Oct 7:** `mobile/` created from `mobile-src/lib`, deps added, all 3 Android
  edits applied. Remaining: `firebase login` + `flutterfire configure` (needs your Firebase login),
  then `flutter run` on a phone.
- **Not done:** live test pass (T1–T71), deploy to Hosting, topic modules (Oct 10).

## Start here (in this order)

1. **Firebase:** make a project, turn on Email/Password + Google auth and Firestore. Paste
   `web/firestore.rules` in **Firestore Database > Rules** (not Realtime Database). Details:
   docs/AWA-test-guide.md Part A
2. **Web:** in `web/`: `npm install`, copy `.env.example` to `.env`, fill in the Firebase config,
   `npm run dev`
3. **Test the web app** (test IDs in docs/AWA-test-guide.md: T1–T71), then deploy (Part B11 — needed
   for the QR camera and WebAuthn, which require HTTPS)
4. **Phone:** `mobile/` is scaffolded — finish setup with `mobile-src/README.md` steps 4–7
   (`flutterfire configure` needs `firebase login`), then test Part C (M1–M13)
5. **Oct 10 (reveal day):** fill the feature map in docs/AWA-blueprint-and-todo.md §4, then build
   topic modules in `web/src/modules/` (one folder per entity) and copy the `items` rules block
   per new collection

Read docs/PROJECT-BRIEF.md for the roles, naming rules, schema, and build order.

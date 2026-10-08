# TODO — pick up here

**Where I left off (Oct 7):** all audit fixes + features are built and committed (6 commits, see
`git log --oneline`). Nothing live-tested or deployed yet. Full context: `docs/HANDOFF.md`.

**Oct 8 update:** the 26 lint warnings are FIXED (0 errors / 0 warnings, build clean) and the 4
remaining docs (ERD, user manual, a11y statement, defense notes) are written — both are in the
working copy, **NOT committed yet**. Everything else below is still open.

## 1. Admin account (5 min)
- [ ] Register at http://localhost:5173/register with a real email (Gmail alias trick: `you+admin@gmail.com`)
      — this doubles as tests T1–T4
- [ ] Click the verification link in the email, return, press "I verified my email"
- [ ] Firebase console → Firestore → `users` → your doc → edit `role` → `admin`
      (rules block self-promotion, so this MUST be done in the console)
- [ ] Log out + log back in (role loads at login/refresh)

## 2. Live test pass — web (biggest open item)
- [ ] `npm run dev` in `web/` (dev server is NOT running when you come back), open in Chrome, F12 → Console
- [ ] Firebase console pre-check: Email/Password + Google auth on, Firestore created,
      `web/firestore.rules` pasted/published in Rules
- [ ] Run tests T1–T95 in `docs/AWA-test-guide.md` (B1–B3 first — if they fail, everything else depends on them)
- [ ] New features: T86–T95 (charts, first-login password, PWA, TTS, pagination, liveness, notify)
- [ ] Record failures with the Part E bug-report template, fix in one batch

## 3. Deploy (needed for QR camera + WebAuthn — they require HTTPS)
- [ ] `npm install -g firebase-tools` (already installed) → `firebase login`
- [ ] In `web/`: `firebase use --add`, then `npm run deploy`
- [ ] Test on the live URL (T66–T70) + QR camera scan on your PHONE (T71)

## 4. Mobile (blocked on `firebase login`)
- [ ] `mobile/` is already scaffolded (deps + Android edits applied) — DON'T redo flutter create
- [ ] `firebase login`, then in `mobile/`: `flutterfire configure` (pick the AWA project, Android only)
      → creates `lib/firebase_options.dart`
- [ ] Plug in phone (USB debugging), `flutter run`
- [ ] Tests M1–M13 in `docs/AWA-test-guide.md` Part C

## 5. Reveal day (Oct 10) — topic modules (biggest share of the grade)
- [ ] List roles, entities, collections; fill the feature map in `docs/AWA-blueprint-and-todo.md` §4
- [ ] One `web/src/modules/<entity>/` folder per entity — reuse the CRUD kit
      (`core/crud/CrudPage.jsx` + a config file, see `modules/demo/itemsConfig.js`)
- [ ] Copy the `items` block in `web/firestore.rules` for each new collection
- [ ] Edit `web/src/config/appConfig.js` (app name, collections, nav) — the ONE file to change

## 6. Optional / skipped (only if time)
- [ ] Voice commands, i18n, scan-to-pay QR (deliberately skipped — low grade value)
- [x] 26 non-blocking lint warnings — DONE Oct 8: 0 errors / 0 warnings (uncommitted)
- [x] Remaining docs — DONE Oct 8: `docs/AWA-ERD.md`, `docs/AWA-user-manual.md`,
      `docs/AWA-accessibility-statement.md`, `docs/AWA-defense-notes.md` (untracked — commit them)
- [ ] Mobile parity extras: register, forgot password, lockout, idle logout, contrast settings,
      wallet, check-ins, announcements (Oct 22-25 window)

## Dates
Health break Oct 7–9 · Dev window Oct 10–29 · **Submit Oct 28 (real deadline)**

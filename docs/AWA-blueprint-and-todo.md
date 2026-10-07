# Project AWA — Blueprint + Todo

**Stack:** React (Vite + Tailwind) · Firebase (Spark/free plan) · Flutter mobile app · web-hosted
**Dates:** Health break Oct 7-9 · Dev window Oct 10-29 · **Submit Oct 28 (real deadline)**
**Mode:** Solo-leaning · own new Firebase project · stay free · built to be reusable for capstone
**Stand-in reference until topic is revealed:** Barangay Health Portal (rebuilt in React)

> **Status snapshot (Oct 7, 2026):** Web v3 is fully built and committed (design system, app shell,
> all pages, CRUD kit, P1 security, P3 security extras, P4 simulated extras). Lint: 0 errors. Build: success.
> Mobile `mobile/` was scaffolded Oct 7 from `mobile-src/lib` (deps + all 3 Android edits applied);
> `flutterfire configure` still needs `firebase login`. **Nothing has been live-tested or deployed yet** —
> that is the biggest open item before reveal day. Full details: `docs/HANDOFF.md`.

---

## 1. Structure

```
FinalProject_AWA/
├── web/src/
│   ├── config/        firebase.js, appConfig.js (edit on reveal)
│   ├── core/          auth, security, qr, notifications, a11y, crud, ui, layout, guards
│   ├── adapters/      smsService, paymentService, aiService, speechService
│   ├── modules/       demo/ only until topic (one folder per entity)
│   ├── pages/  routes/
├── mobile/            REAL Flutter project (scaffolded Oct 7, commit pending)
├── mobile-src/        mobile lib/ source of truth + README
├── firebase/          firestore.rules lives in web/ (web/firestore.rules + firebase.json)
└── docs/              brief, blueprint + todo, test guide, security explained, HANDOFF
```

Rule: `core/` never imports from `modules/`.
Roles: Admin ⊃ Staff ⊃ User (checked by level number).

Fixed Firestore collections: `users`, `logs`, `notifications`, `announcements`, `sms_outbox`,
`totp`, `login_history`, `trusted_devices`, `webauthn_credentials`, `face_descriptors`, `wallets`,
`transactions`, `checkins`, `ai_chats`, plus demo `items`.
Topic collections are added on Oct 10.

---

## 2. Todo by date

### Wed Sep 30 — Setup
- [x] Create own Firebase project (Spark plan) — `.env` is populated
- [x] Turn on Auth (Email/Password, Google) + Firestore (test mode for now)
- [x] Add Web app, put config in `.env` (VITE_ variables)
- [ ] Check: does Storage ask for billing? Does AI Logic work on Spark?
- [x] Create repo, remove junk deps from friend's starter (`dom`, `router`, `react-helmet-async`)

### Thu Oct 1 — Restructure + a11y foundation
- [x] Move starter into `config/`, `core/`, `pages/`, `routes/`
- [x] AuthProvider returns user + role + emailVerified (+ 2FA flag)
- [x] ProtectedRoute with minRole (RoleRoute merged into it)
- [x] Fix Login.jsx (navigate during render), email input type
- [x] UI kit built accessible from day 1: semantic HTML, labels, focus ring, skip link, 44px targets, aria-live toasts

### Fri Oct 2 — Register / login done properly
- [x] Register creates Firestore `users/{uid}` doc with role
- [x] Email verification enforced before access
- [x] First-login change-password page (in Profile)
- [x] Forgot password + change password

### Sat Oct 3 — Shell + rules + deploy
- [x] Navbar/sidebar per role, empty dashboards
- [x] Logger helper writing to `logs`
- [x] Firestore security rules v1 (helper functions like `isRole()`)
- [ ] Deploy to Firebase Hosting (needed for camera/WebAuthn on HTTPS) — **still open**

### Sun Oct 4 — 2FA + notifications
- [x] TOTP 2FA (`otpauth`) + recovery codes (hashed)
- [x] Notifications: collection + bell icon + real-time
- [x] **Text-to-speech: read-aloud button (Web Speech API), first version**

### Mon Oct 5 — QR + Flutter
- [x] QRGenerator + QRScanner components (with type-the-code fallback)
- [x] Flutter project created (`mobile/` scaffolded Oct 7, was planned Oct 5), deps added, 3 Android edits applied
- [ ] Connected to same Firebase — **blocked: needs `firebase login` + `flutterfire configure`**

### Tue Oct 6 — Spike + buffer
- [ ] Flutter on real phone: login + biometric + QR scan
- [x] Accessibility settings page (text size, contrast, reduce motion, dyslexia)
- [x] Leftovers from earlier days

### Oct 7-9 — Health break
- [x] Oct 7: scaffolded `mobile/`, created `docs/HANDOFF.md`, refreshed docs
- [ ] Oct 7-9 (if energy allows): run the web test pass (Parts A/B) — no Firebase login needed to run locally

### Sat Oct 10 — Reveal day
- [ ] List roles, entities, collections
- [ ] Fill the feature map (below)
- [ ] Create one `modules/` folder per entity
- [ ] Milestones against Oct 28

### Oct 10-16 — Topic modules (biggest share of grade)
- [ ] Config-driven CRUD kit applied to each entity
- [ ] User management UI, audit log viewer, dashboard cards + charts
- [ ] Notification center page, announcements

### Oct 17-21 — Required security features + fallbacks
- [x] Biometrics (WebAuthn web, `local_auth` Flutter — code done, on-device test pending)
- [x] Face recognition (face-api.js, store descriptors not photos) + liveness-lite
- [x] Verification fallback chain wired up (face → biometric → TOTP → staff-assisted/typed)
- [x] Login limiter, idle auto-logout, login history, trusted devices
- [x] **Voice input: speech-to-text for search + forms, a few voice commands**
- [x] **Read-aloud extended to all pages + notifications**
- [ ] Lighthouse a11y audit (target 90+), keyboard-only pass — **needs live app**

### Oct 22-25 — Mobile + extras that still fit
- [x] Resident-side Flutter app (login, profile, main action, notifications, QR, biometric lock) — code done in mobile-src
- [ ] Quick unlock (biometric/PIN), email-link sign-in
- [x] Wallet + QR payment (simulated), SMS outbox (simulated), AI helper (demo replies; Gemini via Firebase AI Logic pending)
- [x] Check-in module, printable ID card

### Oct 26-28 — Finish
- [ ] Full testing, screen reader test (NVDA / TalkBack)
- [ ] Docs: ERD, feature map, test cases, user manual, accessibility statement, known limitations
- [ ] Video / defense prep
- [ ] **Submit Oct 28**

**Cut order if time slips:** P4 extras → P3 → P2 polish. P1 + auth + roles + rules never get cut.

---

## 3. Feature priorities

**P1 — Required by the sheet:** email verification, 2FA, QR code, face recognition, biometrics, notifications
**P2 — Core:** auth flows, role guards, user management, profile, audit log, CRUD kit, tables, toasts/dialogs, dark mode, real-time, charts, CSV/print reports, error pages, **accessibility foundation**
**P3 — Security + a11y extras:** login limiter, idle logout, login history, trusted devices, re-verify for sensitive actions, liveness-lite, fallback chain, **accessibility settings page, read-aloud (TTS)**
**P4 — Capstone extras (simulated/free):** quick login, QR payment wallet, SMS outbox, AI helper, check-in module, ID card, PWA, **voice input + voice commands**
**P5 — Capstone later (needs Node/Express + Firebase Admin):** real SMS, real payments, passkey login, QR-scan login, server-side 2FA, AI with own key

---

## 4. Feature map (fill on Oct 10)

| Required feature | Where it lives | Topic use |
|---|---|---|
| 2FA | core/auth (totpService, Security.jsx, TwoFactorVerify.jsx) | |
| Email verification | core/auth (VerifyEmail, ProtectedRoute) | |
| QR code | core/qr (QRGenerator, QRScanner) | |
| Face recognition | core/security (faceService, FaceCapture) | |
| Biometrics | core/security (webauthnService) | |
| Notifications | core/notifications | |

---

## 5. Accessibility notes (WCAG 2.1 AA target)

- Every verification method has a fallback (face/biometric/QR must never lock someone out)
- Settings saved in the user's Firestore doc so they follow the user to mobile
- **Voice input / TTS:** Web Speech API. Speech recognition works in Chrome/Edge (not Firefox), needs HTTPS, and Chrome sends audio to Google's servers. Treat as an enhancement, never the only way to do something. Text-to-speech has wider support.
- Prove it: Lighthouse, `eslint-plugin-jsx-a11y`, keyboard-only run, NVDA/TalkBack, written accessibility statement

---

## 6. Known limitations to state in docs
- TOTP verified client-side (no server) — weaker than server-side 2FA
- Wallet, SMS, payment, and AI are simulations with fake money/messages/replies
- Speech recognition browser support is limited (Chrome/Edge only)
- Nothing has been live-tested or deployed yet (as of Oct 7)

## 7. Open items
- [x] Firebase project created (`.env` populated)
- [ ] `firebase login` on this machine + `flutterfire configure` in `mobile/`
- [ ] Topic + reveal date (Oct 10)
- [ ] Solo vs group final decision
- [ ] Instructor OK on extras (wallet/AI/voice)?
- [ ] Live test pass + deploy (T1–T71)

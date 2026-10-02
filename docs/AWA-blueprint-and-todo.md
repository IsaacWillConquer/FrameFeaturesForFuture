# Project AWA — Blueprint + Todo

**Stack:** React (Vite + Tailwind) · Firebase (Spark/free plan) · Flutter mobile app · web-hosted
**Dates:** Health break Oct 7-9 · Dev window Oct 10-29 · **Submit Oct 28 (real deadline)**
**Mode:** Solo-leaning · own new Firebase project · stay free · built to be reusable for capstone
**Stand-in reference until topic is revealed:** Barangay Health Portal (rebuilt in React)

---

## 1. Structure

```
awa-project/
├── web/src/
│   ├── config/        firebase.js, appConfig.js (edit on reveal)
│   ├── core/          auth, security, qr, notifications, a11y, layout, guards
│   ├── adapters/      smsService, paymentService, aiService, speechService
│   ├── modules/       EMPTY until topic (one folder per entity)
│   ├── pages/  routes/
├── mobile/lib/        config, core, adapters, modules, screens
├── firebase/          firestore.rules, hosting config
└── docs/              feature map, ERD, test cases, manual, a11y statement, defense notes
```

Rule: `core/` never imports from `modules/`.
Roles: Admin ⊃ Staff ⊃ User (checked by level number).

Fixed Firestore collections: `users`, `logs`, `notifications`, `announcements`, `settings`,
`checkins`, `trusted_devices`, `login_history`, `wallets`, `transactions`, `sms_outbox`, `ai_chats`.
Topic collections are added on Oct 10.

---

## 2. Todo by date

### Wed Sep 30 — Setup
- [ ] Create own Firebase project (Spark plan)
- [ ] Turn on Auth (Email/Password, Google) + Firestore (test mode for now)
- [ ] Add Web app, put config in `.env` (VITE_ variables)
- [ ] Check: does Storage ask for billing? Does AI Logic work on Spark?
- [ ] Create repo, remove junk deps from friend's starter (`dom`, `router`, `react-helmet-async`)

### Thu Oct 1 — Restructure + a11y foundation
- [ ] Move starter into `config/`, `core/`, `pages/`, `routes/`
- [ ] AuthProvider returns user + role + emailVerified
- [ ] ProtectedRoute + RoleRoute
- [ ] Fix Login.jsx (navigate during render), email input type
- [ ] UI kit built accessible from day 1: semantic HTML, labels, focus ring, skip link, 44px targets, aria-live toasts

### Fri Oct 2 — Register / login done properly
- [ ] Register creates Firestore `users/{uid}` doc with role
- [ ] Email verification enforced before access
- [ ] First-login change-password page
- [ ] Forgot password + change password

### Sat Oct 3 — Shell + rules + deploy
- [ ] Navbar/sidebar per role, empty dashboards
- [ ] Logger helper writing to `logs`
- [ ] Firestore security rules v1 (helper functions like `isRole()`)
- [ ] Deploy to Firebase Hosting (needed for camera/WebAuthn on HTTPS)

### Sun Oct 4 — 2FA + notifications
- [ ] TOTP 2FA (`otpauth`) + recovery codes
- [ ] Notifications: collection + bell icon + real-time
- [ ] **Text-to-speech: read-aloud button (Web Speech API), first version**

### Mon Oct 5 — QR + Flutter
- [ ] QRGenerator + QRScanner components (with type-the-code fallback)
- [ ] Flutter project created, connected to same Firebase

### Tue Oct 6 — Spike + buffer
- [ ] Flutter on real phone: login + biometric + QR scan
- [ ] Accessibility settings page (text size, contrast, reduce motion) if time
- [ ] Leftovers from earlier days

### Oct 7-9 — Health break

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
- [ ] Face recognition (face-api.js, store descriptors not photos) + liveness-lite
- [ ] Biometrics (WebAuthn web, `local_auth` Flutter)
- [ ] Verification fallback chain wired up (face → biometric → TOTP → staff-assisted)
- [ ] Login limiter, idle auto-logout, login history, trusted devices
- [ ] **Voice input: speech-to-text for search + forms, a few voice commands**
- [ ] **Read-aloud extended to all pages + notifications**
- [ ] Lighthouse a11y audit (target 90+), keyboard-only pass

### Oct 22-25 — Mobile + extras that still fit
- [ ] Resident-side Flutter app (login, profile, main action, notifications, QR, biometric lock)
- [ ] Quick unlock (biometric/PIN), email-link sign-in
- [ ] Wallet + QR payment (simulated), SMS outbox (simulated), AI helper (Gemini via Firebase AI Logic)
- [ ] Check-in module, printable ID card

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
| 2FA | core/auth | |
| Email verification | core/auth | |
| QR code | core/qr | |
| Face recognition | core/security | |
| Biometrics | core/security | |
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
- Wallet, SMS, and payment are simulations with fake money/messages
- Speech recognition browser support is limited

## 7. Open items
- [ ] Firebase project created?
- [ ] Topic + reveal date
- [ ] Solo vs group final decision
- [ ] Instructor OK on extras (wallet/AI/voice)?

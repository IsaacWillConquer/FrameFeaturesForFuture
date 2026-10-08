# AWA — Defense / Viva Notes

Talking points, the demo script, and answers to the hard questions. Keep this next to you during
the defense.

## 1. One-line pitch

"AWA is an accessibility-first web + mobile portal on Firebase: anyone can register, verify their
identity by *whichever method their body and device allow* — password, TOTP, face, fingerprint,
QR, recovery codes or staff help — and every collection is protected by server-side security rules."

## 2. Architecture in 30 seconds

- **React 19 + Vite + Tailwind** (web), **Flutter** (Android), **Firebase Auth + Firestore +
  Hosting** (backend). Free Spark plan, no server code — a deliberate, documented limitation.
- `firestore.rules` is the only trustworthy layer: it runs on Google's servers for every read and
  write. Everything in React is convenience — route guards (`ProtectedRoute`) gate pages in a
  fixed order (loading → login → deactivated → unverified → 2FA → role), but the rules are what
  actually stop data theft.
- **Topic-agnostic core:** `core/` never imports from `modules/`. The app's subject plugs in via
  ONE config file (`appConfig.js`) + one `modules/<entity>/` folder per entity using the
  config-driven CRUD kit. Demonstrated with the demo Items module.
- **Roles** are level numbers: user(1) < staff(2) < admin(3); higher does everything lower can.
  Self-promotion is impossible — role changes happen only in the console.

## 3. Suggested demo script (~8 min)

1. **Register** with a fresh email → show the verification email requirement → verify → in.
2. **Security page:** enable TOTP (scan QR with phone) → show recovery codes (hashed in
   Firestore) → enable face enrollment → test face match.
3. **Lockout + idle:** show the escalating lockout after wrong passwords / the 13-min idle warn
   bar (can short-circuit by talking through the config values).
4. **Accessibility:** change text size, dark + high contrast, reduce motion → press the
   **read-aloud** button → use **voice input** on a form → keyboard-only navigation + skip link.
5. **CRUD:** create/edit/delete an item, search + paginate, export CSV.
6. **Notifications + announcements:** admin posts an announcement → bell updates live.
7. **Wallet + QR (simulated):** top up, pay another user, scan the payment QR.
8. **Phone (if allowed):** same account on the Flutter app — login, notifications, QR.

## 4. Likely questions + answers

**Q: "2FA is verified client-side — isn't that insecure?"**
A: Yes, and it's documented. Firestore's free Spark plan has no server-side functions, so the TOTP
check runs in the browser. The *data* is still safe: the security rules enforce roles and
ownership server-side regardless of what the client does. Upgrading to server-side 2FA is one
Cloud Function away (P5 in the blueprint).

**Q: "How do you know the security rules actually work?"**
A: They're the published ruleset in the Firebase console; the test guide includes negative tests
(rule-denied reads/writes). Client guards can be bypassed with devtools — the rules cannot.

**Q: "Why store face descriptors instead of photos?"**
A: Privacy by design. A 128-number descriptor can verify a match but cannot be reversed into a
face; it's also ~1KB instead of ~1MB, and deletion is trivial.

**Q: "What if a user has no camera / phone / fingerprint sensor?"**
A: Every method has a fallback: type-the-code for QR, recovery codes for lost phones, re-verify
page, and a staff-assisted path. Nobody gets locked out — that's the accessibility requirement.

**Q: "Why is this 'accessibility-first'?"**
A: Semantic HTML, labels and 44px targets were in the UI kit before any feature was built (commit
history shows it). Read-aloud, voice input, text size, high contrast, reduce motion and dyslexia
font are built-in settings saved to the account. `eslint-plugin-jsx-a11y` runs on every component.
See the accessibility statement.

**Q: "Why Firebase and not your own backend?"**
A: Solo project, zero budget: Auth, Firestore, hosting and rules come free and scale to zero.
The trade-off (no server-side logic) is documented, and the rules cover what matters: who can
read/write what.

**Q: "What was hardest?"**
A: The fallback chain for verification (six methods that must never dead-end), atomic multi-doc
writes on a client-only stack (recovery codes burn in a `runTransaction`, wallet transfers in one
`writeBatch`), and keeping the app topic-agnostic (strict `core/` ↔ `modules/` boundary).

**Q: "What would you do next with more time?"**
A: Server-side 2FA + real SMS/payments (Node/Express + Firebase Admin — blueprint P5), full
internationalization, Lighthouse/screen-reader audit results, and the topic entities.

## 5. Known limitations to state up front (before they're found)

- TOTP verified client-side (no server on Spark).
- Wallet, SMS, payment, AI helper are simulations.
- Speech recognition is Chrome/Edge only.
- Mobile covers the resident side (login, notifications, QR, biometric lock) — not every web flow.

## 6. Numbers worth memorizing

- 7 commits of audit fixes + features; 0 lint errors/warnings; build clean.
- T95 + M13 test cases in the test guide.
- 15 Firestore collections; 6 identity/verification methods; 6 accessibility settings.
- Lockout: 5 tries → 2/4/8 min. Idle: warn 13 min → logout 15 min.

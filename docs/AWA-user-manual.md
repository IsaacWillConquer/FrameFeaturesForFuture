# AWA — User Manual

AWA is an accessibility-first portal (web + Android mobile). This manual covers the web app; the
mobile app shares the same account, roles and notifications.

## 1. Getting an account

1. Open the app and choose **Register**.
2. Enter your name, email and a password (min 8 chars). A verification email is sent.
3. Open the email and click the verification link, then return to the app and press
   **"I verified my email"**.
4. You are signed in as a **user** (level 1). Staff (2) and admin (3) roles are set by an admin /
   the Firebase console — you cannot promote yourself (that is deliberate).

## 2. Signing in

- **Email + password**, or **Continue with Google**.
- If 2FA is enabled you are asked for a 6-digit code from your authenticator app (or a recovery
  code). 10 wrong password attempts trigger an escalating lockout (2 → 4 → 8 minutes).
- After 13 minutes of no activity you get a warning bar; after 15 you are logged out
  automatically. Press **Stay logged in** to keep working.

## 3. Securing your account (Security page)

- **Two-factor (TOTP):** scan the QR with any authenticator app (Google Authenticator, Authy),
  enter the code to enable. **Save the recovery codes** — each works once if you lose your phone.
  TOTP codes are always wrong? Your phone clock is off — turn on automatic time.
- **Biometric unlock:** register this device's fingerprint/face (Windows Hello, Touch ID) for
  quicker re-verification.
- **Face recognition (fallback):** enroll your face — only a 128-number mathematical descriptor is
  stored, never a photo. Test it with "Test face match".
- **Trusted devices / login history:** see where your account has been used and mark browsers as
  trusted (Devices page).
- If you cannot use any verification method, use **"Can't use any method? Ask staff for help"** —
  nobody gets locked out by a missing camera or phone.

## 4. Everyday features

| Feature | How |
|---|---|
| Notifications | Bell icon in the top bar; click a notification to mark it read |
| Read-aloud (TTS) | Speaker icon in the top bar reads the page aloud; stop toggle + speed slider included |
| Voice input | Microphone button next to supported fields (search, forms) — Chrome/Edge only |
| Profile | Edit your name, change password, check your role |
| Accessibility settings | Text size, dark mode, high contrast, reduce motion, dyslexia font — saved to your account so they follow you to mobile |
| Check-in | One click records a visit; print your **ID card** from the same page |
| Wallet (demo) | Simulated balance: top up, send credits to another user, make a payment QR |
| Items (demo) | Create/edit/delete demo records; search, paginate, export CSV |

## 5. For staff / admins

- **Users page:** search users, view/edit roles and status, **notify** a user directly,
  export the list to CSV. You cannot change your own role or status (lockout protection).
- **Audit log:** the most recent 100 actions across the app, searchable, CSV/print export.
- **Announcements:** post/edit announcements that all users see on the dashboard.
- **Dashboard:** live 7-day activity chart; admins also see system stats.

## 6. First-login password change

If your account was created with a temporary password (e.g. by an admin), the app forces a
**change-password step** before anything else. You'll use the new password from then on.

## 7. Accessibility quick reference

- Everything works keyboard-only; there is a **skip to main content** link (Tab on page load).
- All buttons/fields have visible labels and at least 44px touch targets.
- Important messages are announced to screen readers (aria-live toasts).
- Every verification method has a fallback — the app never requires a camera, microphone,
  fingerprint or phone to get in.
- Full statement: `docs/AWA-accessibility-statement.md`.

## 8. Known limits

- Wallet, SMS, payments and the AI helper are **simulated** (demo money/messages/replies).
- TOTP is verified client-side (no server on the free Firebase plan) — stated limitation.
- Speech recognition (voice input) works in Chrome/Edge and needs HTTPS.
- The QR camera and WebAuthn need HTTPS or localhost — on a phone, use the deployed URL.

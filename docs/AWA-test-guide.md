# AWA test guide (web v3 + mobile v2)

Goal: find what's broken, not fix it. Tick the box if it passes. If it fails, write the test ID, what you expected, what happened, and the exact error (see Part E). Send me the list.

---

## Part A. One-time setup (web)

**You need:** Node 18+ (20 recommended), a Google account, Chrome, and an authenticator app on your phone (Google/Microsoft Authenticator or Authy).

### A1. Firebase project
- [ ] Go to console.firebase.google.com, click **Add project**, name it, Analytics optional (you can turn it off)
- [ ] Stay on the **Spark (free)** plan, don't upgrade
- [ ] **Build > Authentication > Get started > Sign-in method:** enable **Email/Password**
- [ ] Same screen: enable **Google** (it asks for a support email, pick yours)
- [ ] **Build > Firestore Database > Create database.** Pick a nearby region (asia-southeast1 / Singapore is closest to PH). Start in production mode (we replace the rules next)
- [ ] **Firestore > Rules tab:** delete everything, paste the whole contents of `firestore.rules` from the zip, click **Publish**
- [ ] **Project settings (gear) > Your apps > Web icon (</>)** > register app (no hosting needed yet) > copy the config values

### A2. Run the web app
- [ ] Unzip `awa-web-v3.zip`
- [ ] In the folder: `npm install`
- [ ] Copy `.env.example` to `.env`, fill in the 6 values from the config:
  - `VITE_FIREBASE_API_KEY` = apiKey
  - `VITE_FIREBASE_AUTH_DOMAIN` = authDomain
  - `VITE_FIREBASE_PROJECT_ID` = projectId
  - `VITE_FIREBASE_STORAGE_BUCKET` = storageBucket
  - `VITE_FIREBASE_MESSAGING_SENDER_ID` = messagingSenderId
  - `VITE_FIREBASE_APP_ID` = appId
- [ ] `npm run dev` and open the address it prints (usually http://localhost:5173)
- [ ] The login page loads with no red errors in the browser console (press F12 > Console)

### A3. Make accounts for testing
You need **three accounts** to test roles. Use real emails you can open (a Gmail works with aliases: `you+admin@gmail.com`, `you+staff@gmail.com`, `you+user@gmail.com`).
- [ ] Account 1 (will be admin), account 2 (will be staff), account 3 (stays user)
- [ ] After registering and verifying each one: **Firestore > users > (their doc) > edit `role`** to `admin` / `staff` / leave `user`

---

## Part B. Web feature tests

### B1. Register and email verification
- [ ] **T1** Register with name, email, password (8+ chars). Expect: lands on "Verify your email"
- [ ] **T2** Password under 8 characters shows an error. Mismatched confirm shows an error
- [ ] **T3** Register the same email again. Expect: "already registered" message
- [ ] **T4** Firestore has `users/{uid}` with role `user`, `active` true. `logs` has a `register` entry
- [ ] **T5** Verification email arrives (check spam)
- [ ] **T6** While unverified, type `/dashboard` in the address bar. Expect: bounced back to verify page
- [ ] **T7** Press **I verified my email** BEFORE clicking the link. Expect: "Not verified yet" error
- [ ] **T8** Click **Resend email**. Expect: success message
- [ ] **T9** Click the link in the email, return, press **I verified my email**. Expect: Dashboard

### B2. Login / logout
- [ ] **T10** Log out, then log in with correct details. Expect: Dashboard
- [ ] **T11** Wrong password. Expect: "Wrong email or password."
- [ ] **T12** Forgot password: type email, press **Forgot password?**. Expect: info message and a reset email
- [ ] **T13** Continue with Google. Expect: signs in, a `users` doc is created
- [ ] **T14** Logged in, visit `/login`. Expect: redirected to Dashboard
- [ ] **T15** Refresh the page while logged in. Expect: stays logged in

### B3. Roles and guards
- [ ] **T16** As **user**: Dashboard shows NO "Manage users" / "Audit log" links
- [ ] **T17** As **user**: type `/admin/users`. Expect: "No access" page
- [ ] **T18** As **staff**: admin links visible; `/admin/users` opens; no role dropdowns or deactivate buttons
- [ ] **T19** As **admin**: role dropdowns and Deactivate buttons appear; your own row has none
- [ ] **T20** As admin, change the user account's role to staff. Refresh as that user. Expect: new permissions apply
- [ ] **T21** As admin, **Deactivate** the user account. As that user, refresh. Expect: "Account deactivated" page
- [ ] **T22** Reactivate. Expect: user can get in again

### B4. 2FA
- [ ] **T23** `/security` > **Set up 2FA**. Expect: QR code, manual key text, a code box
- [ ] **T24** Scan QR with your authenticator app (or type the manual key)
- [ ] **T25** Enter a wrong code. Expect: error
- [ ] **T26** Enter the right code. Expect: 8 recovery codes shown. Copy them
- [ ] **T27** Log out and log in. Expect: 2FA page after login
- [ ] **T28** Wrong code. Expect: error. Right code. Expect: Dashboard
- [ ] **T29** Log out, log in, use **recovery code** instead. Expect: works
- [ ] **T30** Reuse the SAME recovery code later. Expect: rejected
- [ ] **T31** Log in with 2FA, close the whole browser tab, reopen the site. Expect: asks for the 2FA code again
- [ ] **T32** While 2FA is pending, type `/dashboard` manually. Expect: bounced to the 2FA page
- [ ] **T33** Firestore `totp/{uid}` exists with `enabled: true` and `recovery` (hashes only, no readable codes)
- [ ] **T34** `/security` > turn off 2FA with a code. Expect: login no longer asks for a code

### B5. Notifications
- [ ] **T35** `/notifications` > **Send test to myself**. Expect: appears instantly, navbar shows `(1)`
- [ ] **T36** **Mark read** removes the unread count. **Mark all read** works with several
- [ ] **T37** **Read aloud** speaks the text (turn your volume on)
- [ ] **T38** Open the site in a second tab, send a test in one. Expect: the other tab updates live

### B6. QR
- [ ] **T39** `/qr-demo`: type text, QR updates, text caption shown under it
- [ ] **T40** **Scan with camera** on localhost (browser asks camera permission). Show it a QR (from your phone screen). Expect: "Scanned: ..."
- [ ] **T41** Deny camera permission. Expect: "Camera unavailable" message, typed fallback still works
- [ ] **T42** Type a code in the fallback box. Expect: shows as scanned

### B7. CRUD kit (`/items`)
- [ ] **T43** As **staff/admin**: **Add new** with a name. Expect: appears in the table
- [ ] **T44** Name left blank. Expect: browser blocks submit
- [ ] **T45** **Edit**, change quantity, save. Expect: row updates
- [ ] **T46** **Delete** shows a confirm box. Cancel keeps it, OK removes it
- [ ] **T47** Search box filters rows
- [ ] **T48** As plain **user**: can see items, NO Add/Edit/Delete buttons
- [ ] **T49** On a narrow window (phone width) the table scrolls sideways instead of breaking the page

### B8. Admin pages and logs
- [ ] **T50** `/admin/logs` shows your recent actions with NAMES (not just ids): register, login, 2fa, items_create, etc.
- [ ] **T51** Search box in the log filters rows. **Refresh** reloads
- [ ] **T52** `/activity` (any user) shows only YOUR own entries
- [ ] **T53** Role changes and deactivations appear in the audit log

### B9. Security extras
- [ ] **T54** Enter a wrong password 5 times in a row on one email. Expect: "Locked for 120 seconds"
- [ ] **T55** During the lock, the correct password is still refused. After waiting (or clearing site data) it works
- [ ] **T56** Idle logout (quick test): in `src/config/appConfig.js` set `IDLE_WARN_MIN = 1` and `IDLE_LOGOUT_MIN = 2`, save, wait. Expect: yellow warning bar at 1 min, **Stay logged in** resets it, ignoring it logs you out at 2 min. **Set the numbers back to 13 and 15 after.**

### B10. Accessibility
- [ ] **T57** `/accessibility`: text size Large / Extra large changes all text
- [ ] **T58** Dark mode on: check Login, Dashboard, Items table, Users table, forms. Note any unreadable text and which page
- [ ] **T59** High contrast, Reduce motion, Dyslexia spacing each visibly change something
- [ ] **T60** Reload the page. Expect: settings stay
- [ ] **T61** Log in on a second browser. Expect: same settings load (saved on the account)
- [ ] **T62** **Reset to defaults** works
- [ ] **T63** Keyboard only (no mouse): press Tab on login, a "Skip to main content" link appears first, focus ring is visible, Enter submits the form, you can complete a full login
- [ ] **T64** Chrome DevTools > **Lighthouse** > Accessibility, run on Login and Dashboard. Write down the scores (target 90+)
- [ ] **T65** Resize the window to phone width. Nothing is cut off

### B11. Deploy (HTTPS test)
- [ ] **T66** Install tools: `npm install -g firebase-tools`, then `firebase login`
- [ ] **T67** In the project folder: `firebase use --add` and pick your project
- [ ] **T68** In the Firebase console: **Build > Hosting > Get started** (just click through)
- [ ] **T69** `npm run deploy`. Expect: prints a live URL
- [ ] **T70** On the live URL: register or log in. Expect: works
- [ ] **T71** On your PHONE, open the live URL and test the **QR camera scan** (this is the real camera test)

---

## Part C. Mobile setup and tests (do on Oct 6, or when ready)

### C1. Setup
- [ ] Flutter 3.16+ installed, `flutter doctor` is green for Android
- [ ] Follow `mobile/README.md` step by step (flutter create, copy `lib/`, `flutterfire configure`, `flutter pub add ... otp crypto`, the 3 Android edits)
- [ ] Phone with USB debugging on, shows in `flutter devices`
- [ ] `flutter run`: app opens on the phone

### C2. Mobile tests
- [ ] **M1** Log in with a verified account. Expect: goes through to the biometric lock
- [ ] **M2** Unverified account. Expect: "verify email" screen
- [ ] **M3** Account with 2FA on. Expect: code screen after login. Right code passes, wrong fails, recovery code works once
- [ ] **M4** Biometric lock: fingerprint/face unlocks; cancel then **Unlock** retries; **Log out and use password** works
- [ ] **M5** Deactivated account (deactivate from web). Expect: "Account deactivated" on phone
- [ ] **M6** Home shows your name and role
- [ ] **M7** Send a test notification from the web. Expect: appears on the phone live
- [ ] **M8** Tap an unread notification on the phone. Expect: becomes read on the web too
- [ ] **M9** **Scan QR code**: camera scans a QR from `/qr-demo`; typed fallback works; scanning a second code after the first works
- [ ] **M10** **Settings**: Large text and Dark mode apply instantly
- [ ] **M11** Change dark mode on the phone, then check the web accessibility page shows it too (and the reverse)
- [ ] **M12** Log out. Expect: back to login, theme resets
- [ ] **M13** Phone login appears in the web audit log with details `mobile`

---

## Part D. If something fails, the usual suspects

| Symptom | Likely cause |
|---|---|
| "Missing or insufficient permissions" / "Blocked by database rules" | Rules not pasted/published, or an old version. Re-paste `firestore.rules` and Publish |
| Blank page / red console error about `apiKey` | `.env` values missing or wrong. Restart `npm run dev` after editing `.env` |
| Google sign-in popup closes or errors | Google not enabled in Auth > Sign-in method, or popup blocked by the browser |
| No verification email | Check spam. Wait a minute. Press Resend |
| Stuck on "Loading..." forever | Open the console (F12) and send me the error |
| 2FA code always wrong | Phone clock off. Turn on automatic time. Codes change every 30 seconds |
| Camera won't start | Needs HTTPS or localhost, and permission allowed. Phone can't use your laptop's localhost, use the deployed URL |
| Dark mode text unreadable | Known: it's color overrides, tell me which page |
| Admin links missing after you edited `role` | Refresh the page (role loads at login/refresh) |
| Mobile: "unable to find FlutterFragmentActivity" or biometric crash | Android edit step 6 in the mobile README was missed |

---

## Part E. Bug report template (copy for each problem)

```
Test ID:
Account/role:
Where (web URL / phone screen):
Expected:
What happened:
Exact error text (paste, don't retype):
Browser console red line (F12 > Console), if web:
```

## Suggested order and time
1. Part A (20-30 min), mostly clicking in the Firebase console
2. B1 to B3 first (30 min). If these fail, stop and send me the list, everything else depends on them
3. B4 to B10 (1 hour)
4. B11 deploy (15 min)
5. Part C when you're at your PC with the phone (1 hour or more, Flutter setup is the slow part)

Don't stop to debug yourself. Finish the list, send me the failures, and we fix them in one batch.

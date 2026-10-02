# AWA security code, explained in plain language

For studying and for defense. Each piece: what it does, why it's written that way, and its limit.

---

## 1. `firestore.rules` (the real lock)

**What it is:** rules that Firebase runs on its own servers for EVERY read/write from the web or the phone. The browser can't skip them. This is the only truly trustworthy security layer in the project. Everything in the React code is just convenience.

**Helper functions at the top**
- `signedIn()`: is there a logged-in user at all?
- `myRole()`: looks up the caller's own `users/{uid}` doc and reads its `role`
- `isAdmin()`, `isStaffUp()`: build on `myRole()` so each rule below reads like a sentence

**`users/{uid}`**
- Read: yourself, or staff/admin (staff need it to see the user list)
- Create: only your OWN doc, and only with `role == 'user'`. This stops someone from registering themselves as admin by editing the request.
- Update: admins can change anything. Everyone else can edit only their own doc, and the rule checks that `role` and `active` are unchanged. Without the `active` check, a deactivated user could switch themselves back on.
- Delete: admin only
- How you get your first admin: edit `role` by hand in the Firebase console (console access bypasses rules)

**`logs`:** anyone logged in can write a log row, but only with their OWN uid (can't forge someone else's). Staff read all, everyone reads their own.

**`notifications`:** you read/update your own. You can create one for yourself; only staff/admin can create for others (stops spam).

**`totp/{uid}`:** owner only. Staff can't read it, so staff can't see anyone's 2FA secret.

**`items` (demo):** everyone logged in reads, only staff/admin write. Copy this block per topic collection.

**Limit:** a rule can only judge the data in the request, not a whole workflow. That's why things like "lockout after 5 tries" can't live here.

---

## 2. Who gets in: `AuthProvider` + `ProtectedRoute`

**AuthProvider** listens to Firebase login state, then loads three things: the user, their `users` doc (for the role), and whether 2FA is on. While that loads, `loading` is true so pages show "Loading..." instead of flashing the wrong screen.

**ProtectedRoute checks in a fixed order**, and the order matters:
1. Still loading? Wait.
2. Not logged in? Go to login.
3. Account deactivated? Go to the deactivated page.
4. Email not verified? Go to verify page.
5. 2FA on but not passed this session? Go to the 2FA page.
6. Role too low for this page? Go to "No access".
7. Otherwise show the page.

**Limit:** this is UI-level. Someone who edits the website's code in their browser could show themselves a page, but they still can't read or write data, because the rules (section 1) say no. Hiding pages is for user experience, the rules are for security.

---

## 3. 2FA with an authenticator app (TOTP)

**How it works:** when you set it up, the app makes a random secret and shows it as a QR code. Your phone app and our code both turn "secret + the current 30-second time slot" into the same 6-digit number using a standard formula. At login, we compute what the number should be and compare it to what you typed.

**`window: 1`:** also accepts the code from one slot before or after, because phone and computer clocks are never perfectly in sync.

**Where the secret lives:** `totp/{uid}`, owner-only by the rules.

**Recovery codes:** 8 random codes shown ONCE. We store only their SHA-256 **hashes** (a one-way scramble). If someone reads the database, they get hashes they can't turn back into codes. When you type a recovery code, we hash it and compare. A used code's hash is removed, so it works once.

**Session memory:** passing 2FA sets a flag in `sessionStorage`, which is wiped when the tab closes. Close the tab, and 2FA is required again.

**Limit (state this in your defense):** the check runs in the browser, not on a server, because the free Firebase plan has no server code. A skilled attacker who controls the browser could skip the check. Real server-side 2FA is on the capstone list (needs a small Node server).

---

## 4. Login lockout (`loginLimiter.js`)

**What it does:** counts wrong passwords per email in `localStorage`. On the 5th miss, it stores a "locked until" time 2 minutes ahead, and the login form refuses to try until then.

**Why only count `auth/invalid-credential`:** so network errors don't lock someone out.

**Limit:** it lives in the browser, so clearing site data resets it, and it doesn't stop an attacker who talks to Firebase directly. Firebase has its own built-in "too many requests" protection as a second layer.

---

## 5. Idle logout (`IdleGuard.jsx`)

**What it does:** remembers the time of the last mouse move, key press, click, touch, or scroll. A timer checks every 5 seconds. At 13 idle minutes it shows a warning bar; at 15 it logs you out. After the warning shows, only the **Stay logged in** button resets the clock (so the warning can't be dismissed by accident).

**Why:** protects a shared or left-open computer.

**Limit:** browser-side only, and a tab that's closed doesn't run the timer (the Firebase session stays signed in until it expires or someone logs out).

---

## 6. Deactivated accounts

An admin sets `active: false` on the user's doc. On the next page load, `ProtectedRoute` sees it and sends them to the deactivated page. The phone app does the same check in its gate.

**Limit:** it doesn't kick someone out mid-session, only on the next load or login. Rules also don't block data access for a deactivated user (they're still "signed in" to Firebase). For this project that's acceptable; mention it as a known limit.

---

## 7. Known limits, one list for your documentation
1. 2FA is verified in the browser, not on a server
2. Lockout and idle logout run in the browser
3. Deactivation applies on next load, not instantly
4. Wallet, SMS, payment and AI features are simulated (when added)
5. Dark mode is a color-override approach, a few screens may need touch-ups
6. Email verification is enforced by the pages (the app), not by the database rules. A logged-in but unverified person who talks to Firebase directly could still read/write what the rules allow a normal user. Fixing it properly means checking the email_verified flag in the rules and restructuring registration, so it's listed as a known limit for now

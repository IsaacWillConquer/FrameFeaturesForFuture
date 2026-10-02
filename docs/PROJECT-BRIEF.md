# AWA project brief (workflow steps 1 and 2)

## Step 1: brief
- **Stack:** React + Vite + Tailwind, Firebase Auth + Firestore (free Spark plan), Flutter mobile app, Firebase Hosting
- **Roles:** `user` (1), `staff` (2), `admin` (3). Higher number can do everything lower can.
- **Naming**
  - React components: `PascalCase.jsx`. Services and hooks: `camelCase.js`
  - Firestore collections: lowercase plural. Fields: `camelCase`
  - Log actions: `snake_case` like `items_create`
  - Dart files: `snake_case.dart`
- **Rule:** `core/` never imports from `modules/`. Topic stuff lives only in `modules/`.

## Step 2: schema (locked)
| Collection | Fields |
|---|---|
| `users/{uid}` | email, name, role, active, prefs{textSize, dark, contrast, reduceMotion, dyslexia}, createdAt |
| `logs/{auto}` | uid, action, details, createdAt |
| `notifications/{auto}` | userId, title, message, read, createdAt |
| `totp/{uid}` | secret, enabled, recovery[] (hashes), createdAt |
| `sms_outbox/{auto}` | to, message, status, createdAt |
| `items/{auto}` (demo only) | name, category, quantity, notes, createdBy, createdAt, updatedAt |

Planned, not built yet: `faces/{uid}`, `wallets`, `transactions`, `ai_chats`, `checkins`.
Topic collections: decided on reveal day, before any topic code.

## Build order (steps 3 to 6)
1. Early bare-bones deploy (what exists now)
2. **User slice**, tested live: register, verify, login, 2FA, notifications, accessibility
3. **Staff slice:** items CRUD, user list, audit log
4. **Admin slice:** role changes, deactivate
5. One feature per request after that: face, biometrics, wallet, SMS, AI. Commit a checkpoint before each.
6. Reveal day: static page skeletons per entity first, then logic, one role at a time

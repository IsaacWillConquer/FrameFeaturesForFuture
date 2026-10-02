# AWA project

```
awa-project/
├── web/          React app (run everything web from in here)
├── mobile-src/   Flutter source: lib/ + README. The real `mobile/` project is created by flutter create (see mobile-src/README.md)
├── docs/         PROJECT-BRIEF, blueprint + todo, test guide, security explained
└── .gitignore
```

## Start here (in this order)
1. **Checkpoint:** `git init`, `git add .`, `git commit -m "checkpoint: starting point"`
2. **Firebase:** make a project, turn on Email/Password + Google auth and Firestore. Paste `web/firestore.rules` in **Firestore Database > Rules** (not Realtime Database). Details: docs/AWA-test-guide.md Part A
3. **Web:** in `web/`: `npm install`, copy `.env.example` to `.env`, fill in the Firebase config, `npm run dev`
4. **Test the User slice** (test IDs in docs/AWA-test-guide.md: T1-T15, T16-T17, T23-T38, T57-T65), then deploy (T66-T71)
5. **Phone:** later (Oct 6), follow mobile-src/README.md

Read docs/PROJECT-BRIEF.md for the roles, naming rules, schema, and build order.

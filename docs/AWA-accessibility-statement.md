# AWA — Accessibility Statement

**Scope:** the AWA web app (and the Android app, which follows the same principles).
**Target:** WCAG 2.1 Level AA (Lighthouse accessibility score 90+).
**Last reviewed:** Oct 8, 2026 (code level — live Lighthouse/keyboard/screen-reader pass scheduled
before submission).

## 1. Our commitment

Accessibility is a requirement of this project, not polish. AWA is designed so that a person who
cannot see well, cannot use a mouse, cannot use a camera/fingerprint sensor, or cannot speak can
still register, sign in securely, and use every core feature.

## 2. What AWA does (measures taken)

**Built into the UI kit from day 1** (`web/src/core/ui/`):

- Semantic HTML: real `<button>`, `<label>`, `<table>` with `<caption>`, headings in order.
- Every input has a programmatic label; icon-only buttons have `aria-label`.
- Minimum **44×44px** touch targets on all interactive controls.
- Visible **focus ring** on keyboard focus (never `outline: none`).
- **Skip to main content** link as the first focusable element.
- Important status messages use **ARIA live regions** (`role="alert"` / `role="status"`) so screen readers announce them.
- Tables have captions; decorative icons are `aria-hidden`.

**Accessibility settings** (saved to the user's account, so they follow the person to mobile):

- Text size (100% / 120% / 140%)
- Dark mode and a dedicated **high-contrast** mode
- **Reduce motion** (disables transitions/animations)
- **Dyslexia-friendly** font option
- **Read-aloud (TTS)** on every page via the top bar, with a stop toggle and a rate slider
- **Voice input** for supported fields (an enhancement, never the only way)

**Security that never locks people out:**

- Every verification method has a fallback chain: face → device biometrics → TOTP → recovery
  codes → type-the-code → staff-assisted. No camera, microphone, fingerprint or phone is ever
  required to sign in.
- The QR scanner always has a **type-the-code** box that works without a camera.

## 3. Known limitations (honest list)

- **Dark mode** is implemented as a color-override layer; a few screens may need contrast
  touch-ups. The dedicated high-contrast mode is the reliable option.
- **Voice input (speech recognition)** works in Chrome/Edge only (not Firefox/Safari), needs
  HTTPS, and Chrome sends audio to Google's servers. It is always paired with a normal input.
- **Read-aloud** uses the browser's Web Speech API — voice quality varies by OS/browser.
- Live conformance testing (Lighthouse 90+, full keyboard-only run, NVDA/TalkBack) is scheduled
  before submission; this statement will be updated with the results.

## 4. How we tested

- `eslint-plugin-jsx-a11y` on every component (CI for the codebase).
- Manual keyboard-only runs of the core flows (register → verify → 2FA → CRUD).
- Lighthouse accessibility audit on the deployed URL (before submission).
- Screen-reader spot checks: NVDA (Windows) on web; TalkBack (Android) on mobile.

## 5. Feedback

This is a student capstone project. Report any accessibility barrier to the project author
(supervisor/student email placeholder — set before submission) and it will be treated as a bug,
not a feature request.

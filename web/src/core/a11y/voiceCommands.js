// Very small voice-command grammar. It is a convenience layer on top of the
// existing speech-to-text button, never the only way to do something.
const PAGES = [
  [/dashboard|home screen/, "/dashboard"],
  [/notification/, "/notifications"],
  [/announce/, "/announcements"],
  [/profile|my account/, "/profile"],
  [/security|two.?factor|2fa/, "/security"],
  [/biometric|fingerprint|my face/, "/biometrics"],
  [/verify/, "/verify-identity"],
  [/device|history/, "/devices"],
  [/activity/, "/activity"],
  [/accessib|settings/, "/accessibility"],
  [/wallet|payment|money/, "/wallet"],
  [/check.?in/, "/check-in"],
  [/assistant|helper|\bai\b/, "/ai"],
  [/\bqr\b/, "/qr-demo"],
  [/support|help request/, "/admin/support"],
  [/users?/, "/admin/users"],
  [/sms|text message/, "/admin/sms"],
  [/\blog/, "/admin/logs"],
];

// Returns { type, to? } for a recognized phrase, otherwise null.
export function matchCommand(raw) {
  const text = (raw || "").toLowerCase().trim();
  if (!text) return null;

  if (/\b(log ?out|sign ?out)\b/.test(text)) return { type: "logout" };
  if (/\bstop\b/.test(text) && /(read|speak|talk)/.test(text)) return { type: "stopRead" };
  if (/(read|speak)\b.*\b(page|aloud|this)\b/.test(text) || /^read( the)? page$/.test(text)) {
    return { type: "readPage" };
  }
  if (/dark mode|night mode|light mode/.test(text)) return { type: "toggleDark" };
  if (/high contrast|contrast/.test(text)) return { type: "toggleContrast" };

  const nav = /(go to|open|show|navigate to|take me to|bring me to)\s+(.+)/.exec(text);
  const phrase = nav ? nav[2] : text;
  for (const [re, to] of PAGES) {
    if (re.test(phrase)) return { type: "navigate", to };
  }
  return null;
}

// Locks the login form after 5 wrong passwords for 2 minutes.
// Runs in the browser, so it slows down guessing but a determined person can bypass it.
// (Firebase also has its own "too many requests" protection.) Mention this in your docs.
const MAX_TRIES = 5;
const LOCK_SECONDS = 120;

const key = (email) => "awa_fail_" + email.trim().toLowerCase();

function read(email) {
  try {
    return JSON.parse(localStorage.getItem(key(email))) || { count: 0, until: 0 };
  } catch {
    return { count: 0, until: 0 };
  }
}

export function secondsLocked(email) {
  const { until } = read(email);
  return Math.max(0, Math.ceil((until - Date.now()) / 1000));
}

// Returns seconds locked (0 if not locked yet)
export function recordFail(email) {
  const data = read(email);
  data.count += 1;
  if (data.count >= MAX_TRIES) {
    data.until = Date.now() + LOCK_SECONDS * 1000;
    data.count = 0;
  }
  localStorage.setItem(key(email), JSON.stringify(data));
  return secondsLocked(email);
}

export function clearFails(email) {
  localStorage.removeItem(key(email));
}

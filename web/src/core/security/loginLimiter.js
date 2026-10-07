// Locks the login form after 5 wrong passwords. Each lock lasts twice as long
// as the one before (2 min, 4 min, 8 min...), and the fail count keeps going.
// Runs in the browser, so it slows down guessing but a determined person can bypass it.
// (Firebase also has its own "too many requests" protection.) Mention this in your docs.
const MAX_TRIES = 5;
const BASE_LOCK_SECONDS = 120;

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
  data.locks = data.locks || 0;
  if (data.count >= MAX_TRIES) {
    // 2 min, then 4, then 8... The count is NOT reset, so every wrong try
    // after the first lock re-locks with a longer wait.
    data.locks += 1;
    data.until = Date.now() + BASE_LOCK_SECONDS * 2 ** (data.locks - 1) * 1000;
  }
  localStorage.setItem(key(email), JSON.stringify(data));
  return secondsLocked(email);
}

export function clearFails(email) {
  localStorage.removeItem(key(email));
}

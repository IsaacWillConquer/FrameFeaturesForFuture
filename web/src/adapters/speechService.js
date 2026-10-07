// Text-to-speech and voice input using the browser's Web Speech API (free).
// Speech recognition works in Chrome/Edge only and needs HTTPS or localhost.
export function speak(text, { rate, onEnd } = {}) {
  if (!("speechSynthesis" in window)) return false;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  if (rate) u.rate = rate;
  if (onEnd) u.onend = () => onEnd();
  window.speechSynthesis.speak(u);
  return true;
}

export function stopSpeaking() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

export function listen(onResult, onError) {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) return null;
  const rec = new Recognition();
  rec.lang = "en-US";
  rec.onresult = (e) => onResult(e.results[0][0].transcript);
  rec.onerror = (e) => onError && onError(e.error);
  rec.start();
  return rec;
}

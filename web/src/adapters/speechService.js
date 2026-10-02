// Text-to-speech and voice input using the browser's Web Speech API (free).
// Speech recognition works in Chrome/Edge only and needs HTTPS or localhost.
export function speak(text) {
  if (!("speechSynthesis" in window)) return false;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
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

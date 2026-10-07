import { useEffect, useState } from "react";
import { speak, stopSpeaking } from "../../adapters/speechService";
import { useA11y } from "./A11yProvider";

// Reads any text out loud with the browser's text-to-speech. Hidden if the
// browser can't. Toggles to "Stop" while speaking. Respects the rate setting
// from Accessibility (prefs.ttsRate).
export default function ReadAloud({ text, label = "Read aloud" }) {
  const { prefs } = useA11y();
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => () => {
    if (speaking) stopSpeaking();
  }, [speaking]);

  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;

  function toggle() {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    speak(text, { rate: prefs?.ttsRate, onEnd: () => setSpeaking(false) });
  }

  return (
    <button type="button" onClick={toggle} aria-pressed={speaking} className="underline min-h-11"
      aria-label={`${label}: ${text}`}>
      {speaking ? "Stop" : label}
    </button>
  );
}

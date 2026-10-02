import { speak } from "../../adapters/speechService";

// Reads any text out loud with the browser's text-to-speech. Hidden if the browser can't.
export default function ReadAloud({ text, label = "Read aloud" }) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  return (
    <button onClick={() => speak(text)} className="underline min-h-11" aria-label={`${label}: ${text}`}>
      {label}
    </button>
  );
}

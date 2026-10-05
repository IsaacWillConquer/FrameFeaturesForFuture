import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { listen } from "../../adapters/speechService";
import { cx } from "../ui/cx";

// Speech-to-text button. Uses the Web Speech API (Chrome/Edge, HTTPS only).
// Hidden when the browser cannot recognize speech, so it is always an enhancement.
export default function VoiceInput({ onResult, label = "Voice input", className }) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition));
    return () => recRef.current?.abort?.();
  }, []);

  if (!supported) return null;

  function toggle() {
    if (listening) {
      recRef.current?.stop?.();
      setListening(false);
      return;
    }
    const rec = listen(
      (text) => {
        onResult?.(text);
        setListening(false);
      },
      () => setListening(false)
    );
    if (!rec) return;
    rec.onend = () => setListening(false);
    recRef.current = rec;
    setListening(true);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={listening}
      aria-label={listening ? `${label} (listening, click to stop)` : label}
      title={label}
      className={cx(
        "inline-flex items-center justify-center rounded-lg border border-border min-h-11 min-w-11",
        listening ? "bg-danger text-white" : "bg-surface text-fg hover:bg-surface-2",
        className
      )}
    >
      {listening ? <MicOff className="h-5 w-5" aria-hidden="true" /> : <Mic className="h-5 w-5" aria-hidden="true" />}
    </button>
  );
}

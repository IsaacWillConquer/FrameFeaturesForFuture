import { createContext, useContext, useEffect, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { COLLECTIONS } from "../../config/appConfig";
import { useAuth } from "../auth/AuthProvider";

const DEFAULTS = { textSize: "normal", contrast: false, dark: false, reduceMotion: false, dyslexia: false, ttsRate: 1 };
const SIZES = { normal: "100%", large: "120%", xlarge: "140%" };
const A11yContext = createContext(null);

function loadLocal() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem("awa_a11y")) };
  } catch {
    return DEFAULTS;
  }
}

export function A11yProvider({ children }) {
  const { user, profile } = useAuth();
  const [prefs, setPrefs] = useState(loadLocal);

  // Apply settings to the <html> element (CSS in index.css does the rest)
  useEffect(() => {
    const root = document.documentElement;
    root.style.fontSize = SIZES[prefs.textSize] || "100%";
    root.classList.toggle("hc", prefs.contrast);
    root.classList.toggle("dark", prefs.dark);
    root.classList.toggle("reduce-motion", prefs.reduceMotion);
    root.classList.toggle("dyslexia", prefs.dyslexia);
  }, [prefs]);

  // Settings saved on the account follow the person to other devices
  // (render-phase adjustment: react.dev/learn/you-might-not-need-an-effect)
  const [lastProfile, setLastProfile] = useState(profile);
  if (profile !== lastProfile) {
    setLastProfile(profile);
    if (profile?.prefs) setPrefs((p) => ({ ...p, ...profile.prefs }));
  }

  function update(change) {
    const next = { ...prefs, ...change };
    setPrefs(next);
    localStorage.setItem("awa_a11y", JSON.stringify(next));
    if (user) {
      updateDoc(doc(db, COLLECTIONS.users, user.uid), { prefs: next }).catch(() => {});
    }
  }

  return <A11yContext.Provider value={{ prefs, update, reset: () => update(DEFAULTS) }}>{children}</A11yContext.Provider>;
}

export function useA11y() {
  return useContext(A11yContext);
}

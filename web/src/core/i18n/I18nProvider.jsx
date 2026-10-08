import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { LANGUAGES, TRANSLATIONS } from "./translations";

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem("awa_lang");
      return saved && TRANSLATIONS[saved] ? saved : "en";
    } catch {
      return "en";
    }
  });

  useEffect(() => {
    document.documentElement.lang = lang === "tl" ? "fil" : "en";
    try {
      localStorage.setItem("awa_lang", lang);
    } catch { /* storage may be unavailable */ }
  }, [lang]);

  // t("nav_wallet", "Wallet") -> translated string, or the English fallback.
  const t = useCallback(
    (key, fallback) => TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.en[key] ?? fallback ?? key,
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t, languages: LANGUAGES }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

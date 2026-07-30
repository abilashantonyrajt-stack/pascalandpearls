"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface I18nContextValue {
  lang: string;
  setLang: (lang: string) => void;
  t: (key: string, params?: Record<string, string>) => string;
  available: { code: string; name: string }[];
}

const EN: Record<string, string> = {};

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "kn", name: "ಕನ್ನಡ" },
  { code: "ta", name: "தமிழ்" },
  { code: "te", name: "తెలుగు" },
  { code: "ml", name: "മലയാളം" },
  { code: "hi", name: "हिन्दी" },
];

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [strings, setStrings] = useState<Record<string, string>>({});
  const [lang, setLangState] = useState("en");

  useEffect(() => {
    const saved = localStorage.getItem("pnp_lang") || "en";
    setLangState(saved);
    import(`./locales/${saved}.json`).then((m) => setStrings(m.default)).catch(() => {});
  }, []);

  const setLang = (code: string) => {
    setLangState(code);
    localStorage.setItem("pnp_lang", code);
    import(`./locales/${code}.json`).then((m) => setStrings(m.default)).catch(() => {});
  };

  const t = (key: string, params?: Record<string, string>) => {
    let val = strings[key] || key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        val = val.replace(`{${k}}`, v);
      }
    }
    return val;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t, available: LANGUAGES }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within LanguageProvider");
  return ctx;
}

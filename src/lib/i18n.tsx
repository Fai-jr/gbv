"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { FR } from "@/lib/translations/fr";

export type Lang = "en" | "fr";
type Vars = Record<string, string | number>;

const KEY = "gbvconnect-lang";

function fill(text: string, vars?: Vars) {
  if (!vars) return text;
  return Object.keys(vars).reduce((out, k) => out.split("{" + k + "}").join(String(vars[k])), text);
}

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (text: string, vars?: Vars) => string;
};

const LanguageContext = createContext<Ctx>({
  lang: "en",
  setLang: () => {},
  t: (text, vars) => fill(text, vars),
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(KEY);
      if (saved === "fr" || saved === "en") {
        setLangState(saved);
        return;
      }
    } catch {}
    if (navigator.language && navigator.language.toLowerCase().startsWith("fr")) setLangState("fr");
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(KEY, l);
    } catch {}
  }, []);

  const t = useCallback(
    (text: string, vars?: Vars) => fill(lang === "fr" && FR[text] ? FR[text] : text, vars),
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang() {
  return useContext(LanguageContext);
}

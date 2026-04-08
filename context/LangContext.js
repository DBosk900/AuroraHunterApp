import React, { createContext, useContext, useState } from "react";
import { T, DEFAULT_LANG } from "../config";

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(DEFAULT_LANG);
  const t = (key) => T[lang][key] || T["it"][key] || key;
  const toggleLang = () => setLang(l => l === "it" ? "en" : "it");
  return (
    <LangContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);

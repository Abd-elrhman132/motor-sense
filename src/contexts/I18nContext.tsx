import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { translations, type Lang } from "@/lib/translations";

type I18nCtx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (typeof translations)["en"];
  dir: "ltr" | "rtl";
};

const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = (typeof window !== "undefined" &&
      localStorage.getItem("pg_lang")) as Lang | null;
    if (stored === "ar" || stored === "en") setLangState(stored);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.classList.add("dark");
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("pg_lang", l);
  };

  return (
    <Ctx.Provider
      value={{ lang, setLang, t: translations[lang], dir: lang === "ar" ? "rtl" : "ltr" }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useI18n = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useI18n must be inside I18nProvider");
  return c;
};

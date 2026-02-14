"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_LOCALE, dictionaries, isRtl, type Dictionary, type Locale, type Theme } from "../../lib/i18n";

const LOCALE_KEY = "trexbyte.admin.locale";
const THEME_KEY = "trexbyte.admin.theme";

interface AppContextValue {
  locale: Locale;
  theme: Theme;
  dictionary: Dictionary;
  isRtl: boolean;
  setLocale: (locale: Locale) => void;
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProviders({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const storedLocale = window.localStorage.getItem(LOCALE_KEY) as Locale | null;
    const storedTheme = window.localStorage.getItem(THEME_KEY) as Theme | null;

    if (storedLocale && ["ar", "fr", "en"].includes(storedLocale)) {
      setLocaleState(storedLocale);
    }

    if (storedTheme && ["light", "dark"].includes(storedTheme)) {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = isRtl(locale) ? "rtl" : "ltr";
    window.localStorage.setItem(LOCALE_KEY, locale);
  }, [locale]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const value = useMemo<AppContextValue>(
    () => ({
      locale,
      theme,
      dictionary: dictionaries[locale],
      isRtl: isRtl(locale),
      setLocale: setLocaleState,
      toggleTheme: () => {
        setTheme((current) => (current === "light" ? "dark" : "light"));
      }
    }),
    [locale, theme]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used inside AppProviders");
  }

  return context;
}

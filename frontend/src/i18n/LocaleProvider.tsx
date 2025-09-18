"use client";
import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { IntlProvider } from "react-intl";
import en from "@/i18n/messages/en.json";
import hi from "@/i18n/messages/hi.json";
import bn from "@/i18n/messages/bn.json";
import as from "@/i18n/messages/as.json";

type SupportedLocale = "en" | "hi" | "bn" | "as";

const messages: Record<SupportedLocale, Record<string, string>> = { en, hi, bn, as } as const;

type LocaleContextValue = {
  locale: SupportedLocale;
  setLocale: (next: SupportedLocale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}

const DEFAULT_LOCALE: SupportedLocale = "en";
const STORAGE_KEY = "app.locale";

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>(DEFAULT_LOCALE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? (localStorage.getItem(STORAGE_KEY) as SupportedLocale | null) : null;
    if (stored && messages[stored]) {
      setLocaleState(stored);
    }
  }, []);

  // Dynamically load Intl polyfills and locale data where necessary
  useEffect(() => {
    let cancelled = false;
    async function loadIntlLocaleData(target: SupportedLocale) {
      try {
        // NumberFormat polyfill + locale
        if (typeof Intl === "undefined" || typeof (Intl as any).NumberFormat === "undefined") {
          await import("@formatjs/intl-numberformat/polyfill");
        }
        // Some environments miss locale data for certain languages
        switch (target) {
          case "hi":
            await import("@formatjs/intl-numberformat/locale-data/hi");
            await import("@formatjs/intl-pluralrules/polyfill");
            await import("@formatjs/intl-pluralrules/locale-data/hi");
            await import("@formatjs/intl-datetimeformat/polyfill");
            await import("@formatjs/intl-datetimeformat/add-all-tz");
            await import("@formatjs/intl-datetimeformat/locale-data/hi");
            break;
          case "bn":
            await import("@formatjs/intl-numberformat/locale-data/bn");
            await import("@formatjs/intl-pluralrules/polyfill");
            await import("@formatjs/intl-pluralrules/locale-data/bn");
            await import("@formatjs/intl-datetimeformat/polyfill");
            await import("@formatjs/intl-datetimeformat/add-all-tz");
            await import("@formatjs/intl-datetimeformat/locale-data/bn");
            break;
          case "as":
            // Assamese often lacks built-in data
            await import("@formatjs/intl-numberformat/polyfill");
            await import("@formatjs/intl-numberformat/locale-data/as");
            await import("@formatjs/intl-pluralrules/polyfill");
            await import("@formatjs/intl-pluralrules/locale-data/as");
            await import("@formatjs/intl-datetimeformat/polyfill");
            await import("@formatjs/intl-datetimeformat/add-all-tz");
            await import("@formatjs/intl-datetimeformat/locale-data/as");
            break;
          default:
            // English usually exists, but ensure polyfills don't break
            await import("@formatjs/intl-numberformat/locale-data/en");
            await import("@formatjs/intl-pluralrules/polyfill");
            await import("@formatjs/intl-pluralrules/locale-data/en");
            await import("@formatjs/intl-datetimeformat/polyfill");
            await import("@formatjs/intl-datetimeformat/add-all-tz");
            await import("@formatjs/intl-datetimeformat/locale-data/en");
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    }
    setReady(false);
    loadIntlLocaleData(locale);
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const setLocale = (next: SupportedLocale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
      const html = document.documentElement;
      if (html) html.setAttribute("lang", next);
    } catch {}
  };

  const value = useMemo(() => ({ locale, setLocale }), [locale]);

  return (
    <LocaleContext.Provider value={value}>
      {ready ? (
        <IntlProvider locale={locale} messages={messages[locale]}>{children}</IntlProvider>
      ) : null}
    </LocaleContext.Provider>
  );
}

export const supportedLocales: { code: SupportedLocale; labelKey: string }[] = [
  { code: "en", labelKey: "locale.english" },
  { code: "hi", labelKey: "locale.hindi" },
  { code: "bn", labelKey: "locale.bengali" },
  { code: "as", labelKey: "locale.assamese" }
];



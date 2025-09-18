"use client";
import { useLocale, supportedLocales } from "@/i18n/LocaleProvider";
import { useIntl } from "react-intl";

export default function LocaleSwitcher() {
  const { locale, setLocale } = useLocale();
  const intl = useIntl();
  return (
    <div className="relative">
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as any)}
        className="px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/20 text-sm"
        aria-label={intl.formatMessage({ id: "locale.label", defaultMessage: "Language" })}
      >
        {supportedLocales.map((l) => {
          const label = intl.formatMessage({ id: l.labelKey, defaultMessage: l.code.toUpperCase() });
          return (
            <option key={l.code} value={l.code} className="text-slate-800">
              {label}
            </option>
          );
        })}
      </select>
    </div>
  );
}



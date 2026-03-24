"use client";

import { useLanguage } from "@/lib/i18n/context";
import type { Language } from "@/lib/i18n/translations";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <select
      value={lang}
      onChange={(e) => setLang(e.target.value as Language)}
      className="bg-glass-white border border-glass-border text-white text-sm rounded-lg px-3 py-2 cursor-pointer font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-accent-lighter"
      aria-label="Select language"
    >
      <option value="en" className="bg-navy-950 text-white">
        English
      </option>
      <option value="hi" className="bg-navy-950 text-white">
        हिंदी
      </option>
      <option value="te" className="bg-navy-950 text-white">
        తెలుగు
      </option>
    </select>
  );
}

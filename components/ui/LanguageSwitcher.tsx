"use client";

import { useLanguage } from "@/lib/context/LanguageContext";
import type { Language } from "@/lib/i18n/translations";

export default function LanguageSwitcher() {
  const { language: lang, setLanguage: setLang } = useLanguage();

  return (
    <select
      value={lang}
      onChange={(e) => setLang(e.target.value as Language)}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm rounded-lg px-3 py-2 cursor-pointer font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-brand-400"
      aria-label="Select language"
    >
      <option value="en" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
        English
      </option>
      <option value="hi" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
        हिंदी
      </option>
      <option value="te" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
        తెలుగు
      </option>
    </select>
  );
}

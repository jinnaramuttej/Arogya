"use client";

import Link from "next/link";
import { Globe, Hash, AtSign, Link2, MapPin, Phone, Mail, HeartPulse } from "lucide-react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n/context";
import { t } from "@/lib/i18n/translations";

export default function Footer() {
  const { lang } = useLanguage();
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="mt-16 pt-16 pb-8 px-[5%] bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* About */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <HeartPulse className="w-5 h-5 text-brand-600" />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("footerAbout", lang)}
            </h4>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
            {t("footerAboutText", lang)}
          </p>
          <div className="flex gap-4 mt-3">
            {[Globe, Hash, AtSign, Link2].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="text-gray-400 hover:text-brand-600 transition-colors hover:scale-110 transform"
                aria-label={Icon.displayName}
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t("footerQuickLinks", lang)}
          </h4>
          <div className="flex flex-col gap-2">
            {[
              { href: "/", label: t("navHome", lang) },
              { href: "/symptom", label: t("navSymptom", lang) },
              { href: "/book", label: t("navBook", lang) },
              { href: "/emergency", label: t("navEmergency", lang) },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-600 dark:text-gray-400 text-sm no-underline hover:text-brand-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t("footerContact", lang)}
          </h4>
          <div className="flex flex-col gap-3 text-gray-600 dark:text-gray-400 text-sm">
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-500" />
              123 Health St, Medicity
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-brand-500" />
              +1 (555) 123-4567
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-brand-500" />
              support@arogya.ai
            </p>
          </div>
        </div>
      </div>

      <div className="text-center mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 text-gray-500 text-sm">
        © 2025 Arogya. All rights reserved.
      </div>
    </footer>
  );
}

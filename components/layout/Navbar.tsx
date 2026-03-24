"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { HeartPulse, Home, Stethoscope, CalendarDays, Siren, LayoutDashboard, Menu, X, LogOut } from "lucide-react";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { useLanguage } from "@/lib/i18n/context";
import { t } from "@/lib/i18n/translations";
import { useUser } from "@/lib/hooks/useUser";
import { createClient } from "@/lib/supabase/client";

const navLinks = [
  { href: "/", labelKey: "navHome" as const, icon: Home },
  { href: "/symptom", labelKey: "navSymptom" as const, icon: Stethoscope },
  { href: "/book", labelKey: "navBook" as const, icon: CalendarDays },
  { href: "/emergency", labelKey: "navEmergency" as const, icon: Siren },
];

export default function Navbar() {
  const pathname = usePathname();
  const { lang } = useLanguage();
  const { user } = useUser();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 flex items-center justify-between px-[5%] transition-all duration-300 ${
          scrolled
            ? "py-3 bg-glass-white backdrop-blur-[15px] border-b border-glass-border shadow-lg"
            : "py-5"
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-white no-underline text-2xl font-semibold">
          <HeartPulse className="w-7 h-7 text-accent-lighter" />
          <span>{t("logo", lang)}</span>
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden md:flex items-center gap-6 list-none">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors relative pb-1 ${
                    active ? "text-white" : "text-white/80 hover:text-white"
                  }`}
                >
                  <link.icon className="w-4 h-4 text-accent-lighter" />
                  {t(link.labelKey, lang)}
                  {active && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent-lighter rounded-full" />
                  )}
                </Link>
              </li>
            );
          })}
          {user && (
            <li>
              <Link
                href="/dashboard"
                className={`flex items-center gap-2 text-sm font-medium transition-colors relative pb-1 ${
                  pathname === "/dashboard" ? "text-white" : "text-white/80 hover:text-white"
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-accent-lighter" />
                {t("navDashboard", lang)}
                {pathname === "/dashboard" && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent-lighter rounded-full" />
                )}
              </Link>
            </li>
          )}
        </ul>

        {/* Right area */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {user ? (
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-accent-light to-accent text-white text-sm font-semibold shadow-accent hover:shadow-accent-hover hover:-translate-y-0.5 transition-all cursor-pointer border-none"
            >
              <LogOut className="w-4 h-4" />
              {t("navLogout", lang)}
            </button>
          ) : (
            <Link
              href="/auth"
              className="hidden md:flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-accent-light to-accent text-white text-sm font-semibold shadow-accent hover:shadow-accent-hover hover:-translate-y-0.5 transition-all no-underline"
            >
              {t("navLogin", lang)}
            </Link>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white text-xl bg-transparent border-none cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile nav overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/80 backdrop-blur-[15px] flex flex-col items-center justify-center gap-8 transition-all duration-400 ${
          mobileOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
      >
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 text-xl font-medium no-underline ${
              pathname === link.href ? "text-white" : "text-white/80"
            }`}
          >
            <link.icon className="w-5 h-5 text-accent-lighter" />
            {t(link.labelKey, lang)}
          </Link>
        ))}
        {user && (
          <Link
            href="/dashboard"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 text-xl font-medium text-white/80 no-underline"
          >
            <LayoutDashboard className="w-5 h-5 text-accent-lighter" />
            {t("navDashboard", lang)}
          </Link>
        )}
        {user ? (
          <button
            onClick={() => {
              setMobileOpen(false);
              handleLogout();
            }}
            className="mt-4 px-8 py-3 rounded-full bg-gradient-to-r from-accent-light to-accent text-white font-semibold shadow-accent border-none cursor-pointer"
          >
            {t("navLogout", lang)}
          </button>
        ) : (
          <Link
            href="/auth"
            onClick={() => setMobileOpen(false)}
            className="mt-4 px-8 py-3 rounded-full bg-gradient-to-r from-accent-light to-accent text-white font-semibold shadow-accent no-underline"
          >
            {t("navLogin", lang)}
          </Link>
        )}
      </div>
    </>
  );
}

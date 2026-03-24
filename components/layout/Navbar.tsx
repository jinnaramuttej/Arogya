"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  HeartPulse,
  Stethoscope,
  Siren,
  LayoutDashboard,
  Menu,
  X,
  LogOut,
  Sun,
  Moon,
  Droplet,
  ShoppingBag,
} from "lucide-react";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { useLanguage } from "@/lib/i18n/context";
import { t } from "@/lib/i18n/translations";
import { useUser } from "@/lib/hooks/useUser";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/lib/theme/ThemeProvider";

const navLinks = [
  { href: "/symptom",   label: "AI Symptom Checker", icon: Stethoscope },
  { href: "/donor",     label: "Blood Donor",         icon: Droplet },
  { href: "/pharmacy",  label: "Pharmacy",            icon: ShoppingBag },
  { href: "/emergency", label: "Emergency",           icon: Siren    },
  { href: "/dashboard", label: "Records",             icon: LayoutDashboard },
];

export default function Navbar() {
  const pathname = usePathname();
  const { lang } = useLanguage();
  const { user } = useUser();
  const { theme, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (pathname.startsWith("/admin")) return null;

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

  const navBase =
    "fixed top-0 left-0 w-full z-50 flex items-center justify-between px-[4%] transition-all duration-300";
  const navScrolled = scrolled
    ? "py-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 shadow-sm"
    : "py-5 bg-white dark:bg-slate-900";

  return (
    <>
      <nav className={`${navBase} ${navScrolled}`}>
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 no-underline text-brand-600 dark:text-brand-400 text-xl font-bold"
        >
          <HeartPulse className="w-7 h-7" />
          <span>Arogya</span>
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden lg:flex items-center gap-1 list-none">
          {navLinks.map((link) => {
            const active = pathname === link.href && link.label !== "Blood Donor" && link.label !== "Pharmacy";
            return (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors no-underline ${
                    active
                      ? "bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-brand-600 dark:hover:text-brand-400"
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right area */}
        <div className="flex items-center gap-2">
          {/* Language */}
          <LanguageSwitcher />

          {/* Dark / Light toggle */}
          <button
            onClick={toggle}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer bg-transparent"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          {/* Login / Logout */}
          {user ? (
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors cursor-pointer border-none shadow-brand"
            >
              <LogOut className="w-4 h-4" />
              {t("navLogout", lang)}
            </button>
          ) : (
            <Link
              href="/auth"
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors no-underline shadow-brand"
            >
              {t("navLogin", lang)}
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-transparent cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile nav drawer */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 ${
          mobileOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
        {/* Drawer panel */}
        <div
          className={`absolute top-0 right-0 h-full w-72 bg-white dark:bg-slate-900 shadow-xl flex flex-col pt-24 pb-8 px-6 transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium no-underline transition-colors ${
                  pathname === link.href
                    ? "bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto flex flex-col gap-3">
            {user ? (
              <button
                onClick={() => { setMobileOpen(false); handleLogout(); }}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm border-none cursor-pointer transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {t("navLogout", lang)}
              </button>
            ) : (
              <Link
                href="/auth"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center px-4 py-3 rounded-full bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm no-underline transition-colors"
              >
                {t("navLogin", lang)}
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

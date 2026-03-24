"use client";
import { useState, useEffect, useMemo } from "react";
import { motion, useScroll, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronDown, Activity, Menu, ShoppingCart, X, Languages } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useLanguage } from "@/lib/context/LanguageContext";
import { translations, Language } from "@/lib/i18n/translations";
import { useUser } from "@/lib/hooks/useUser";
import { createClient } from "@/lib/supabase/client";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const { count } = useCart();
  const { user, loading: userLoading } = useUser();
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    }
    return "light";
  });

  const { scrollY } = useScroll();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!userLoading) {
      if (user) {
        setLoggedIn(true);
        const name = user.user_metadata?.full_name || user.user_metadata?.name;
        if (name) {
          setUserName(name);
        } else {
          setUserName(localStorage.getItem("az_user_name"));
        }
      } else {
        setLoggedIn(false);
        setUserName(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("az_logged_in");
        }
      }
    }
  }, [user, userLoading]);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleThemeChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setTheme(e.target.checked ? "light" : "dark");
  const toggleMobile = () => setMobileOpen(prev => !prev);

  const isDark = theme === "dark";
  const navText = scrolled || !isDark ? "text-foreground" : "text-white";
  const navMuted = scrolled || !isDark ? "text-muted-foreground" : "text-white/75";
  const navHover = scrolled || !isDark ? "hover:text-primary" : "hover:text-white";
  const navBorder = scrolled ? "border-border/40" : (isDark ? "border-white/15" : "border-black/5");
  const navBg = scrolled
    ? "bg-background/85 shadow-[0_12px_30px_rgba(15,23,42,0.18)]"
    : (isDark ? "bg-white/10 shadow-[0_14px_40px_rgba(0,0,0,0.35)]" : "bg-white/50 shadow-[0_10px_30px_rgba(0,0,0,0.05)]");
  const dropdownBg = scrolled ? "bg-card border-border/50" : (isDark ? "bg-black/85 border-white/10" : "bg-white/90 border-black/5");
  const dropdownText = scrolled || !isDark ? "text-foreground" : "text-white";
  const dropdownMuted = scrolled || !isDark ? "text-muted-foreground" : "text-white/60";
  const controlBg = scrolled || !isDark ? "bg-muted/50 text-muted-foreground hover:text-primary" : "bg-white/10 text-white/80 hover:text-white";
  const { language, setLanguage, t } = useLanguage();
  const [langOpen, setLangOpen] = useState(false);

  const firstName = useMemo(() => {
    if (!userName) return null;
    return userName.split(" ")[0];
  }, [userName]);

  const languages: { code: Language; name: string }[] = [
    { code: "en", name: "English" },
    { code: "hi", name: "Hindi" },
    { code: "te", name: "Telugu" }
  ];

  // Helper because Hindi and Telugu might be undefined in the literal if not quoted correctly in the mapping or if I just want to match the screenshot style
  const langDisplay: Record<Language, string> = {
    en: "English",
    hi: "हिंदी (Hindi)",
    te: "తెలుగు (Telugu)"
  };

  return (
    <motion.nav
      className="fixed top-4 left-0 right-0 z-50 w-full px-4 lg:px-6 transition-all duration-300"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="container mx-auto relative">
        <div className={`flex items-center justify-between rounded-[2rem] border px-5 py-3 backdrop-blur-xl ${navBg} ${navBorder}`}>
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="h-10 w-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 ring-1 ring-white/20">
              <Activity className="text-white w-6 h-6" />
            </div>
            <span className={`font-heading text-2xl font-extrabold tracking-tight ${navText}`}>
              Arogya<span className="text-primary">Zenith</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-8 flex-1 justify-center order-2">
            {[
              { name: t("nav_dashboard"), path: "/dashboard" },
              { name: t("nav_symptoms"), path: "/symptom" },
              { name: t("nav_emergency"), path: "/ambulance" },
              { name: t("nav_blood"), path: "/blood" },
              { name: t("nav_records"), path: "/records" }
            ].map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`text-sm font-semibold transition-all duration-300 ${navMuted} ${navHover} nav-link-shimmer`}
              >
                {link.name}
              </Link>
            ))}

            <div className="relative group">
              <button 
                className={`text-sm font-semibold transition-all duration-300 flex items-center gap-1 ${navMuted} ${navHover}`}
              >
                More <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
              </button>
              
              <div className={`absolute top-full -left-4 mt-3 w-60 border rounded-3xl shadow-2xl p-3 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-[100] ${dropdownBg} before:content-[''] before:absolute before:-top-3 before:left-0 before:right-0 before:h-3`}>
                {[
                  { name: t("nav_store") || "Pharmacy", path: "/store", desc: "Medicines and health devices" },
                  { name: "Profile", path: "/profile", desc: "Patient details and logout" }
                ].map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`block p-3 rounded-2xl transition-all ${scrolled ? "hover:bg-muted" : "hover:bg-white/10"}`}
                  >
                    <p className={`text-sm font-bold ${dropdownText} nav-link-shimmer`}>{item.name}</p>
                    <p className={`text-[10px] ${dropdownMuted}`}>{item.desc}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 order-3">
            {/* Language Selector */}
            <div className="relative">
              <button 
                onClick={() => setLangOpen(!langOpen)}
                className={`h-10 px-4 rounded-2xl border border-border/60 bg-card/70 flex items-center gap-2 text-sm font-semibold transition-all hover:bg-muted ${navText}`}
                aria-expanded={langOpen ? "true" : "false"}
                aria-haspopup="listbox"
                title="Select Language"
              >
                <span>{langDisplay[language]}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${langOpen ? "rotate-180" : ""}`} />
              </button>
              
              <AnimatePresence>
                {langOpen && (
                  <>
                    <div className="fixed inset-0 z-[-1]" onClick={() => setLangOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className={`absolute top-full right-0 mt-3 w-48 border rounded-2xl shadow-2xl p-2 z-[110] ${dropdownBg}`}
                    >
                      {(["en", "hi", "te"] as Language[]).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => {
                            setLanguage(lang);
                            setLangOpen(false);
                          }}
                          className={`w-full text-left p-3 rounded-xl transition-all text-sm font-medium ${
                            language === lang 
                              ? "bg-primary text-white" 
                              : (scrolled || !isDark ? "hover:bg-muted text-foreground" : "hover:bg-white/10 text-white")
                          }`}
                        >
                          {langDisplay[lang]}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/cart"
              className="relative h-10 w-10 rounded-2xl border border-border/60 bg-card/70 flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition"
              aria-label="Open cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
            
            <label className="switch hidden sm:inline-block scale-75 origin-right" aria-label="Toggle theme">
              <input
                type="checkbox"
                checked={theme === "light"}
                onChange={handleThemeChange}
              />
              <span className="slider">
                <span className="star star_1"></span>
                <span className="star star_2"></span>
                <span className="star star_3"></span>
                <svg viewBox="0 0 16 16" className="cloud">
                  <path
                    transform="matrix(.77976 0 0 .78395-299.99-418.63)"
                    fill="#fff"
                    d="m391.84 540.91c-.421-.329-.949-.524-1.523-.524-1.351 0-2.451 1.084-2.485 2.435-1.395.526-2.388 1.88-2.388 3.466 0 1.874 1.385 3.423 3.182 3.667v.034h12.73v-.006c1.775-.104 3.182-1.584 3.182-3.395 0-1.747-1.309-3.186-2.994-3.379.007-.106.011-.214.011-.322 0-2.707-2.271-4.901-5.072-4.901-2.073 0-3.856 1.202-4.643 2.925"
                  ></path>
                </svg>
              </span>
            </label>

          {firstName ? (
            <div className="hidden lg:flex items-center gap-4">
              <span className={`text-sm font-semibold ${navText}`}>
                Hi, {firstName}
              </span>
              <button 
                onClick={async () => {
                   const supabase = createClient();
                   await supabase.auth.signOut();
                   window.location.href = "/";
                }}
                className={`text-sm font-bold transition-colors ${navMuted} ${navHover}`}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link href="/auth" className={`hidden lg:inline-flex text-sm font-bold transition-colors ${navMuted} ${navHover}`}>
              Login
            </Link>
          )}
            {!loggedIn && (
              <Link href="/auth" className="btn-orange hidden md:flex items-center shadow-orange-500/20">
                Get Started
              </Link>
            )}
            <button
              onClick={toggleMobile}
              className={`lg:hidden w-10 h-10 flex items-center justify-center rounded-2xl transition-all ${controlBg}`}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen ? "true" : "false"}
              title={t("nav_home")}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

        </div>

        <AnimatePresence>
          {mobileOpen && (
            <div className="fixed inset-0 z-[60] lg:hidden pointer-events-none">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className={`absolute inset-x-4 top-10 bottom-10 rounded-[2.5rem] border shadow-2xl p-8 flex flex-col items-center justify-center overflow-hidden pointer-events-auto ${dropdownBg}`}
              >
                <div className="absolute top-8 left-10 right-10 flex items-center justify-between">
                  <span className={`font-heading text-xl font-extrabold tracking-tight ${dropdownText}`}>
                    Arogya<span className="text-primary">Zenith</span>
                  </span>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${controlBg}`}
                    title="Close menu"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex flex-col gap-6 items-center w-full max-w-xs">
                  {[
                    { name: t("nav_home"), path: "/" },
                    { name: t("nav_dashboard"), path: "/dashboard" },
                    { name: t("nav_symptoms"), path: "/symptom" },
                    { name: t("nav_emergency"), path: "/ambulance" },
                    { name: t("nav_blood"), path: "/blood" },
                    { name: "Profile", path: "/profile" }
                  ].map((link, i) => (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="w-full"
                    >
                      <Link
                        href={link.path}
                        onClick={() => setMobileOpen(false)}
                        className={`block text-center text-xl font-bold transition-all py-2 ${dropdownText} hover:text-primary`}
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  ))}
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="w-full mt-4"
                  >
                    {!loggedIn ? (
                      <Link
                        href="/auth"
                        onClick={() => setMobileOpen(false)}
                        className="btn-orange w-full block text-center py-4 rounded-3xl"
                      >
                        Get Started
                      </Link>
                    ) : (
                      <button
                        onClick={async () => {
                          const supabase = createClient();
                          await supabase.auth.signOut();
                          window.location.href = "/";
                        }}
                        className="btn-orange w-full block text-center py-4 rounded-3xl bg-destructive text-white"
                      >
                        Sign Out
                      </button>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;

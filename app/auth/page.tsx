"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { HeartPulse, ArrowLeft, Mail, Lock, User } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { t } from "@/lib/i18n/translations";
import { createClient } from "@/lib/supabase/client";

export default function AuthPage() {
  const { lang } = useLanguage();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/dashboard");
      } else {
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (error) throw error;
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  };

  const inputClass =
    "w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 -mt-24 pt-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-card p-8 sm:p-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <HeartPulse className="w-10 h-10 text-red-500 mx-auto mb-2" />
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{t("logo", lang)}</h1>
          <p className="text-gray-500 text-sm">{t("logoSubtitle", lang)}</p>
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-6">
          {isLogin ? t("loginTitle", lang) : t("signupTitle", lang)}
        </h2>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="text-gray-700 dark:text-gray-300 text-sm mb-1 block">{t("nameLabel", lang)}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("namePlaceholder", lang)}
                  required={!isLogin}
                  className={inputClass}
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-gray-700 dark:text-gray-300 text-sm mb-1 block">{t("emailLabel", lang)}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder", lang)}
                required
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="text-gray-700 dark:text-gray-300 text-sm mb-1 block">{t("passwordLabel", lang)}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("passwordPlaceholder", lang)}
                required
                className={inputClass}
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="text-gray-700 dark:text-gray-300 text-sm mb-1 block">{t("confirmPasswordLabel", lang)}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t("confirmPasswordPlaceholder", lang)}
                  required={!isLogin}
                  className={inputClass}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold shadow-brand hover:shadow-brand-hover transition-all disabled:opacity-50 cursor-pointer border-none"
          >
            {loading ? "..." : isLogin ? t("loginBtn", lang) : t("signupBtn", lang)}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          <span className="text-gray-400 text-xs">{t("orContinue", lang)}</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Google */}
        <button
          onClick={handleGoogleLogin}
          className="w-full py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Google
        </button>

        {/* Toggle */}
        <p className="text-center text-gray-500 text-sm mt-6">
          {isLogin ? t("noAccount", lang) : t("haveAccount", lang)}{" "}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(""); }}
            className="text-red-500 font-medium bg-transparent border-none cursor-pointer"
          >
            {isLogin ? t("signupLink", lang) : t("loginLink", lang)}
          </button>
        </p>

        <Link
          href="/"
          className="mt-4 flex items-center justify-center gap-2 text-gray-400 text-sm hover:text-gray-700 transition-colors no-underline"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("backHome", lang)}
        </Link>
      </motion.div>
    </div>
  );
}

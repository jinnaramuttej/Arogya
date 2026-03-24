"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { HeartPulse, ArrowLeft, Mail, Lock, User } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { t } from "@/lib/i18n/translations";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/hooks/useUser";

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
  const { user, loading: userLoading } = useUser();

  useEffect(() => {
    if (user && !userLoading) {
      router.push("/dashboard");
    }
  }, [user, userLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        // 2nd Step Authentication check
        if (data?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('face_descriptor')
            .eq('id', data.user.id)
            .single();
            
          if (profile?.face_descriptor) {
            sessionStorage.setItem('needs_2fa', 'true');
            router.push(`/verify?mode=2fa`);
            return;
          }
        }
        
        router.push("/dashboard");
      } else {
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (error) throw error;

        // Sync signup to profiles table for admin visibility
        if (data.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: email,
            name: name,
            role: 'patient',
            created_at: new Date().toISOString(),
          }, { onConflict: 'id' });

          // Also create the patient record so they appear in Patient Management
          // Generate a random 5-digit ID (10000-99999)
          const randomPatientId = Math.floor(10000 + Math.random() * 90000);
          await supabase.from('patients').upsert({
            user_id: data.user.id,
            patient_id: randomPatientId,
            name: name,
            created_at: new Date().toISOString(),
          }, { onConflict: 'patient_id' });
        }

        // If Supabase returned a session (email confirm disabled), go to dashboard
        // If no session (email confirm enabled), auto-sign-in immediately
        if (!data.session) {
          const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          if (signInError) {
            // If auto-sign-in fails, it could be email confirmation is enforced
            setError("Account created! Please check your email to confirm, then sign in.");
            setIsLogin(true);
            setLoading(false);
            return;
          }
        }

        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred";
      // Make common Supabase auth errors more user-friendly
      if (msg.includes("Invalid login") || msg.includes("invalid_credentials")) {
        setError("Invalid email or password. Please try again.");
      } else if (msg.includes("Email not confirmed") || msg.includes("email_not_confirmed")) {
        setError("Please confirm your email before logging in. Check your inbox.");
      } else if (msg.includes("User already registered")) {
        setError("This email is already registered. Please sign in instead.");
        setIsLogin(true);
      } else if (msg.includes("422")) {
        setError("Sign-in failed. Your email may not be confirmed yet — check your inbox.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
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

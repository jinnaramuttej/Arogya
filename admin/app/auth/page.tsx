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

        router.push("/dashboard");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center px-4 -mt-24 pt-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="glass p-8 sm:p-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <HeartPulse className="w-10 h-10 text-accent-lighter mx-auto mb-2" />
          <h1 className="text-2xl font-semibold text-white">{t("logo", lang)}</h1>
          <p className="text-white/60 text-sm">{t("logoSubtitle", lang)}</p>
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-white text-center mb-6">
          {isLogin ? t("loginTitle", lang) : t("signupTitle", lang)}
        </h2>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-danger/20 border border-danger/30 text-danger-light text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="text-white/80 text-sm mb-1 block">{t("nameLabel", lang)}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("namePlaceholder", lang)}
                  required={!isLogin}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-glass-border rounded-xl text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent-lighter"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-white/80 text-sm mb-1 block">{t("emailLabel", lang)}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder", lang)}
                required
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-glass-border rounded-xl text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent-lighter"
              />
            </div>
          </div>

          <div>
            <label className="text-white/80 text-sm mb-1 block">{t("passwordLabel", lang)}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("passwordPlaceholder", lang)}
                required
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-glass-border rounded-xl text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent-lighter"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="text-white/80 text-sm mb-1 block">{t("confirmPasswordLabel", lang)}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t("confirmPasswordPlaceholder", lang)}
                  required={!isLogin}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-glass-border rounded-xl text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent-lighter"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-gradient-to-r from-accent-light to-accent text-white font-semibold shadow-accent hover:shadow-accent-hover hover:-translate-y-0.5 transition-all disabled:opacity-50 cursor-pointer border-none"
          >
            {loading ? "..." : isLogin ? t("loginBtn", lang) : t("signupBtn", lang)}
          </button>
        </form>



        {/* Toggle */}
        <p className="text-center text-white/60 text-sm mt-6">
          {isLogin ? t("noAccount", lang) : t("haveAccount", lang)}{" "}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(""); }}
            className="text-accent-lighter font-medium bg-transparent border-none cursor-pointer"
          >
            {isLogin ? t("signupLink", lang) : t("loginLink", lang)}
          </button>
        </p>

        <Link
          href="/"
          className="mt-4 flex items-center justify-center gap-2 text-white/50 text-sm hover:text-white/80 transition-colors no-underline"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("backHome", lang)}
        </Link>
      </motion.div>
    </div>
  );
}

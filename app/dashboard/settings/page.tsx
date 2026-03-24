"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Camera, Save, Loader2, Link as LinkIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/hooks/useUser";
import { t } from "@/lib/i18n/translations";
import { useLanguage } from "@/lib/i18n/context";
import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";

export default function DashboardSettings() {
  const { lang } = useLanguage();
  const { user, loading: userLoading } = useUser();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [hasFaceId, setHasFaceId] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      // Fetch profile data
      const fetchProfile = async () => {
        const supabase = createClient();
        const { data } = await supabase
          .from("profiles")
          .select("name, face_descriptor")
          .eq("id", user.id)
          .single();

        if (data) {
          setName(data.name || "");
          setHasFaceId(!!data.face_descriptor);
        }
      };
      fetchProfile();
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setStatusMsg("");

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ name })
      .eq("id", user.id);

    setSaving(false);
    if (error) {
      setStatusMsg("Error updating profile: " + error.message);
    } else {
      setStatusMsg("Profile updated successfully!");
      setTimeout(() => setStatusMsg(""), 3000);
    }
  };

  if (userLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="px-4 py-8 max-w-4xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your personal information and security preferences.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column - Profile Form */}
        <div className="md:col-span-2 space-y-6">
          <GlassCard noHover>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Personal Details</h2>
            <form onSubmit={handleSave} className="space-y-5">
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address (Read-only)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/50 text-gray-500 cursor-not-allowed outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow"
                  />
                </div>
              </div>

              {statusMsg && (
                <div className={`p-3 rounded-lg text-sm font-semibold ${statusMsg.includes("Error") ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}>
                  {statusMsg}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save Changes
                </button>
              </div>
            </form>
          </GlassCard>
        </div>

        {/* Right Column - Security & Biometrics */}
        <div className="space-y-6">
          <GlassCard noHover>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Security</h2>
            
            <div className="p-5 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Face ID Authentication</h3>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Securely log into your account without a password using your webcam.
              </p>

              {hasFaceId ? (
                <div className="flex flex-col gap-3">
                  <span className="inline-flex items-center justify-center py-2 px-3 text-sm font-semibold rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                    <User className="w-4 h-4 mr-2" />
                    Biometrics Registered & Locked
                  </span>
                  <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Your face is permanently mapped for security. Contact an admin to request a reset.
                  </p>
                </div>
              ) : (
                <Link
                  href="/verify?mode=register"
                  className="w-full flex justify-center items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-brand-600 dark:hover:bg-brand-700 text-white text-sm font-semibold rounded-lg transition-colors no-underline shadow-md"
                >
                  <LinkIcon className="w-4 h-4" />
                  Map My Face Now
                </Link>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Phone, MapPin, Droplet, CheckCircle, Loader2 } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { useLanguage } from "@/lib/i18n/context";
import { t } from "@/lib/i18n/translations";
import { createClient } from "@/lib/supabase/client";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"] as const;

interface FormData {
  name: string;
  blood_group: string;
  phone: string;
  lat: number | null;
  lng: number | null;
}

export default function DonorForm() {
  const { lang } = useLanguage();
  const [form, setForm] = useState<FormData>({
    name: "",
    blood_group: "",
    phone: "",
    lat: null,
    lng: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>("");

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }));
        setLocationStatus("📍 Location detected");
      },
      () => {
        setLocationStatus("⚠ Using default location");
        setForm((prev) => ({ ...prev, lat: 17.385, lng: 78.487 }));
      }
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.blood_group || !form.phone) return;

    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { error: insertError } = await supabase.from("donors").insert([
      {
        name: form.name,
        blood_group: form.blood_group,
        phone: form.phone,
        lat: form.lat,
        lng: form.lng,
      },
    ]);

    if (insertError) {
      setError(insertError.message);
    } else {
      setSuccess(true);
      setForm({ name: "", blood_group: "", phone: "", lat: form.lat, lng: form.lng });
    }
    setSubmitting(false);
  };

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <GlassCard noHover className="text-center py-10">
          <CheckCircle className="w-12 h-12 text-success-light mx-auto mb-4" />
          <h3 className="text-gray-900 dark:text-white font-semibold text-lg mb-2">{t("registerSuccess", lang)}</h3>
          <button
            onClick={() => setSuccess(false)}
            className="mt-4 px-6 py-2 rounded-full bg-brand-600 text-white text-sm font-semibold cursor-pointer border-none transition-all shadow-brand hover:shadow-brand-hover hover:bg-brand-700 hover:-translate-y-0.5"
          >
            {t("registerDonor", lang)}
          </button>
        </GlassCard>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <GlassCard noHover>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-gray-600 dark:text-gray-400 text-sm mb-1.5 block">{t("donorName", lang)}</label>
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5">
              <User className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={t("donorName", lang)}
                required
                className="bg-transparent text-gray-900 dark:text-white text-sm w-full outline-none placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
          </div>

          {/* Blood Group */}
          <div>
            <label className="text-gray-600 dark:text-gray-400 text-sm mb-1.5 block">{t("bloodGroup", lang)}</label>
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5">
              <Droplet className="w-4 h-4 text-brand-500 shrink-0" />
              <select
                value={form.blood_group}
                onChange={(e) => setForm({ ...form, blood_group: e.target.value })}
                required
                className="bg-transparent text-gray-900 dark:text-white text-sm w-full outline-none cursor-pointer appearance-none"
              >
                <option value="" className="bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  {t("bloodGroup", lang)}
                </option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                    {bg}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="text-gray-600 dark:text-gray-400 text-sm mb-1.5 block">{t("donorPhone", lang)}</label>
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5">
              <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder={t("donorPhone", lang)}
                required
                className="bg-transparent text-gray-900 dark:text-white text-sm w-full outline-none placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
          </div>

          {/* Location Status */}
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs">
            <MapPin className="w-3.5 h-3.5" />
            {locationStatus || "Detecting location..."}
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-xl bg-danger/20 border border-danger/30 text-danger-light text-sm text-center">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-brand-600 text-white hover:bg-brand-700 font-semibold text-sm cursor-pointer border-none transition-all shadow-brand hover:shadow-brand-hover hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Droplet className="w-4 h-4" />
            )}
            {t("registerDonor", lang)}
          </button>
        </form>
      </GlassCard>
    </motion.div>
  );
}

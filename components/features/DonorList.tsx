"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Droplet, Search, Bell, CheckCircle, Clock, Loader2 } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import DonorCard from "@/components/features/DonorCard";
import type { Donor } from "@/components/features/DonorCard";
import { useLanguage } from "@/lib/i18n/context";
import { t } from "@/lib/i18n/translations";
import { createClient } from "@/lib/supabase/client";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"] as const;

type NotifStage = "idle" | "sending" | "sent" | "responded" | "confirmed";

export default function DonorList() {
  const { lang } = useLanguage();
  const [selectedGroup, setSelectedGroup] = useState("");
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [userLat, setUserLat] = useState<number | undefined>();
  const [userLng, setUserLng] = useState<number | undefined>();
  const [notifStage, setNotifStage] = useState<NotifStage>("idle");

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
      },
      () => {
        setUserLat(17.385);
        setUserLng(78.487);
      }
    );
  }, []);

  const searchDonors = useCallback(async () => {
    if (!selectedGroup) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    setNotifStage("idle");

    const supabase = createClient();
    const { data, error: fetchError } = await supabase
      .from("donors")
      .select("*")
      .eq("blood_group", selectedGroup);

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setDonors((data as Donor[]) || []);
    }
    setLoading(false);
  }, [selectedGroup]);

  const handleRequestBlood = () => {
    setNotifStage("sending");

    setTimeout(() => {
      setNotifStage("sent");
    }, 1500);

    setTimeout(() => {
      setNotifStage("responded");
    }, 4500);

    setTimeout(() => {
      setNotifStage("confirmed");
    }, 6500);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Search bar */}
      <GlassCard noHover>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 flex-1">
            <Droplet className="w-4 h-4 text-brand-500 shrink-0" />
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
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
          <button
            onClick={searchDonors}
            disabled={!selectedGroup || loading}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold cursor-pointer border-none transition-all shadow-brand hover:shadow-brand-hover hover:-translate-y-0.5 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            {t("searchDonors", lang)}
          </button>
        </div>
      </GlassCard>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-xl bg-danger/20 border border-danger/30 text-danger-light text-sm text-center">
          {error}
        </div>
      )}

      {/* Results */}
      {searched && !loading && donors.length === 0 && !error && (
        <GlassCard noHover className="text-center py-8">
          <Droplet className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">{t("noDonorsFound", lang)}</p>
        </GlassCard>
      )}

      {donors.length > 0 && (
        <>
          <div className="space-y-3">
            {donors.map((donor) => (
              <DonorCard key={donor.id} donor={donor} userLat={userLat} userLng={userLng} />
            ))}
          </div>

          {/* Request Blood + Notification simulation */}
          <div className="space-y-3">
            {notifStage === "idle" && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleRequestBlood}
                className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm cursor-pointer border-none transition-all shadow-brand hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <Bell className="w-4 h-4" />
                {t("requestBlood", lang)}
              </motion.button>
            )}

            {notifStage === "sending" && (
              <GlassCard noHover className="text-center py-4">
                <Loader2 className="w-5 h-5 text-brand-500 animate-spin mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-300 text-sm">{t("alertSent", lang)}...</p>
              </GlassCard>
            )}

            {notifStage === "sent" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <GlassCard noHover className="text-center py-4 border-brand-200 dark:border-brand-800">
                  <Bell className="w-5 h-5 text-brand-500 mx-auto mb-2" />
                  <p className="text-brand-600 dark:text-brand-400 text-sm font-medium">{t("alertSent", lang)}</p>
                </GlassCard>
              </motion.div>
            )}

            {notifStage === "responded" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <GlassCard noHover className="text-center py-4 border-success/30">
                  <CheckCircle className="w-5 h-5 text-success-light mx-auto mb-2" />
                  <p className="text-success-light text-sm font-medium">{t("donorsResponded", lang)}</p>
                </GlassCard>
              </motion.div>
            )}

            {notifStage === "confirmed" && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <GlassCard noHover className="text-center py-6 border-success/30">
                  <CheckCircle className="w-8 h-8 text-success-light mx-auto mb-3" />
                  <p className="text-success-light font-semibold mb-1">{t("donorConfirmed", lang)}</p>
                  <div className="flex items-center justify-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm">
                    <Clock className="w-3.5 h-3.5" />
                    {t("donorETA", lang)}
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}

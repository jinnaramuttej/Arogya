"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  AlertTriangle, Ambulance, Hospital, MapPin, Phone,
  Flame, ShieldAlert, HeartPulse, Wind, Thermometer,
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { useLanguage } from "@/lib/i18n/context";
import { t } from "@/lib/i18n/translations";

const EmergencyMap = dynamic(() => import("@/components/features/EmergencyMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] rounded-2xl bg-glass-white flex items-center justify-center text-white/60">
      Loading map...
    </div>
  ),
});

const emergencyContacts = [
  { labelKey: "ambulanceService" as const, descKey: "ambulanceServiceDesc" as const, number: "108", icon: Ambulance, color: "text-danger-light" },
  { labelKey: "police" as const, descKey: "policeDesc" as const, number: "100", icon: ShieldAlert, color: "text-accent-lighter" },
  { labelKey: "fireService" as const, descKey: "fireServiceDesc" as const, number: "101", icon: Flame, color: "text-warning-light" },
  { labelKey: "womenHelpline" as const, descKey: "womenHelplineDesc" as const, number: "1091", icon: Phone, color: "text-accent-light" },
];

const actionCards = [
  { labelKey: "callAmbulance" as const, descKey: "ambulanceDesc" as const, btnKey: "callNow" as const, icon: Ambulance, color: "text-danger-light", action: () => window.open("tel:108") },
  { labelKey: "findHospital" as const, descKey: "hospitalDesc" as const, btnKey: "locateNow" as const, icon: Hospital, color: "text-success-light", action: () => document.getElementById("map-section")?.scrollIntoView({ behavior: "smooth" }) },
  { labelKey: "shareLocation" as const, descKey: "locationDesc" as const, btnKey: "shareNow" as const, icon: MapPin, color: "text-accent-lighter", action: () => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      const url = `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;
      if (navigator.share) navigator.share({ title: "My Location", url });
      else window.open(url);
    });
  }},
  { labelKey: "emergencyContact" as const, descKey: "contactDesc" as const, btnKey: "contactNow" as const, icon: Phone, color: "text-warning-light", action: () => window.open("tel:108") },
];

const firstAidTips = [
  {
    titleKey: "heartAttack" as const,
    icon: HeartPulse,
    color: "text-danger-light",
    tips: ["heartTip1", "heartTip2", "heartTip3", "heartTip4"] as const,
  },
  {
    titleKey: "choking" as const,
    icon: Wind,
    color: "text-accent-lighter",
    tips: ["chokingTip1", "chokingTip2", "chokingTip3", "chokingTip4"] as const,
  },
  {
    titleKey: "fever" as const,
    icon: Thermometer,
    color: "text-warning-light",
    tips: ["feverTip1", "feverTip2", "feverTip3", "feverTip4"] as const,
  },
];

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function EmergencyPage() {
  const { lang } = useLanguage();
  const [sosActive, setSosActive] = useState(false);

  const handleSOS = () => {
    setSosActive(true);
    window.open("tel:108");
    setTimeout(() => setSosActive(false), 3000);
  };

  return (
    <div className="px-4 sm:px-6 py-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-semibold text-white">{t("emergencyTitle", lang)}</h1>
        <p className="text-white/70 mt-2">{t("emergencySubtitle", lang)}</p>
      </motion.div>

      {/* SOS */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col items-center mb-12"
      >
        <button
          onClick={handleSOS}
          className={`w-28 h-28 rounded-full bg-danger flex items-center justify-center border-none cursor-pointer transition-transform hover:scale-105 ${
            sosActive ? "" : "sos-pulse"
          }`}
          aria-label="SOS Emergency"
        >
          <AlertTriangle className="w-12 h-12 text-white" />
        </button>
        <p className="text-white/80 mt-4 text-sm font-medium">{t("sosText", lang)}</p>
      </motion.div>

      {/* Action cards */}
      <motion.div variants={container} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
        {actionCards.map((card) => (
          <motion.div key={card.labelKey} variants={item}>
            <GlassCard className="text-center cursor-pointer" onClick={card.action}>
              <card.icon className={`w-10 h-10 mx-auto mb-3 ${card.color}`} />
              <h3 className="text-white font-semibold mb-1">{t(card.labelKey, lang)}</h3>
              <p className="text-white/60 text-xs mb-3">{t(card.descKey, lang)}</p>
              <span className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-accent-light to-accent text-white text-xs font-semibold">
                {t(card.btnKey, lang)}
              </span>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Emergency numbers */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold text-white text-center mb-8">{t("emergencyNumbers", lang)}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {emergencyContacts.map((c) => (
            <GlassCard key={c.number} noHover className="text-center">
              <c.icon className={`w-8 h-8 mx-auto mb-2 ${c.color}`} />
              <div className="text-white/70 text-sm">{t(c.labelKey, lang)}</div>
              <div className="text-3xl font-semibold text-white my-2">{c.number}</div>
              <div className="text-white/50 text-xs">{t(c.descKey, lang)}</div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Map */}
      <section id="map-section" className="mb-16">
        <h2 className="text-2xl font-semibold text-white text-center mb-8">{t("nearbyHospitals", lang)}</h2>
        <GlassCard noHover className="!p-0 overflow-hidden">
          <EmergencyMap />
        </GlassCard>
      </section>

      {/* First Aid Tips */}
      <section>
        <h2 className="text-2xl font-semibold text-white text-center mb-8">{t("firstAidTips", lang)}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {firstAidTips.map((tip) => (
            <GlassCard key={tip.titleKey} noHover>
              <div className="flex items-center gap-3 mb-4">
                <tip.icon className={`w-6 h-6 ${tip.color}`} />
                <h3 className="text-lg font-semibold text-white">{t(tip.titleKey, lang)}</h3>
              </div>
              <ul className="space-y-2">
                {tip.tips.map((tipKey) => (
                  <li key={tipKey} className="text-white/80 text-sm flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-lighter mt-1.5 shrink-0" />
                    {t(tipKey, lang)}
                  </li>
                ))}
              </ul>
            </GlassCard>
          ))}
        </div>
      </section>
    </div>
  );
}

"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Ambulance,
  Droplet,
  Flame,
  HeartPulse,
  Hospital,
  MapPin,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Thermometer,
  Wind,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import EmergencyTimeline from "@/components/features/EmergencyTimeline";
import SOSOverlay from "@/components/features/SOSOverlay";
import GlassCard from "@/components/ui/GlassCard";
import SOSButton from "@/components/ui/SOSButton";
import { useLanguage } from "@/lib/i18n/context";
import { t } from "@/lib/i18n/translations";

interface Coords {
  lat: number;
  lng: number;
}

interface ActionCard {
  labelKey:
    | "callAmbulance"
    | "findHospital"
    | "shareLocation"
    | "emergencyContact";
  descKey:
    | "ambulanceDesc"
    | "hospitalDesc"
    | "locationDesc"
    | "contactDesc";
  btnKey:
    | "callNow"
    | "locateNow"
    | "shareNow"
    | "contactNow";
  icon: LucideIcon;
  color: string;
  action: () => void | Promise<void>;
}

const FALLBACK_COORDS: Coords = { lat: 17.385, lng: 78.4867 };

const emergencyContacts = [
  {
    labelKey: "ambulanceService" as const,
    descKey: "ambulanceServiceDesc" as const,
    number: "108",
    icon: Ambulance,
    color: "text-danger-light",
  },
  {
    labelKey: "police" as const,
    descKey: "policeDesc" as const,
    number: "100",
    icon: ShieldAlert,
    color: "text-accent-lighter",
  },
  {
    labelKey: "fireService" as const,
    descKey: "fireServiceDesc" as const,
    number: "101",
    icon: Flame,
    color: "text-warning-light",
  },
  {
    labelKey: "womenHelpline" as const,
    descKey: "womenHelplineDesc" as const,
    number: "1091",
    icon: Phone,
    color: "text-accent-light",
  },
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
const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function getShareLocation(): Promise<Coords> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation unavailable"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => reject(new Error("Unable to access location")),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  });
}

function EmergencyContent() {
  const { lang } = useLanguage();
  const searchParams = useSearchParams();
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [dismissedSuggestion, setDismissedSuggestion] = useState(false);
  const showSuggestion =
    searchParams.get("emergency") === "true" && !dismissedSuggestion;

  const [showConfirm, setShowConfirm] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSOSClick = () => {
    if (cooldown > 0 || overlayOpen) return;
    setShowConfirm(true);
  };

  const confirmEmergency = () => {
    setShowConfirm(false);
    setDismissedSuggestion(true);
    setOverlayOpen(true);
  };

  const cancelEmergency = () => {
    setShowConfirm(false);
  };

  const handleCloseOverlay = () => {
    setOverlayOpen(false);
    setCooldown(60);
  };

  const actionCards: ActionCard[] = [
    {
      labelKey: "callAmbulance",
      descKey: "ambulanceDesc",
      btnKey: "callNow",
      icon: Ambulance,
      color: "text-danger-light",
      action: () => {
        window.open("tel:108");
      },
    },
    {
      labelKey: "findHospital",
      descKey: "hospitalDesc",
      btnKey: "locateNow",
      icon: Hospital,
      color: "text-success-light",
      action: handleSOSClick,
    },
    {
      labelKey: "shareLocation",
      descKey: "locationDesc",
      btnKey: "shareNow",
      icon: MapPin,
      color: "text-accent-lighter",
      action: async () => {
        let coords = FALLBACK_COORDS;

        try {
          coords = await getShareLocation();
        } catch {
          coords = FALLBACK_COORDS;
        }

        const shareUrl = `https://maps.google.com/?q=${coords.lat},${coords.lng}`;

        if (navigator.share) {
          try {
            await navigator.share({
              title: t("shareLocation", lang),
              text: t("emergencyShareMessage", lang),
              url: shareUrl,
            });
            return;
          } catch {
            return;
          }
        }

        window.open(shareUrl, "_blank", "noopener,noreferrer");
      },
    },
    {
      labelKey: "emergencyContact",
      descKey: "contactDesc",
      btnKey: "contactNow",
      icon: Phone,
      color: "text-warning-light",
      action: handleSOSClick,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white sm:text-4xl">
          {t("emergencyTitle", lang)}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">{t("emergencySubtitle", lang)}</p>
      </motion.div>

      {showSuggestion && !overlayOpen && (
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <GlassCard noHover className="border-danger/30 bg-danger/10">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-danger/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-danger-light">
                  <span className="h-2 w-2 rounded-full bg-danger-light" />
                  {t("emergencySuggestionBadge", lang)}
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t("emergencySuggestionTitle", lang)}
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  {t("emergencySuggestionBody", lang)}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleSOSClick}
                  className="inline-flex items-center justify-center rounded-full bg-danger px-5 py-3 text-sm font-semibold text-white shadow-danger transition-transform hover:scale-[1.02]"
                >
                  {t("emergencySuggestionPrimary", lang)}
                </button>
                <a
                  href="tel:108"
                  className="inline-flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 no-underline transition-colors hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  {t("emergencySuggestionSecondary", lang)}
                </a>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-12 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]"
      >
        <GlassCard noHover className="text-center relative">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-danger/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-danger-light">
            <Siren className="h-4 w-4" />
            {t("emergencyDispatchBadge", lang)}
          </div>

          <h2 className="mx-auto max-w-xl text-2xl font-semibold text-gray-900 dark:text-white sm:text-3xl">
            {t("emergencyDispatchTitle", lang)}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-600 dark:text-gray-400 sm:text-base">
            {t("emergencyDispatchBody", lang)}
          </p>

          <div className="mt-8 flex flex-col items-center">
            <SOSButton
              fixed={false}
              size="hero"
              onClick={handleSOSClick}
              disabled={overlayOpen || cooldown > 0}
              className="mx-auto"
              ariaLabel={t("sosText", lang)}
              title={t("sosText", lang)}
            />
            {cooldown > 0 ? (
              <p className="mt-4 text-sm font-medium text-warning-light">
                Cooldown: {cooldown}s
              </p>
            ) : (
              <p className="mt-4 text-sm font-medium text-gray-700 dark:text-gray-200">
                {t("sosText", lang)}
              </p>
            )}
          </div>
        </GlassCard>

        <GlassCard noHover>
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-accent-lighter" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("emergencyPreviewTitle", lang)}
            </h3>
          </div>

          <div className="space-y-4">
            {[
              { icon: MapPin, titleKey: "emergencyPreviewStepOne" as const },
              { icon: Ambulance, titleKey: "emergencyPreviewStepTwo" as const },
              { icon: Siren, titleKey: "emergencyPreviewStepThree" as const },
            ].map((step) => (
              <div
                key={step.titleKey}
                className="flex items-start gap-3 rounded-2xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 p-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15">
                  <step.icon className="h-5 w-5 text-accent-lighter" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{t(step.titleKey, lang)}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 p-4">
            <EmergencyTimeline currentStatus="en_route" />
          </div>
        </GlassCard>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="mb-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {actionCards.map((card) => (
          <motion.div key={card.labelKey} variants={item}>
            <GlassCard className="cursor-pointer text-center" onClick={() => void card.action()}>
              <card.icon className={`mx-auto mb-3 h-10 w-10 ${card.color}`} />
              <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">
                {t(card.labelKey, lang)}
              </h3>
              <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">{t(card.descKey, lang)}</p>
              <span className="inline-block rounded-full bg-red-600 px-4 py-1.5 text-xs font-semibold text-white">
                {t(card.btnKey, lang)}
              </span>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      <section className="mb-16">
        <h2 className="mb-8 text-center text-2xl font-semibold text-gray-900 dark:text-white">
          {t("emergencyNumbers", lang)}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {emergencyContacts.map((contact) => (
            <GlassCard key={contact.number} noHover className="text-center">
              <contact.icon className={`mx-auto mb-2 h-8 w-8 ${contact.color}`} />
              <div className="text-sm text-gray-500 dark:text-gray-400">{t(contact.labelKey, lang)}</div>
              <div className="my-2 text-3xl font-semibold text-gray-900 dark:text-white">
                {contact.number}
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">{t(contact.descKey, lang)}</div>
            </GlassCard>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-8 text-center text-2xl font-semibold text-gray-900 dark:text-white">
          {t("firstAidTips", lang)}
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {firstAidTips.map((tip) => (
            <GlassCard key={tip.titleKey} noHover>
              <div className="mb-4 flex items-center gap-3">
                <tip.icon className={`h-6 w-6 ${tip.color}`} />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t(tip.titleKey, lang)}
                </h3>
              </div>
              <ul className="space-y-2">
                {tip.tips.map((tipKey) => (
                  <li key={tipKey} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-lighter" />
                    {t(tipKey, lang)}
                  </li>
                ))}
              </ul>
            </GlassCard>
          ))}
        </div>
      </section>



      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 dark:bg-black/60 px-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm"
          >
            <GlassCard noHover className="border-red-200 dark:border-red-800 !bg-white dark:!bg-gray-800 shadow-2xl">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-danger/20 text-danger-light">
                  <AlertTriangle className="h-7 w-7" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                  Confirm Emergency
                </h3>
                <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">
                  Are you sure this is an emergency? This will immediately alert response teams and assign an ambulance to your location.
                </p>
                <div className="flex w-full flex-col gap-3">
                  <button
                    onClick={confirmEmergency}
                    className="w-full rounded-xl bg-danger py-3 text-sm font-semibold text-white shadow-danger transition-transform hover:scale-[1.02]"
                  >
                    Yes, Request Help
                  </button>
                  <button
                    onClick={cancelEmergency}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}

      {overlayOpen && <SOSOverlay onClose={handleCloseOverlay} />}
    </div>
  );
}

export default function EmergencyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center px-4 py-12">
          <div className="h-10 w-10 rounded-full border-2 border-accent-lighter border-t-transparent animate-spin" />
        </div>
      }
    >
      <EmergencyContent />
    </Suspense>
  );
}

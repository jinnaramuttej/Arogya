"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Brain, FileText, Siren, MessageSquare, Bot, UserRound, ChevronDown } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { useLanguage } from "@/lib/i18n/context";
import { t } from "@/lib/i18n/translations";

/* ---------- Animated counter ---------- */
function Counter({ target, label }: { target: number; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const duration = 1500;
    const step = 20;
    const inc = target / (duration / step);
    let cur = 0;
    const timer = setInterval(() => {
      cur += inc;
      if (cur >= target) { clearInterval(timer); setValue(target); }
      else setValue(Math.floor(cur));
    }, step);
    return () => clearInterval(timer);
  }, [started, target]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl font-semibold text-red-600">
        {value.toLocaleString()}+
      </div>
      <div className="text-gray-600 dark:text-gray-400 text-sm mt-1">{label}</div>
    </div>
  );
}

/* ---------- Feature data ---------- */
const features = [
  { icon: Brain, titleKey: "feature1Title" as const, descKey: "feature1Desc" as const, href: "/symptom" },
  { icon: FileText, titleKey: "feature3Title" as const, descKey: "feature3Desc" as const, href: "/dashboard" },
  { icon: Siren, titleKey: "feature6Title" as const, descKey: "feature6Desc" as const, href: "/emergency" },
];

const howSteps = [
  { icon: MessageSquare, titleKey: "how1Title" as const, descKey: "how1Desc" as const },
  { icon: Bot, titleKey: "how2Title" as const, descKey: "how2Desc" as const },
  { icon: UserRound, titleKey: "how3Title" as const, descKey: "how3Desc" as const },
];

const testimonials = [
  { key: "testi1Text" as const, name: "Anjali Rao", initials: "AR", color: "bg-red-500" },
  { key: "testi2Text" as const, name: "Mark Chen", initials: "MC", color: "bg-red-400" },
  { key: "testi3Text" as const, name: "Sarah Patel", initials: "SP", color: "bg-red-300" },
];

/* ---------- Staggered fade ---------- */
const container = { hidden: {}, visible: { transition: { staggerChildren: 0.12 } } };
const item = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

/* =============== PAGE =============== */
export default function HomePage() {
  const { lang } = useLanguage();

  return (
    <div className="overflow-hidden">
      {/* ---- Hero ---- */}
      <header className="relative flex flex-col items-center justify-center text-center min-h-[85vh] px-6 bg-gradient-to-b from-red-50 to-white dark:from-gray-900 dark:to-gray-800">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-gray-900 dark:text-white max-w-4xl leading-tight"
        >
          {t("heroTitle", lang)}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl"
        >
          {t("heroSubtitle", lang)}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-10 flex flex-wrap gap-4 justify-center"
        >
          <Link
            href="/symptom"
            className="px-8 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold shadow-brand hover:shadow-brand-hover hover:-translate-y-1 transition-all no-underline"
          >
            {t("heroBtnCheck", lang)}
          </Link>
          <Link
            href="/book"
            className="px-8 py-3 rounded-lg bg-white border border-gray-300 text-gray-800 font-semibold hover:bg-gray-50 transition-all no-underline dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
          >
            {t("heroBtnBook", lang)}
          </Link>
        </motion.div>
        <a href="#features" className="absolute bottom-10 text-gray-400 animate-bounce" aria-label="Scroll to features">
          <ChevronDown className="w-8 h-8" />
        </a>
      </header>

      {/* ---- Features ---- */}
      <section id="features" className="px-6 py-20 max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 dark:text-white text-center mb-12">
          {t("featuresTitle", lang)}
        </h2>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {features.map((f) => (
            <motion.div key={f.titleKey} variants={item}>
              <GlassCard as="a" href={f.href} className="text-center">
                <f.icon className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {t(f.titleKey, lang)}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t(f.descKey, lang)}</p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ---- Counters ---- */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
          <Counter target={10000} label={t("counterPatients", lang)} />
          <Counter target={1000} label={t("counterDoctors", lang)} />
          <Counter target={50} label={t("counterCenters", lang)} />
        </div>
      </section>

      {/* ---- How It Works ---- */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 dark:text-white text-center mb-12">
          {t("howTitle", lang)}
        </h2>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {howSteps.map((s, i) => (
            <motion.div key={s.titleKey} variants={item}>
              <GlassCard noHover className="text-center">
                <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                  <s.icon className="w-7 h-7 text-red-500" />
                </div>
                <div className="text-red-500 text-xs font-semibold mb-2">
                  STEP {i + 1}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t(s.titleKey, lang)}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t(s.descKey, lang)}</p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ---- Testimonials ---- */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 dark:text-white text-center mb-12">
          {t("testiTitle", lang)}
        </h2>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {testimonials.map((tst) => (
            <motion.div key={tst.name} variants={item}>
              <GlassCard noHover>
                <p className="text-gray-700 dark:text-gray-300 text-sm italic mb-6 leading-relaxed">
                  {t(tst.key, lang)}
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full ${tst.color} flex items-center justify-center text-xs font-semibold text-white`}
                  >
                    {tst.initials}
                  </div>
                  <span className="text-gray-900 dark:text-white font-medium text-sm">{tst.name}</span>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}

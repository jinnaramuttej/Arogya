"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Brain, FileText, Siren, MessageSquare, Bot, UserRound, ChevronDown } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { useLanguage } from "@/lib/i18n/context";
import { t } from "@/lib/i18n/translations";

/* ---------- Typewriter ---------- */
function Typewriter({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (delay > 0) {
      timeout = setTimeout(() => startTyping(), delay);
    } else {
      startTyping();
    }

    function startTyping() {
      let i = 0;
      const interval = setInterval(() => {
        setDisplayed((prev) => text.slice(0, prev.length + 1));
        i++;
        if (i >= text.length) clearInterval(interval);
      }, 50);
    }
    return () => clearTimeout(timeout);
  }, [text, delay]);

  return <span>{displayed}<span className="animate-pulse">|</span></span>;
}

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
      <div className="text-4xl font-semibold text-brand-600 dark:text-brand-400">
        {value.toLocaleString()}+
      </div>
      <div className="text-slate-600 dark:text-slate-400 text-sm mt-1">{label}</div>
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
  { key: "testi1Text" as const, name: "Anjali Rao", initials: "AR", color: "bg-brand-500" },
  { key: "testi2Text" as const, name: "Mark Chen", initials: "MC", color: "bg-accent-500" },
  { key: "testi3Text" as const, name: "Sarah Patel", initials: "SP", color: "bg-teal-500" },
];

/* ---------- Staggered fade ---------- */
const container = { hidden: {}, visible: { transition: { staggerChildren: 0.12 } } };
const item = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };

/* =============== PAGE =============== */
export default function HomePage() {
  const { lang } = useLanguage();
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 1000], [0, 300]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <div className="overflow-x-hidden bg-slate-50 dark:bg-slate-900 section-transition">
      {/* ---- Hero ---- */}
      <header className="relative flex flex-col items-center justify-center text-center min-h-[90vh] px-6 overflow-hidden">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="absolute inset-0 z-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-30 dark:opacity-20 mix-blend-multiply dark:mix-blend-lighten"
          >
            <source src="https://assets.mixkit.co/videos/preview/mixkit-medical-researcher-analyzing-data-on-a-transparent-screen-22687-large.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-white/90 to-slate-50 dark:from-slate-900/95 dark:to-slate-900"></div>
          {/* Accent Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-500/10 dark:bg-brand-500/5 blur-[100px] rounded-full pointer-events-none"></div>
        </motion.div>

        <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center mt-10">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold text-slate-900 dark:text-white leading-[1.15] tracking-tight"
          >
            <Typewriter text={t("heroTitle", lang)} />
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl font-light"
          >
            {t("heroSubtitle", lang)}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.8, duration: 0.5, type: "spring", stiffness: 100 }}
            className="mt-10 flex flex-wrap gap-4 justify-center"
          >
            <Link
              href="/symptom"
              className="px-8 py-3.5 rounded-full bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-brand hover:shadow-brand-hover hover:-translate-y-1 transition-all no-underline text-base"
            >
              {t("heroBtnCheck", lang)}
            </Link>
            <Link
              href="/book"
              className="px-8 py-3.5 rounded-full bg-white border border-slate-200 text-slate-800 font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all no-underline dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700"
            >
              {t("heroBtnBook", lang)}
            </Link>
          </motion.div>
        </div>

        <motion.a 
          href="#features" 
          className="absolute bottom-10 z-10 text-slate-400 dark:text-slate-500 animate-bounce cursor-pointer p-2" 
          aria-label="Scroll to features"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
        >
          <ChevronDown className="w-8 h-8" />
        </motion.a>
      </header>

      {/* ---- Features ---- */}
      <section id="features" className="relative px-6 py-24 max-w-6xl mx-auto z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white text-center mb-16"
        >
          {t("featuresTitle", lang)}
        </motion.h2>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {features.map((f, i) => (
            <motion.div key={f.titleKey} variants={item} whileHover={{ y: -5 }}>
              <GlassCard as="a" href={f.href} className="text-center h-full flex flex-col items-center justify-center py-10">
                <div className="w-16 h-16 rounded-full bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center mb-6 text-brand-500">
                  <f.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  {t(f.titleKey, lang)}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{t(f.descKey, lang)}</p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ---- Counters with subtle Parallax Background ---- */}
      <section className="relative px-6 py-20 mt-10 overflow-hidden">
        <div className="absolute inset-0 bg-brand-900/5 dark:bg-brand-900/20 transform -skew-y-3 origin-top-left z-0"></div>
        <div className="relative max-w-4xl mx-auto z-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
            <Counter target={10000} label={t("counterPatients", lang)} />
            <Counter target={1000} label={t("counterDoctors", lang)} />
            <Counter target={50} label={t("counterCenters", lang)} />
          </div>
        </div>
      </section>

      {/* ---- How It Works ---- */}
      <section className="px-6 py-32 max-w-6xl mx-auto relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white text-center mb-16"
        >
          {t("howTitle", lang)}
        </motion.h2>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
        >
          {/* Connector lines (desktop) */}
          <div className="hidden md:block absolute top-[20%] left-[16%] w-[68%] h-0.5 bg-gradient-to-r from-brand-100 via-accent-100 to-brand-100 dark:from-brand-900 dark:via-accent-900 dark:to-brand-900 z-0"></div>

          {howSteps.map((s, i) => (
            <motion.div key={s.titleKey} variants={item} className="relative z-10">
              <GlassCard noHover className="text-center h-full">
                <div className="w-14 h-14 rounded-full bg-white dark:bg-slate-800 border-2 border-brand-100 dark:border-brand-800 flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <s.icon className="w-6 h-6 text-brand-500" />
                </div>
                <div className="text-accent-500 text-xs font-bold tracking-wider mb-2 uppercase">
                  STEP {i + 1}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{t(s.titleKey, lang)}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{t(s.descKey, lang)}</p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ---- Testimonials ---- */}
      <section className="px-6 pb-32 max-w-6xl mx-auto relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white text-center mb-16"
        >
          {t("testiTitle", lang)}
        </motion.h2>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {testimonials.map((tst, i) => (
            <motion.div key={tst.name} variants={item} custom={i} whileHover={{ y: -5 }}>
              <GlassCard noHover className="h-full flex flex-col justify-between border-t-4 border-t-brand-400 dark:border-t-brand-600">
                <p className="text-slate-700 dark:text-slate-300 text-base italic mb-8 leading-relaxed font-light">
                  "{t(tst.key, lang)}"
                </p>
                <div className="flex items-center gap-4">
                  <div
                    className={`w-11 h-11 rounded-full ${tst.color} shadow-sm flex items-center justify-center text-sm font-bold text-white`}
                  >
                    {tst.initials}
                  </div>
                  <div>
                    <span className="block text-slate-900 dark:text-white font-semibold text-sm">{tst.name}</span>
                    <span className="block text-slate-500 dark:text-slate-400 text-xs mt-0.5">Verified Patient</span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  Stethoscope,
  AlertTriangle,
  ArrowRight,
  RefreshCcw,
  ShieldAlert,
  Home,
  Loader2,
  Sparkles,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import SymptomChat from "@/components/features/SymptomChat";
import { useLanguage } from "@/lib/i18n/context";
import { t } from "@/lib/i18n/translations";

const DoctorAvatar = dynamic(() => import("@/components/features/DoctorAvatar"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[400px] w-full items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
      <div className="h-10 w-10 rounded-full border-2 border-red-400 border-t-transparent animate-spin" />
    </div>
  ),
});

/* ── Types ── */
interface Condition {
  name: string;
  probability: "High" | "Medium" | "Low";
  description: string;
  doctor_type: string;
  action: "home" | "book" | "emergency";
}

interface AnalysisResult {
  emergency: boolean;
  conditions: Condition[];
  immediate_warning: string | null;
  general_advice: string;
  disclaimer: string;
}

interface FormData {
  symptom: string;
  age: string;
  gender: string;
  duration: string;
  severity: string;
}

/* ── Emergency keywords ── */
const EMERGENCY_KEYWORDS = [
  "chest pain",
  "can't breathe",
  "cannot breathe",
  "unconscious",
  "not breathing",
  "heart attack",
  "stroke",
  "seizure",
  "severe bleeding",
];

function hasEmergencyKeyword(text: string): boolean {
  const lower = text.toLowerCase();
  return EMERGENCY_KEYWORDS.some((kw) => lower.includes(kw));
}

/* ── Probability badge colors ── */
const probColors: Record<string, string> = {
  High: "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30",
  Medium: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30",
  Low: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30",
};

/* ── Component ── */
export default function SymptomPage() {
  const { lang } = useLanguage();
  const [phase, setPhase] = useState<"start" | "form" | "loading" | "results">("results");
  const [form, setForm] = useState<FormData>({
    symptom: "",
    age: "",
    gender: "",
    duration: "",
    severity: "",
  });
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [keywordEmergency, setKeywordEmergency] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [showDoctor, setShowDoctor] = useState(true);

  const update = (field: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const emergencyDetected = hasEmergencyKeyword(form.symptom);
    setKeywordEmergency(emergencyDetected);
    setPhase("loading");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "analyze",
          symptom: form.symptom,
          age: Number(form.age),
          gender: form.gender,
          duration: form.duration,
          severity: form.severity,
          language: lang,
        }),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const text = await res.text();
      const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      const data: AnalysisResult = JSON.parse(cleaned);
      setResult(data);
      setPhase("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setPhase("form");
    }
  };

  const handleReset = () => {
    setPhase("start");
    setResult(null);
    setKeywordEmergency(false);
    setError(null);
    setForm({ symptom: "", age: "", gender: "", duration: "", severity: "" });
  };

  const inputClass =
    "w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500 transition-colors";
  const selectClass = `${inputClass} appearance-none cursor-pointer`;
  const labelClass = "block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1.5";

  /* ══════════ PHASE 1: START ══════════ */
  if (phase === "start") {
    return (
      <div className="px-4 sm:px-6 py-8 max-w-2xl mx-auto min-h-[60vh] flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-brand">
            <Stethoscope className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 dark:text-white mb-3">
            {t("symptomTitle", lang)}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            {t("startHealthCheckDesc", lang)}
          </p>
          <button
            onClick={() => setPhase("form")}
            className="inline-flex items-center gap-3 rounded-full bg-red-600 hover:bg-red-700 px-8 py-4 text-lg font-semibold text-white shadow-brand hover:shadow-brand-hover hover:-translate-y-0.5 transition-all cursor-pointer border-none"
          >
            <Sparkles className="h-5 w-5" />
            {t("startHealthCheck", lang)}
          </button>
        </motion.div>
      </div>
    );
  }

  /* ══════════ PHASE 2: FORM MODAL ══════════ */
  if (phase === "form") {
    return (
      <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 dark:bg-black/60 px-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg"
        >
          <GlassCard noHover className="!bg-white dark:!bg-gray-800 shadow-2xl relative">
            <button
              onClick={() => setPhase("start")}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer border-none"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t("symptomTitle", lang)}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t("symptomSubtitle", lang)}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="symptom" className={labelClass}>Symptom Description</label>
                  <textarea
                    id="symptom"
                    rows={3}
                    required
                    placeholder="Describe what you're feeling..."
                    value={form.symptom}
                    onChange={(e) => update("symptom", e.target.value)}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="age" className={labelClass}>Age</label>
                    <input
                      id="age"
                      type="number"
                      min={1}
                      max={120}
                      required
                      placeholder="e.g. 28"
                      value={form.age}
                      onChange={(e) => update("age", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="gender" className={labelClass}>Gender</label>
                    <select
                      id="gender"
                      required
                      value={form.gender}
                      onChange={(e) => update("gender", e.target.value)}
                      className={selectClass}
                    >
                      <option value="" disabled>Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="duration" className={labelClass}>Duration</label>
                    <select
                      id="duration"
                      required
                      value={form.duration}
                      onChange={(e) => update("duration", e.target.value)}
                      className={selectClass}
                    >
                      <option value="" disabled>Select</option>
                      <option value="Today">Today</option>
                      <option value="2-3 days">2-3 days</option>
                      <option value="1 week">1 week</option>
                      <option value="Over a week">Over a week</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="severity" className={labelClass}>Severity</label>
                    <select
                      id="severity"
                      required
                      value={form.severity}
                      onChange={(e) => update("severity", e.target.value)}
                      className={selectClass}
                    >
                      <option value="" disabled>Select</option>
                      <option value="Mild">Mild</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Severe">Severe</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold shadow-brand hover:shadow-brand-hover hover:-translate-y-0.5 transition-all cursor-pointer border-none text-base"
                >
                  {t("analyzeSymptoms", lang)}
                </button>
              </div>
            </form>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  /* ══════════ PHASE 3: LOADING ══════════ */
  if (phase === "loading") {
    return (
      <div className="px-4 sm:px-6 py-8 max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6">
          {keywordEmergency && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md p-4 rounded-xl bg-red-500/20 border border-red-500/40 text-center"
            >
              <div className="flex items-center justify-center gap-2 text-red-400 font-semibold text-lg mb-2">
                <ShieldAlert className="w-5 h-5" />
                ⚠ Your symptoms may require immediate attention
              </div>
              <Link
                href="/emergency"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-red-600 text-white font-semibold no-underline hover:bg-red-500 transition-colors"
              >
                Go to Emergency <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}

          <div className="h-[250px] w-[250px]">
            <DoctorAvatar isSpeaking={true} />
          </div>

          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
            <p className="text-gray-600 dark:text-gray-300 text-lg">{t("aiThinking", lang)}</p>
          </div>
        </div>
      </div>
    );
  }

  /* ══════════ PHASE 4: RESULTS + CHAT + 3D ══════════ */
  const showEmergency = keywordEmergency || result?.emergency;
  const chatContext = result
    ? `Based on my analysis: ${result.conditions.map((c) => `${c.name} (${c.probability})`).join(", ")}. ${result.general_advice} ${t("askFollowUp", lang)}`
    : t("chatBot1", lang);

  return (
    <div className="px-4 sm:px-6 py-8 max-w-7xl mx-auto">
      {/* Emergency banner */}
      {showEmergency && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-5 rounded-2xl bg-red-500/15 border border-red-500/40 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-red-400 font-semibold text-lg mb-1">
            <ShieldAlert className="w-5 h-5" />
            ⚠ Your symptoms may require immediate attention
          </div>
          {result?.immediate_warning && (
            <p className="text-red-300/80 text-sm mb-3">{result.immediate_warning}</p>
          )}
          <Link
            href="/emergency"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-red-600 text-white font-semibold no-underline hover:bg-red-500 transition-colors text-base"
          >
            Go to Emergency <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)]">
        {/* LEFT: 3D Doctor */}
        <div className="hidden lg:block">
          <AnimatePresence>
            {showDoctor && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <GlassCard noHover className="!p-0 overflow-hidden">
                  <DoctorAvatar isSpeaking={aiSpeaking} />
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setShowDoctor(!showDoctor)}
            className="mt-3 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer bg-transparent border-none mx-auto"
          >
            {showDoctor ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showDoctor ? t("hideDoctor", lang) : t("showDoctor", lang)}
          </button>
        </div>

        {/* Mobile doctor toggle */}
        <div className="lg:hidden flex justify-center mb-2">
          <button
            onClick={() => setShowDoctor(!showDoctor)}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer bg-transparent border-none rounded-full px-4 py-2 border border-gray-200 dark:border-gray-700"
          >
            {showDoctor ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showDoctor ? t("hideDoctor", lang) : t("showDoctor", lang)}
          </button>
        </div>
        {showDoctor && (
          <div className="lg:hidden">
            <GlassCard noHover className="!p-0 overflow-hidden h-[300px]">
              <DoctorAvatar isSpeaking={aiSpeaking} />
            </GlassCard>
          </div>
        )}

        {/* RIGHT: Results + Chat */}
        <div className="space-y-4">
          {/* Results header */}
          {result && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
                {t("analysisResults", lang)}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t("askFollowUp", lang)}</p>
            </motion.div>
          )}

          {/* Condition cards */}
          <div className="space-y-3">
            {result?.conditions.map((cond, i) => (
              <motion.div
                key={cond.name}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard noHover>
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-gray-900 dark:text-white font-semibold">{cond.name}</h3>
                      <span
                        className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium border ${
                          probColors[cond.probability] || probColors.Medium
                        }`}
                      >
                        {cond.probability}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{cond.description}</p>
                    <div className="flex items-center gap-2 text-red-500 text-sm">
                      <Stethoscope className="w-4 h-4" />
                      {cond.doctor_type}
                    </div>
                    {cond.action === "home" && (
                      <button
                        onClick={handleReset}
                        className="mt-1 flex items-center justify-center gap-2 w-full py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                      >
                        <Home className="w-4 h-4" /> Monitor at home
                      </button>
                    )}
                    {cond.action === "book" && (
                      <Link
                        href={`/book?specialty=${encodeURIComponent(cond.doctor_type)}`}
                        className="mt-1 flex items-center justify-center gap-2 w-full py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-medium shadow-brand hover:-translate-y-0.5 transition-all no-underline"
                      >
                        <Stethoscope className="w-4 h-4" /> Book a {cond.doctor_type}
                      </Link>
                    )}
                    {cond.action === "emergency" && (
                      <Link
                        href="/emergency"
                        className="mt-1 flex items-center justify-center gap-2 w-full py-2 rounded-full bg-red-600 text-white font-medium hover:bg-red-500 transition-colors no-underline"
                      >
                        <AlertTriangle className="w-4 h-4" /> Go to Emergency Now
                      </Link>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {/* General advice */}
          {result?.general_advice && (
            <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/25">
              <h4 className="text-teal-600 dark:text-teal-400 font-semibold mb-1">{t("generalAdvice", lang)}</h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{result.general_advice}</p>
            </div>
          )}

          {/* Disclaimer */}
          {result?.disclaimer && (
            <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <p className="text-gray-400 dark:text-gray-500 text-xs">{result.disclaimer}</p>
            </div>
          )}

          {/* Chat section */}
          <GlassCard noHover>
            <SymptomChat initialContext={chatContext} onSpeaking={setAiSpeaking} />
          </GlassCard>

          {/* Check Again */}
          {result && (
            <div className="text-center pt-2">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
              >
                <RefreshCcw className="w-4 h-4" />
                Check Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

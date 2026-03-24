"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Stethoscope,
  AlertTriangle,
  ArrowRight,
  RefreshCcw,
  ShieldAlert,
  Home,
  Loader2,
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { useLanguage } from "@/lib/i18n/context";
import { t } from "@/lib/i18n/translations";

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
  High: "bg-red-500/20 text-red-400 border-red-500/30",
  Medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

/* ── Component ── */
export default function SymptomPage() {
  const { lang } = useLanguage();
  const [step, setStep] = useState<"form" | "loading" | "results">("form");
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

  /* ── Form field update ── */
  const update = (field: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  /* ── Submit handler ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Step 5 — client-side emergency keyword detection
    const emergencyDetected = hasEmergencyKeyword(form.symptom);
    setKeywordEmergency(emergencyDetected);

    setStep("loading");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptom: form.symptom,
          age: Number(form.age),
          gender: form.gender,
          duration: form.duration,
          severity: form.severity,
        }),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const text = await res.text();
      // Strip markdown code fences if the model wraps them
      const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      const data: AnalysisResult = JSON.parse(cleaned);
      setResult(data);
      setStep("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStep("form");
    }
  };

  /* ── Reset handler ── */
  const handleReset = () => {
    setStep("form");
    setResult(null);
    setKeywordEmergency(false);
    setError(null);
    setForm({ symptom: "", age: "", gender: "", duration: "", severity: "" });
  };

  /* ── Shared input class ── */
  const inputClass =
    "w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-accent transition-colors";
  const selectClass = `${inputClass} appearance-none cursor-pointer`;
  const labelClass = "block text-white/80 text-sm font-medium mb-1.5";

  /* ──────────── STEP 1: FORM ──────────── */
  if (step === "form") {
    return (
      <div className="px-4 sm:px-6 py-8 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-semibold text-white">
            {t("symptomTitle", lang)}
          </h1>
          <p className="text-white/70 mt-2">{t("symptomSubtitle", lang)}</p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm text-center"
          >
            {error}
          </motion.div>
        )}

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard>
            <div className="space-y-5">
              {/* Symptom textarea */}
              <div>
                <label htmlFor="symptom" className={labelClass}>
                  Symptom Description
                </label>
                <textarea
                  id="symptom"
                  rows={4}
                  required
                  placeholder="Describe what you're feeling..."
                  value={form.symptom}
                  onChange={(e) => update("symptom", e.target.value)}
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Age + Gender row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="age" className={labelClass}>
                    Age
                  </label>
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
                  <label htmlFor="gender" className={labelClass}>
                    Gender
                  </label>
                  <select
                    id="gender"
                    required
                    value={form.gender}
                    onChange={(e) => update("gender", e.target.value)}
                    className={selectClass}
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Duration + Severity row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="duration" className={labelClass}>
                    Duration
                  </label>
                  <select
                    id="duration"
                    required
                    value={form.duration}
                    onChange={(e) => update("duration", e.target.value)}
                    className={selectClass}
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    <option value="Today">Today</option>
                    <option value="2-3 days">2-3 days</option>
                    <option value="1 week">1 week</option>
                    <option value="Over a week">Over a week</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="severity" className={labelClass}>
                    Severity
                  </label>
                  <select
                    id="severity"
                    required
                    value={form.severity}
                    onChange={(e) => update("severity", e.target.value)}
                    className={selectClass}
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    <option value="Mild">Mild</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Severe">Severe</option>
                  </select>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-accent-light to-accent text-white font-semibold shadow-accent hover:shadow-accent-hover hover:-translate-y-0.5 transition-all cursor-pointer border-none text-base"
              >
                Analyze Symptoms
              </button>
            </div>
          </GlassCard>
        </motion.form>
      </div>
    );
  }

  /* ──────────── STEP 2: LOADING ──────────── */
  if (step === "loading") {
    return (
      <div className="px-4 sm:px-6 py-8 max-w-2xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          {/* Keyword emergency banner (shown even while loading) */}
          {keywordEmergency && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full p-4 rounded-xl bg-red-500/20 border border-red-500/40 text-center mb-4"
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

          <Loader2 className="w-10 h-10 text-accent-lighter animate-spin" />
          <p className="text-white/70 text-lg">Analyzing your symptoms…</p>
        </div>
      </div>
    );
  }

  /* ──────────── STEP 3: RESULTS ──────────── */
  const showEmergency = keywordEmergency || result?.emergency;

  return (
    <div className="px-4 sm:px-6 py-8 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-semibold text-white">Analysis Results</h1>
        <p className="text-white/70 mt-2">Based on your reported symptoms</p>
      </motion.div>

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

      {/* Condition cards */}
      <div className="space-y-4">
        {result?.conditions.map((cond, i) => (
          <motion.div
            key={cond.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard>
              <div className="flex flex-col gap-3">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-white font-semibold text-lg">{cond.name}</h3>
                  <span
                    className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium border ${
                      probColors[cond.probability] || probColors.Medium
                    }`}
                  >
                    {cond.probability}
                  </span>
                </div>

                {/* Description */}
                <p className="text-white/70 text-sm">{cond.description}</p>

                {/* Doctor type */}
                <div className="flex items-center gap-2 text-accent-lighter text-sm">
                  <Stethoscope className="w-4 h-4" />
                  {cond.doctor_type}
                </div>

                {/* Action button */}
                {cond.action === "home" && (
                  <button
                    onClick={handleReset}
                    className="mt-1 flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-white/10 text-white/80 font-medium border border-glass-border hover:bg-white/15 transition-colors cursor-pointer"
                  >
                    <Home className="w-4 h-4" />
                    Monitor at home
                  </button>
                )}
                {cond.action === "book" && (
                  <Link
                    href={`/book?specialty=${encodeURIComponent(cond.doctor_type)}`}
                    className="mt-1 flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-gradient-to-r from-accent-light to-accent text-white font-medium shadow-accent hover:shadow-accent-hover hover:-translate-y-0.5 transition-all no-underline"
                  >
                    <Stethoscope className="w-4 h-4" />
                    Book a {cond.doctor_type}
                  </Link>
                )}
                {cond.action === "emergency" && (
                  <Link
                    href="/emergency"
                    className="mt-1 flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-red-600 text-white font-medium hover:bg-red-500 transition-colors no-underline"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Go to Emergency Now
                  </Link>
                )}
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* General advice card */}
      {result?.general_advice && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: (result.conditions.length) * 0.1 }}
          className="mt-4"
        >
          <div className="p-5 rounded-2xl bg-teal-500/10 border border-teal-500/25">
            <h4 className="text-teal-400 font-semibold mb-1">General Advice</h4>
            <p className="text-white/70 text-sm">{result.general_advice}</p>
          </div>
        </motion.div>
      )}

      {/* Disclaimer card */}
      {result?.disclaimer && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: (result.conditions.length + 1) * 0.1 }}
          className="mt-4"
        >
          <div className="p-4 rounded-2xl bg-white/5 border border-glass-border">
            <p className="text-white/40 text-xs">{result.disclaimer}</p>
          </div>
        </motion.div>
      )}

      {/* Check Again button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center"
      >
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white/10 text-white font-semibold border border-glass-border hover:bg-white/15 transition-colors cursor-pointer"
        >
          <RefreshCcw className="w-4 h-4" />
          Check Again
        </button>
      </motion.div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Pill, Loader2, CheckCircle, Stethoscope } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { useLanguage } from "@/lib/i18n/context";
import { t } from "@/lib/i18n/translations";
import { createClient } from "@/lib/supabase/client";

interface MedicineEntry {
  name: string;
  dosage: string;
  duration: string;
}

interface PrescriptionFormProps {
  userId: string;
  onSaved: () => void;
}

export default function PrescriptionForm({ userId, onSaved }: PrescriptionFormProps) {
  const { lang } = useLanguage();
  const [doctorName, setDoctorName] = useState("");
  const [medicines, setMedicines] = useState<MedicineEntry[]>([
    { name: "", dosage: "", duration: "" },
  ]);
  const [instructions, setInstructions] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addMedicine = () => {
    setMedicines([...medicines, { name: "", dosage: "", duration: "" }]);
  };

  const removeMedicine = (index: number) => {
    if (medicines.length <= 1) return;
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const updateMedicine = (index: number, field: keyof MedicineEntry, value: string) => {
    const updated = [...medicines];
    updated[index] = { ...updated[index], [field]: value };
    setMedicines(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validMeds = medicines.filter((m) => m.name.trim());
    if (validMeds.length === 0) return;

    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { error: insertError } = await supabase.from("prescriptions").insert([
      {
        patient_id: userId,
        doctor_name: doctorName || null,
        medicines: validMeds,
        instructions: instructions || null,
      },
    ]);

    if (insertError) {
      setError(insertError.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSaved();
      }, 1500);
    }
    setSubmitting(false);
  };

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <GlassCard noHover className="text-center py-8">
          <CheckCircle className="w-10 h-10 text-success-light mx-auto mb-3" />
          <p className="text-success-light font-semibold">{t("savePrescription", lang)}</p>
        </GlassCard>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <GlassCard noHover>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Doctor name */}
          <div>
            <label className="text-white/70 text-sm mb-1.5 block">{t("doctorNameLabel", lang)}</label>
            <div className="flex items-center gap-2 bg-white/5 border border-glass-border rounded-xl px-4 py-2.5">
              <Stethoscope className="w-4 h-4 text-white/40 shrink-0" />
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder={t("doctorNameLabel", lang)}
                className="bg-transparent text-white text-sm w-full outline-none placeholder:text-white/30"
              />
            </div>
          </div>

          {/* Medicines */}
          <div className="space-y-3">
            <label className="text-white/70 text-sm block">{t("medicineName", lang)}</label>
            {medicines.map((med, idx) => (
              <div key={idx} className="rounded-xl border border-glass-border bg-white/5 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Pill className="w-4 h-4 text-accent-lighter shrink-0" />
                  <input
                    type="text"
                    value={med.name}
                    onChange={(e) => updateMedicine(idx, "name", e.target.value)}
                    placeholder={t("medicineName", lang)}
                    required
                    className="bg-transparent text-white text-sm w-full outline-none placeholder:text-white/30"
                  />
                  {medicines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedicine(idx)}
                      className="text-danger-light/60 hover:text-danger-light transition-colors cursor-pointer bg-transparent border-none p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={med.dosage}
                    onChange={(e) => updateMedicine(idx, "dosage", e.target.value)}
                    placeholder={t("dosageLabel", lang)}
                    className="bg-transparent text-white text-xs border border-glass-border rounded-lg px-3 py-2 outline-none placeholder:text-white/30"
                  />
                  <input
                    type="text"
                    value={med.duration}
                    onChange={(e) => updateMedicine(idx, "duration", e.target.value)}
                    placeholder={t("durationLabel", lang)}
                    className="bg-transparent text-white text-xs border border-glass-border rounded-lg px-3 py-2 outline-none placeholder:text-white/30"
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addMedicine}
              className="flex items-center gap-1.5 text-accent-lighter text-xs font-medium cursor-pointer bg-transparent border-none hover:text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              {t("addMedicine", lang)}
            </button>
          </div>

          {/* Instructions */}
          <div>
            <label className="text-white/70 text-sm mb-1.5 block">{t("instructionsLabel", lang)}</label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder={t("instructionsLabel", lang)}
              rows={3}
              className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-2.5 text-white text-sm outline-none placeholder:text-white/30 resize-none"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-danger/20 border border-danger/30 text-danger-light text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-light to-accent text-white font-semibold text-sm cursor-pointer border-none transition-all hover:shadow-accent-hover disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Pill className="w-4 h-4" />
            )}
            {t("savePrescription", lang)}
          </button>
        </form>
      </GlassCard>
    </motion.div>
  );
}

"use client";

import { CalendarDays, Pill } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { useLanguage } from "@/lib/i18n/context";
import { t } from "@/lib/i18n/translations";

interface Medicine {
  name: string;
  dosage: string;
  duration: string;
}

interface PrescriptionCardProps {
  doctorName: string | null;
  medicines: Medicine[];
  instructions: string | null;
  createdAt: string;
}

export type { Medicine };

export default function PrescriptionCard({
  doctorName,
  medicines,
  instructions,
  createdAt,
}: PrescriptionCardProps) {
  const { lang } = useLanguage();
  const date = new Date(createdAt).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <GlassCard noHover>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {doctorName && (
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
              {t("prescribedBy", lang)} {doctorName}
            </p>
          )}

          <div className="space-y-2">
            {medicines.map((med, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3"
              >
                <Pill className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <h4 className="text-gray-900 dark:text-white font-medium text-sm">{med.name}</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                    {t("dosageLabel", lang)}: {med.dosage}
                    {med.duration && ` · ${t("durationLabel", lang)}: ${med.duration}`}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {instructions && (
            <div className="mt-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3">
              <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1">
                {t("instructionsLabel", lang)}
              </p>
              <p className="text-gray-700 dark:text-gray-300 text-sm">{instructions}</p>
            </div>
          )}
        </div>

        <div className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-1 shrink-0">
          <CalendarDays className="w-3.5 h-3.5" />
          {date}
        </div>
      </div>
    </GlassCard>
  );
}

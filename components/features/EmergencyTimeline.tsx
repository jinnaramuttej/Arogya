"use client";

import { motion } from "framer-motion";
import {
  Bell,
  CheckCircle,
  Loader2,
  MapPin,
  Navigation,
  Radio,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { useLanguage } from "@/lib/context/LanguageContext";
import { t } from "@/lib/i18n/translations";

export type TimelineStatus =
  | "detecting"
  | "assigned"
  | "notified"
  | "en_route"
  | "arriving";

interface Step {
  id: TimelineStatus;
  labelKey:
    | "emergencyTimelineDetecting"
    | "emergencyTimelineAssigned"
    | "emergencyTimelineNotified"
    | "emergencyTimelineEnRoute"
    | "emergencyTimelineArriving";
  icon: LucideIcon;
}

const STEPS: Step[] = [
  { id: "detecting", labelKey: "emergencyTimelineDetecting", icon: MapPin },
  { id: "assigned", labelKey: "emergencyTimelineAssigned", icon: Truck },
  { id: "notified", labelKey: "emergencyTimelineNotified", icon: Bell },
  { id: "en_route", labelKey: "emergencyTimelineEnRoute", icon: Navigation },
  { id: "arriving", labelKey: "emergencyTimelineArriving", icon: Radio },
];

function stepIndex(status: TimelineStatus) {
  return STEPS.findIndex((step) => step.id === status);
}

interface EmergencyTimelineProps {
  currentStatus: TimelineStatus;
}

export default function EmergencyTimeline({
  currentStatus,
}: EmergencyTimelineProps) {
  const { language: lang } = useLanguage();
  const activeIndex = stepIndex(currentStatus);

  return (
    <div className="space-y-1">
      {STEPS.map((step, index) => {
        const completed = index < activeIndex;
        const active = index === activeIndex;
        const Icon = step.icon;

        return (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
            className="flex items-center gap-3"
          >
            <div className="flex flex-col items-center">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
                  completed
                    ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30"
                    : active
                    ? "border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-900/30"
                    : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                }`}
              >
                {completed ? (
                  <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                ) : active ? (
                  <Loader2 className="h-4 w-4 animate-spin text-brand-500" />
                ) : (
                  <Icon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                )}
              </div>

              {index < STEPS.length - 1 && (
                <div
                  className={`h-6 w-0.5 transition-colors ${
                    completed ? "bg-emerald-200 dark:bg-emerald-800" : "bg-gray-200 dark:bg-gray-700"
                  }`}
                />
              )}
            </div>

            <span
              className={`text-sm font-medium ${
                completed
                  ? "text-emerald-600 dark:text-emerald-400"
                  : active
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-400 dark:text-gray-500"
              }`}
            >
              {t(step.labelKey, lang)}
              {active && (
                <span className="ml-2 text-xs text-brand-500">
                  {t("emergencyTimelineActive", lang)}
                </span>
              )}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

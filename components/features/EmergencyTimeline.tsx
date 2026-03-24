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
import { useLanguage } from "@/lib/i18n/context";
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
  const { lang } = useLanguage();
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
                    ? "border-success/40 bg-success/15"
                    : active
                    ? "border-accent/40 bg-accent/15"
                    : "border-glass-border bg-white/5"
                }`}
              >
                {completed ? (
                  <CheckCircle className="h-4 w-4 text-success-light" />
                ) : active ? (
                  <Loader2 className="h-4 w-4 animate-spin text-accent-lighter" />
                ) : (
                  <Icon className="h-4 w-4 text-white/35" />
                )}
              </div>

              {index < STEPS.length - 1 && (
                <div
                  className={`h-6 w-0.5 transition-colors ${
                    completed ? "bg-success/45" : "bg-white/10"
                  }`}
                />
              )}
            </div>

            <span
              className={`text-sm font-medium ${
                completed
                  ? "text-success-light"
                  : active
                  ? "text-white"
                  : "text-white/35"
              }`}
            >
              {t(step.labelKey, lang)}
              {active && (
                <span className="ml-2 text-xs text-accent-lighter">
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

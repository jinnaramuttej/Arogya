"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CalendarDays,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Pill,
  FolderOpen,
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import PrescriptionCard from "@/components/features/PrescriptionCard";
import PrescriptionForm from "@/components/features/PrescriptionForm";
import ReportUpload from "@/components/features/ReportUpload";
import ReportList from "@/components/features/ReportList";
import type { Medicine } from "@/components/features/PrescriptionCard";
import { useLanguage } from "@/lib/i18n/context";
import { t } from "@/lib/i18n/translations";
import { useUser } from "@/lib/hooks/useUser";
import { createClient } from "@/lib/supabase/client";

interface Appointment {
  id: string;
  doctor_name: string;
  specialty: string;
  date: string;
  time: string;
  status: string;
}

interface Prescription {
  id: string;
  doctor_name: string | null;
  medicines: Medicine[];
  instructions: string | null;
  created_at: string;
}

type DashTab = "appointments" | "prescriptions" | "reports";

const statusColors: Record<string, string> = {
  confirmed: "bg-success/20 text-success-light",
  pending: "bg-warning/20 text-warning-light",
  completed: "bg-accent/20 text-accent-lighter",
  cancelled: "bg-danger/20 text-danger-light",
};

const statusIcons: Record<string, typeof CheckCircle> = {
  confirmed: CheckCircle,
  pending: Clock,
  completed: CheckCircle,
  cancelled: XCircle,
};

export default function DashboardPage() {
  const { lang } = useLanguage();
  const { user, loading } = useUser();
  const [tab, setTab] = useState<DashTab>("appointments");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRxForm, setShowRxForm] = useState(false);
  const [reportRefreshKey, setReportRefreshKey] = useState(0);

  const fetchData = useCallback(async () => {
    if (!user) {
      setIsLoadingData(false);
      return;
    }

    setIsLoadingData(true);
    setError(null);
    const supabase = createClient();

    const [aptRes, rxRes] = await Promise.all([
      supabase
        .from("appointments")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false }),
      supabase
        .from("prescriptions")
        .select("*")
        .eq("patient_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

    if (aptRes.error) {
      setError(aptRes.error.message);
    } else {
      setAppointments(aptRes.data || []);
    }

    if (!rxRes.error) {
      setPrescriptions((rxRes.data as Prescription[]) || []);
    }

    setIsLoadingData(false);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePrescriptionSaved = () => {
    setShowRxForm(false);
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-accent-lighter border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs: { key: DashTab; label: string; icon: typeof CalendarDays }[] = [
    { key: "appointments", label: t("tabAppointments", lang), icon: CalendarDays },
    { key: "prescriptions", label: t("tabPrescriptions", lang), icon: Pill },
    { key: "reports", label: t("tabReports", lang), icon: FolderOpen },
  ];

  return (
    <div className="px-4 sm:px-6 py-8 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 dark:text-white">
          {t("dashTitle", lang)}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{t("dashSubtitle", lang)}</p>
        {user && (
          <p className="text-red-500 text-sm mt-1">{user.email}</p>
        )}
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 justify-center flex-wrap">
        {tabs.map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer border ${
              tab === item.key
                ? "bg-red-600 text-white border-red-600 shadow-brand"
                : "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </div>

      {/* Appointments Tab */}
      {tab === "appointments" && (
        <motion.div
          key="appointments"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="flex justify-end mb-2">
            <Link
              href="/book"
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-brand hover:shadow-brand-hover transition-all no-underline"
            >
              <Plus className="w-4 h-4" />
              {t("bookNow", lang)}
            </Link>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-danger/20 border border-danger/30 text-danger-light text-sm text-center mb-4">
              {error}
            </div>
          )}

          {isLoadingData ? (
            <div className="flex justify-center p-8">
              <div className="w-8 h-8 border-2 border-accent-lighter border-t-transparent rounded-full animate-spin" />
            </div>
          ) : appointments.length === 0 ? (
            <GlassCard noHover className="text-center py-12">
              <CalendarDays className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">{t("noAppointments", lang)}</p>
              <Link
                href="/book"
                className="mt-4 inline-block px-6 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-semibold no-underline"
              >
                {t("bookNow", lang)}
              </Link>
            </GlassCard>
          ) : (
            appointments.map((apt) => {
              const StatusIcon = statusIcons[apt.status] || Clock;
              return (
                <GlassCard key={apt.id} noHover>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-gray-900 dark:text-white font-semibold">{apt.doctor_name}</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">{apt.specialty}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {apt.date}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {apt.time}
                      </div>
                      <span
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium capitalize ${
                          statusColors[apt.status] || statusColors.pending
                        }`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {apt.status}
                      </span>
                    </div>
                  </div>
                </GlassCard>
              );
            })
          )}
        </motion.div>
      )}

      {/* Prescriptions Tab */}
      {tab === "prescriptions" && (
        <motion.div
          key="prescriptions"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {user && !showRxForm && (
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setShowRxForm(true)}
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-brand hover:shadow-brand-hover transition-all cursor-pointer border-none"
              >
                <Plus className="w-4 h-4" />
                {t("addPrescription", lang)}
              </button>
            </div>
          )}

          {showRxForm && user && (
            <PrescriptionForm userId={user.id} onSaved={handlePrescriptionSaved} />
          )}

          {isLoadingData ? (
            <div className="flex justify-center p-8">
              <div className="w-8 h-8 border-2 border-accent-lighter border-t-transparent rounded-full animate-spin" />
            </div>
          ) : prescriptions.length === 0 && !showRxForm ? (
            <GlassCard noHover className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">{t("noPrescriptions", lang)}</p>
            </GlassCard>
          ) : (
            prescriptions.map((rx) => (
              <PrescriptionCard
                key={rx.id}
                doctorName={rx.doctor_name}
                medicines={rx.medicines}
                instructions={rx.instructions}
                createdAt={rx.created_at}
              />
            ))
          )}
        </motion.div>
      )}

      {/* Reports Tab */}
      {tab === "reports" && user && (
        <motion.div
          key="reports"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <ReportUpload
            userId={user.id}
            onUploaded={() => setReportRefreshKey((k) => k + 1)}
          />
          <ReportList userId={user.id} refreshKey={reportRefreshKey} />
        </motion.div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarDays, FileText, Clock, CheckCircle, XCircle, Plus } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { useLanguage } from "@/lib/i18n/context";
import { t } from "@/lib/i18n/translations";
import { useUser } from "@/lib/hooks/useUser";
import { createClient } from "@/lib/supabase/client";

/* Formatted from Supabase later */
interface Appointment {
  id: string;
  doctor_name: string;
  specialty: string;
  date: string;
  time: string;
  status: string;
}

const mockPrescriptions = [
  { id: "1", doctor: "Dr. Priya Sharma", date: "2025-01-15", medication: "Paracetamol 500mg", dosage: "Twice daily after meals", duration: "5 days" },
  { id: "2", doctor: "Dr. Ravi Kumar", date: "2025-01-10", medication: "Amoxicillin 250mg", dosage: "Three times daily", duration: "7 days" },
];

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
  const [tab, setTab] = useState<"appointments" | "prescriptions">("appointments");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  import("react").then((React) => {
    React.useEffect(() => {
      async function fetchAppointments() {
        if (!user) {
          setIsLoadingData(false);
          return;
        }
        setIsLoadingData(true);
        const supabase = createClient();
        const { data, error } = await supabase
          .from("appointments")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: false });

        if (error) {
          setError(error.message);
        } else {
          setAppointments(data || []);
        }
        setIsLoadingData(false);
      }
      fetchAppointments();
    }, [user]);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-accent-lighter border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 py-8 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-semibold text-white">{t("dashTitle", lang)}</h1>
        <p className="text-white/70 mt-2">{t("dashSubtitle", lang)}</p>
        {user && (
          <p className="text-accent-lighter text-sm mt-1">
            {user.email}
          </p>
        )}
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 justify-center">
        <button
          onClick={() => setTab("appointments")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer border ${
            tab === "appointments"
              ? "bg-accent text-white border-accent shadow-accent"
              : "bg-white/5 text-white/70 border-glass-border hover:bg-white/10"
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          {t("tabAppointments", lang)}
        </button>
        <button
          onClick={() => setTab("prescriptions")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer border ${
            tab === "prescriptions"
              ? "bg-accent text-white border-accent shadow-accent"
              : "bg-white/5 text-white/70 border-glass-border hover:bg-white/10"
          }`}
        >
          <FileText className="w-4 h-4" />
          {t("tabPrescriptions", lang)}
        </button>
      </div>

      {/* Appointments Tab */}
      {tab === "appointments" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex justify-end mb-2">
            <Link
              href="/book"
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-accent-light to-accent text-white text-sm font-semibold shadow-accent hover:shadow-accent-hover transition-all no-underline"
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
              <CalendarDays className="w-12 h-12 text-white/30 mx-auto mb-4" />
              <p className="text-white/60">{t("noAppointments", lang)}</p>
              <Link
                href="/book"
                className="mt-4 inline-block px-6 py-2 rounded-full bg-gradient-to-r from-accent-light to-accent text-white text-sm font-semibold no-underline"
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
                      <h3 className="text-white font-semibold">{apt.doctor_name}</h3>
                      <p className="text-white/60 text-sm">{apt.specialty}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-white/70 flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {apt.date}
                      </div>
                      <div className="text-white/70 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {apt.time}
                      </div>
                      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColors[apt.status] || statusColors.pending}`}>
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {mockPrescriptions.length === 0 ? (
            <GlassCard noHover className="text-center py-12">
              <FileText className="w-12 h-12 text-white/30 mx-auto mb-4" />
              <p className="text-white/60">{t("noPrescriptions", lang)}</p>
            </GlassCard>
          ) : (
            mockPrescriptions.map((rx) => (
              <GlassCard key={rx.id} noHover>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <h3 className="text-white font-semibold">{rx.medication}</h3>
                    <p className="text-white/60 text-sm mt-1">Prescribed by {rx.doctor}</p>
                    <div className="mt-3 space-y-1 text-sm text-white/70">
                      <p>Dosage: {rx.dosage}</p>
                      <p>Duration: {rx.duration}</p>
                    </div>
                  </div>
                  <div className="text-white/50 text-sm flex items-center gap-1 shrink-0">
                    <CalendarDays className="w-3.5 h-3.5" />
                    {rx.date}
                  </div>
                </div>
              </GlassCard>
            ))
          )}
        </motion.div>
      )}
    </div>
  );
}

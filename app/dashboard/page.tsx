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
  LayoutDashboard,
  Trash2,
  Ticket,
  ChevronDown,
  Stethoscope,
  Hash,
  Activity,
  Droplets,
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
  booking_number?: string;
  token_number?: number | null;
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
  const [userName, setUserName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [showRxForm, setShowRxForm] = useState(false);
  const [reportRefreshKey, setReportRefreshKey] = useState(0);
  const [expandedAppt, setExpandedAppt] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [apptRecords, setApptRecords] = useState<Record<string, any[]>>({});

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

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

    // Fetch profile name
    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .single();
    
    if (profile) {
      setUserName(profile.name);
    }

    setIsLoadingData(false);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch records when an appointment is expanded
  useEffect(() => {
    if (!expandedAppt || !user) return;
    // Skip if already fetched
    if (apptRecords[expandedAppt]) return;

    const fetchRecords = async () => {
      const supabase = createClient();
      // Get patient record for this user
      const { data: patient } = await supabase
        .from("patients")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!patient) {
        setApptRecords((prev) => ({ ...prev, [expandedAppt]: [] }));
        return;
      }

      const { data: recs } = await supabase
        .from("records")
        .select("*, doctors(name, specialty)")
        .eq("patient_id", patient.id)
        .order("record_date", { ascending: false });

      setApptRecords((prev) => ({ ...prev, [expandedAppt]: recs || [] }));
    };
    fetchRecords();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedAppt, user]);

  const handlePrescriptionSaved = () => {
    setShowRxForm(false);
    fetchData();
  };

  const handleCancelAppointment = async (aptId: string) => {
    setCancellingId(aptId);
    const supabase = createClient();
    const { error: cancelError } = await supabase
      .from("appointments")
      .update({ status: "cancelled" })
      .eq("id", aptId);

    if (cancelError) {
      setError("Failed to cancel: " + cancelError.message);
    } else {
      setAppointments((prev) =>
        prev.map((a) => (a.id === aptId ? { ...a, status: "cancelled" } : a))
      );
    }
    setCancellingId(null);
  };

  const handleDeleteAppointment = async (aptId: string) => {
    setCancellingId(aptId);
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("appointments")
      .delete()
      .eq("id", aptId);

    if (deleteError) {
      setError("Failed to delete: " + deleteError.message);
    } else {
      setAppointments((prev) => prev.filter((a) => a.id !== aptId));
      setExpandedAppt(null);
    }
    setCancellingId(null);
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
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <LayoutDashboard className="w-8 h-8 text-red-600" />
              {getGreeting()}, {userName || user?.email?.split('@')[0] || "User"}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-lg">
              Welcome back to your health companion.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/book"
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-brand hover:shadow-brand-hover transition-all no-underline"
            >
              <Plus className="w-4 h-4" />
              {t("bookNow", lang)}
            </Link>
          </div>
        </div>
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
              const isExpanded = expandedAppt === apt.id;
              return (
                <GlassCard key={apt.id} noHover>
                  {/* Clickable header */}
                  <div
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                    onClick={() => setExpandedAppt(isExpanded ? null : apt.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                        <Stethoscope className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h3 className="text-gray-900 dark:text-white font-semibold">{apt.doctor_name}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">{apt.specialty}</p>
                      </div>
                      {apt.booking_number && (
                        <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                          #{apt.booking_number}
                        </span>
                      )}
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
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {/* Expanded details panel */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Full Date</p>
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                            {new Date(apt.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Time Slot</p>
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-red-500" />
                            {apt.time}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Booking ID</p>
                          <p className="text-sm font-mono font-bold text-red-600 dark:text-red-400">
                            {apt.booking_number || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Token Number</p>
                          {apt.token_number ? (
                            <p className="text-sm font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                              <Ticket className="w-3.5 h-3.5" />
                              #{String(apt.token_number).padStart(3, '0')}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-400">Pending approval</p>
                          )}
                        </div>
                      </div>

                      {/* Medical Records */}
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          Session Records
                        </h4>
                        {!apptRecords[apt.id] ? (
                          <p className="text-sm text-gray-400 italic">Loading records...</p>
                        ) : apptRecords[apt.id].length === 0 ? (
                          <div className="text-center py-4 text-gray-400">
                            <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No medical records for this appointment yet.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {apptRecords[apt.id].map((rec: any) => (
                              <div key={rec.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs text-gray-500">
                                    {new Date(rec.record_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                                  </span>
                                  <span className="text-xs text-gray-400">{rec.doctors?.name}</span>
                                </div>
                                <div className="flex gap-4 flex-wrap text-sm">
                                  {rec.blood_pressure && (
                                    <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                                      <Activity className="w-3.5 h-3.5 text-rose-500" />
                                      BP: <strong>{rec.blood_pressure}</strong>
                                    </span>
                                  )}
                                  {rec.blood_sugar && (
                                    <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                                      <Droplets className="w-3.5 h-3.5 text-blue-500" />
                                      Sugar: <strong>{rec.blood_sugar}</strong>
                                    </span>
                                  )}
                                </div>
                                {rec.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{rec.description}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-3 flex-wrap mt-4">
                        {(apt.status === 'pending' || apt.status === 'confirmed') && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleCancelAppointment(apt.id); }}
                            disabled={cancellingId === apt.id}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-sm font-semibold hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors border border-yellow-200 dark:border-yellow-800 disabled:opacity-50 cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                            {cancellingId === apt.id ? 'Cancelling...' : 'Cancel Appointment'}
                          </button>
                        )}
                        {apt.status === 'cancelled' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteAppointment(apt.id); }}
                            disabled={cancellingId === apt.id}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm font-semibold hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors border border-red-200 dark:border-red-800 disabled:opacity-50 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                            {cancellingId === apt.id ? 'Deleting...' : 'Delete'}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
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

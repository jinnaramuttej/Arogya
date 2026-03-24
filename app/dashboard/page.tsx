"use client";

<<<<<<< HEAD
import { Activity, Calendar, Pill, Stethoscope, HeartPulse, Droplet, Brain, ShieldCheck, ClipboardCheck } from "lucide-react";
import { useMemo } from "react";
import { useLanguage } from "@/lib/context/LanguageContext";

const QuickStats = () => {
  const { t } = useLanguage();
  const stats = [
    { label: t("nav_records") || "Dashboard", value: "Apr 2, 2026 • 9:30 AM", icon: Calendar },
    { label: t("nav_store") || "Medications", value: "2 Today", icon: Pill },
    { label: t("nav_blood") || "Lab Results", value: "3 New", icon: Droplet },
    { label: t("nav_dashboard") || "Wellness Score", value: "84 / 100", icon: Activity }
=======
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
>>>>>>> 2b623bff7062ad7376e999065d5eabf2cd10f9aa
  ];
  return (
<<<<<<< HEAD
    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-lg shadow-primary/5">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center">
              <stat.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</p>
              <p className="text-lg font-semibold mt-1">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
=======
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
>>>>>>> 2b623bff7062ad7376e999065d5eabf2cd10f9aa
    </div>
  );
};

const vitals = [
  { label: "Heart Rate", value: "72 bpm", trend: "+2 bpm", status: "Stable" },
  { label: "Blood Pressure", value: "118/76", trend: "-4 mmHg", status: "Optimal" },
  { label: "Sleep", value: "7h 32m", trend: "+18m", status: "Good" },
  { label: "Steps", value: "8,240", trend: "+620", status: "On Track" }
];

const appointments = [
  { title: "Primary Care Checkup", date: "Apr 2", time: "9:30 AM", location: "Arogya Clinic - Midtown" },
  { title: "Nutrition Coaching", date: "Apr 5", time: "3:00 PM", location: "Virtual Session" },
  { title: "Dermatology Follow-up", date: "Apr 12", time: "11:15 AM", location: "East Wing, Room 210" }
];

const medications = [
  { name: "Metformin", dose: "500 mg", schedule: "After breakfast", adherence: "92%" },
  { name: "Atorvastatin", dose: "10 mg", schedule: "Night", adherence: "88%" },
  { name: "Vitamin D3", dose: "1000 IU", schedule: "Lunch", adherence: "95%" }
];

const labs = [
  { name: "CBC Panel", status: "Normal", date: "Mar 22", detail: "WBC 6.1 • Hgb 13.8" },
  { name: "Lipid Profile", status: "Review", date: "Mar 20", detail: "LDL 128 • HDL 48" },
  { name: "HbA1c", status: "Improved", date: "Mar 18", detail: "6.2% (↓0.3)" }
];

const tasks = [
  "Log breakfast and water intake",
  "Complete daily mobility stretch",
  "Confirm April checkup details",
  "Share smartwatch sync permission"
];

const PatientDashboard = () => {
  const { t } = useLanguage();
  const userName = useMemo(() => {
    if (typeof window === "undefined") return "Aarav Mehta";
    return localStorage.getItem("az_user_name") || "Aarav Mehta";
  }, []);
  return (
    <div className="min-h-screen bg-background text-foreground">
<main className="pt-32 pb-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">{t("nav_dashboard")}</p>
                <span className="text-[10px] uppercase tracking-[0.3em] px-3 py-1 rounded-full border border-border/60 bg-card/70 text-muted-foreground">
                  Demo Data
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mt-3">
                {t("home_ai_title") || "Welcome back,"} <span className="gradient-text">{userName}</span>
              </h1>
              <div className="mt-3 text-sm text-muted-foreground space-y-1">
                <p>Age 42 • Male • MRN: AZ-239418</p>
                <p>Primary conditions: Type 2 Diabetes, Mild Hypertension</p>
                <p>Allergies: Penicillin • Latex</p>
              </div>
            </div>
          <div className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-lg shadow-primary/5">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Stethoscope className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Primary Physician</p>
                <p className="text-lg font-semibold">Dr. Meera Iyer</p>
                <p className="text-xs text-muted-foreground">Endocrinology • Arogya Midtown</p>
                <p className="text-xs text-muted-foreground mt-1">Last visit: Mar 10, 2026</p>
              </div>
            </div>
          </div>
        </div>

        <QuickStats />

        <div className="mt-12 grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
          <div className="rounded-3xl border border-border/60 bg-card/80 p-8 shadow-lg shadow-primary/5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Vitals & Trends</h2>
              <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Today</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {vitals.map((vital) => (
                <div key={vital.label} className="rounded-2xl border border-border/60 bg-background/60 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{vital.label}</p>
                  <p className="text-2xl font-semibold mt-2">{vital.value}</p>
                  <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                    <span>{vital.status}</span>
                    <span>{vital.trend}</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-muted/60">
                    <div className="h-2 w-2/3 rounded-full bg-gradient-to-r from-primary to-secondary" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-border/60 bg-card/80 p-8 shadow-lg shadow-primary/5">
            <div className="flex items-center gap-3 mb-6">
              <Brain className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">AI Insights</h2>
            </div>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                Your fasting glucose average is down 5% this week. Keep breakfast protein steady to
                maintain the trend.
              </p>
              <p>
                Blood pressure is within target range. Continue sodium tracking for consistent control.
              </p>
              <div className="rounded-2xl border border-border/60 bg-background/60 p-4 text-foreground">
                Suggested focus: <span className="font-semibold">20-minute walk</span> after dinner tonight.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid lg:grid-cols-3 gap-8">
          <div className="rounded-3xl border border-border/60 bg-card/80 p-7 shadow-lg shadow-primary/5">
            <div className="flex items-center gap-3 mb-5">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold">Upcoming Appointments</h3>
            </div>
            <div className="space-y-4">
              {appointments.map((item) => (
                <div key={item.title} className="rounded-2xl border border-border/60 bg-background/60 p-4">
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.date} • {item.time}</p>
                  <p className="text-xs text-muted-foreground">{item.location}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-border/60 bg-card/80 p-7 shadow-lg shadow-primary/5">
            <div className="flex items-center gap-3 mb-5">
              <Pill className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold">Medications</h3>
            </div>
            <div className="space-y-4">
              {medications.map((med) => (
                <div key={med.name} className="rounded-2xl border border-border/60 bg-background/60 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{med.name}</p>
                    <span className="text-xs text-muted-foreground">{med.adherence}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{med.dose} • {med.schedule}</p>
                  <div className="mt-3 h-2 rounded-full bg-muted/60">
                    <div className="h-2 rounded-full bg-primary" style={{ width: med.adherence }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-border/60 bg-card/80 p-7 shadow-lg shadow-primary/5">
            <div className="flex items-center gap-3 mb-5">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold">Lab Results</h3>
            </div>
            <div className="space-y-4">
              {labs.map((lab) => (
                <div key={lab.name} className="rounded-2xl border border-border/60 bg-background/60 p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">{lab.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{lab.date} • {lab.detail}</p>
                  </div>
                  <span className="rounded-full border border-border/60 bg-card/80 px-3 py-1 text-xs font-semibold">
                    {lab.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 rounded-3xl border border-border/60 bg-card/80 p-8 shadow-lg shadow-primary/5">
          <div className="flex items-center gap-3 mb-4">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-semibold">Today’s Care Tasks</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tasks.map((task) => (
              <div key={task} className="rounded-2xl border border-border/60 bg-background/60 p-4 text-sm text-muted-foreground">
                {task}
              </div>
            ))}
          </div>
        </div>
        </div>
      </main>
</div>
  );
};

export default PatientDashboard;

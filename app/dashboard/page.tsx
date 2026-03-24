"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarDays, FileText, Clock, CheckCircle, XCircle, Plus, User } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { useLanguage } from "@/lib/i18n/context";
import { t } from "@/lib/i18n/translations";
import { useUser } from "@/lib/hooks/useUser";
import { createClient } from "@/lib/supabase/client";

// Updated interface to match the new 'records' table structure
interface MedicalRecord {
  id: string;
  record_date: string;
  description: string;
  blood_pressure: string;
  blood_sugar: string;
  doctors: {
    name: string;
    specialty: string;
  };
}

interface Appointment {
  id: string;
  doctor_name: string;
  specialty: string;
  date: string;
  time: string;
  status: string;
  booking_number: string;
}

interface PatientProfile {
    name: string;
    patient_id?: number;
}

export default function DashboardPage() {
  const { lang } = useLanguage();
  const { user, loading: userLoading } = useUser();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) {
        setIsLoadingData(false);
        return;
      }

      setIsLoadingData(true);
      setError(null);
      const supabase = createClient();

      // Fetch patient profile to get the name and patient_id
      const { data: profileData, error: profileError } = await supabase
        .from('patients')
        .select('id, name, patient_id')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profileData) {
        // User has no patient record yet — that's OK, show empty state
        setIsLoadingData(false);
        return;
      }

      setPatientProfile({ name: profileData.name, patient_id: profileData.patient_id });

      // Fetch medical records using the patient's id safely
      const { data: recordsData, error: recordsError } = await supabase
        .from('records')
        .select(`
          id, record_date, description, blood_pressure, blood_sugar,
          doctors ( name, specialty )
        `)
        .eq('patient_id', profileData.id)
        .order("record_date", { ascending: false });

      if (recordsError) {
        setError("Could not fetch medical records. " + recordsError.message);
      } else {
        setRecords(recordsData as unknown as MedicalRecord[]);
      }

      // Fetch appointments
      const { data: apptData } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .order("date", { ascending: false });

      if (apptData) {
        setAppointments(apptData as Appointment[]);
      }
      
      setIsLoadingData(false);
    }

    if (user) {
        fetchDashboardData();
    } else if (!userLoading) {
        setIsLoadingData(false);
    }
  }, [user, userLoading]);

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-2 border-accent-lighter border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 py-8 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-semibold text-white">{t("dashTitle", lang)}</h1>
        {patientProfile && <p className="text-2xl text-accent-lighter mt-2">Welcome, {patientProfile.name}</p>}
        <p className="text-white/70 mt-2">{t("dashSubtitle", lang)}</p>
        {user && (
          <div className="flex flex-col items-center gap-1 mt-3">
            <p className="text-white/80 text-sm">{user.email}</p>
            {patientProfile?.patient_id && (
              <p className="text-accent-light font-mono bg-white/5 px-4 py-1.5 rounded-full text-sm inline-flex items-center gap-2 mt-1 border border-white/10 shadow-sm">
                <span className="opacity-80">Patient ID:</span> 
                <span className="font-bold text-white tracking-widest">{String(patientProfile.patient_id).padStart(5, '0')}</span>
              </p>
            )}
          </div>
        )}
      </motion.div>

      {/* Content Area */}
      <div className="space-y-8">
        {error && (
            <div className="p-4 rounded-xl bg-danger/20 border border-danger/30 text-danger-light text-sm text-center mb-4">
                {error}
            </div>
        )}

        {isLoadingData ? (
            <div className="flex justify-center p-8">
                <div className="w-8 h-8 border-2 border-accent-lighter border-t-transparent rounded-full animate-spin" />
            </div>
        ) : (
            <>
              {/* Appointments Section */}
              <GlassCard noHover>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-accent-lighter" />
                    Your Appointments
                  </h2>
                  <Link
                    href="/book"
                    className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Book New
                  </Link>
                </div>

                {appointments.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-white/60">You have no upcoming appointments.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {appointments.map((apt) => (
                      <div key={apt.id} className="bg-white/5 border border-white/10 p-5 rounded-xl transition-all hover:bg-white/10">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-bold text-white text-lg">{apt.doctor_name}</p>
                            <p className="text-sm text-accent-light bg-accent/10 px-2 py-0.5 rounded-md inline-block mt-1">{apt.specialty}</p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                            apt.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                            apt.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                            'bg-white/10 text-white/70 border border-white/20'
                          }`}>
                            {apt.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/80 mb-4 mt-4">
                          <span className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-accent-lighter"/> {new Date(apt.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric'})}</span>
                          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-accent-lighter"/> {apt.time}</span>
                        </div>
                        {apt.booking_number && (
                          <div className="border-t border-white/10 pt-3 mt-1 flex items-center justify-between">
                            <span className="text-xs text-white/50 uppercase tracking-widest font-semibold flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Reference</span>
                            <span className="font-mono text-sm font-bold tracking-widest text-emerald-300 bg-emerald-900/30 px-2.5 py-1 rounded border border-emerald-500/20">{apt.booking_number}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>

              {/* Medical Records Section */}
              <GlassCard noHover>
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-accent-lighter" />
                  Your Medical Records
                </h2>
                
                {records.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-white/60">No medical records have been uploaded by your doctors yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                      {records.map((rec) => (
                          <div key={rec.id} className="bg-white/5 border border-white/10 p-5 rounded-xl">
                              <div className="flex justify-between items-start mb-2">
                                <p className="font-bold text-lg text-white">Date: {new Date(rec.record_date).toLocaleDateString()}</p>
                                <p className="text-sm text-white/50">Seen by: <span className="text-accent-light">{rec.doctors.name}</span></p>
                              </div>
                              <div className="grid grid-cols-2 gap-4 mb-3 mt-3">
                                <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                                  <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Blood Pressure</p>
                                  <p className="text-white font-medium">{rec.blood_pressure || 'N/A'}</p>
                                </div>
                                <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                                  <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Blood Sugar</p>
                                  <p className="text-white font-medium">{rec.blood_sugar || 'N/A'}</p>
                                </div>
                              </div>
                              <div className="mt-3 bg-white/5 p-4 rounded-lg">
                                <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Doctor Notes</p>
                                <p className="text-white/90 leading-relaxed text-sm">{rec.description}</p>
                              </div>
                          </div>
                      ))}
                  </div>
                )}
              </GlassCard>
            </>
        )}
      </div>
    </div>
  );
}

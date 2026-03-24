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

interface PatientProfile {
    name: string;
}

export default function DashboardPage() {
  const { lang } = useLanguage();
  const { user, loading: userLoading } = useUser();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
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

      // Fetch patient profile to get the name
      const { data: profileData, error: profileError } = await supabase
        .from('patients')
        .select('id, name')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profileData) {
        // User has no patient record yet — that's OK, show empty state
        setIsLoadingData(false);
        return;
      }

      setPatientProfile({ name: profileData.name });

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
          <p className="text-accent-lighter text-sm mt-1">
            {user.email}
          </p>
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
        ) : records.length === 0 ? (
            <GlassCard noHover className="text-center py-12">
                <CalendarDays className="w-12 h-12 text-white/30 mx-auto mb-4" />
                <p className="text-white/60">You have no upcoming or past appointments.</p>
                <Link
                    href="/book"
                    className="mt-4 inline-block px-6 py-2 rounded-full bg-gradient-to-r from-accent-light to-accent text-white text-sm font-semibold no-underline"
                >
                    Book Now
                </Link>
            </GlassCard>
        ) : (
            <GlassCard noHover>
                <h2 className="text-xl font-bold text-white mb-4">Your Medical Records</h2>
                <div className="space-y-6">
                    {records.map((rec) => (
                        <div key={rec.id} className="border-t border-glass-border pt-4">
                            <p className="font-bold text-lg text-white">Date: {new Date(rec.record_date).toLocaleDateString()}</p>
                            <p className="text-sm text-gray-400 mb-2">Seen by: {rec.doctors.name} ({rec.doctors.specialty})</p>
                            <p><span className="font-semibold text-white/80">Blood Pressure:</span> {rec.blood_pressure || 'N/A'}</p>
                            <p><span className="font-semibold text-white/80">Blood Sugar:</span> {rec.blood_sugar || 'N/A'}</p>
                            <p className="mt-2"><span className="font-semibold text-white/80">Notes:</span> {rec.description}</p>
                        </div>
                    ))}
                </div>
            </GlassCard>
        )}
      </div>
    </div>
  );
}

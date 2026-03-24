"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/hooks/useUser';
import { Users, Loader2, AlertCircle, Hash, Eye } from 'lucide-react';
import Link from 'next/link';

interface Patient {
  id: string;
  patient_id: number;
  name: string;
}

const DoctorPatientsPage = () => {
  const { user } = useUser();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchMyPatients = async () => {
      if (!user?.email) return;

      setLoading(true);

      // Get the doctor's record ID
      const { data: doctor } = await supabase
        .from('doctors')
        .select('id')
        .eq('email', user.email)
        .single();

      if (!doctor) {
        setError('Doctor profile not found.');
        setLoading(false);
        return;
      }

      // Get unique patients who have records with this doctor
      const { data: records, error: recError } = await supabase
        .from('records')
        .select('patient_id, patients ( id, patient_id, name )')
        .eq('doctor_id', doctor.id);

      if (recError) {
        setError(recError.message);
      } else if (records) {
        // De-duplicate patients
        const seen = new Set<string>();
        const uniquePatients: Patient[] = [];
        for (const rec of records as any[]) {
          const p = rec.patients;
          if (p && !seen.has(p.id)) {
            seen.add(p.id);
            uniquePatients.push({ id: p.id, patient_id: p.patient_id, name: p.name });
          }
        }
        setPatients(uniquePatients);
      }

      setLoading(false);
    };

    fetchMyPatients();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <Users className="w-8 h-8 text-emerald-500" />
        My Patients
      </h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <p className="text-sm text-gray-500">Patients you have treated or created records for</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16 text-gray-500 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading your patients...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-6 bg-red-50 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>Error: {error}</span>
          </div>
        )}

        {!loading && !error && patients.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No patients yet</p>
            <p className="text-sm">Patients will appear here once you create medical records for them.</p>
          </div>
        )}

        {!loading && !error && patients.length > 0 && (
          <div className="divide-y divide-gray-100">
            {patients.map(patient => (
              <div key={patient.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                    {patient.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{patient.name}</p>
                    <span className="inline-flex items-center gap-1 text-sm text-gray-500 font-mono">
                      <Hash className="w-3 h-3" />
                      {String(patient.patient_id).padStart(5, '0')}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/doctor?search=${patient.patient_id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Records
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorPatientsPage;

"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/hooks/useUser';
import { FileText, Loader2, AlertCircle, Activity, Droplets, Stethoscope, Hash } from 'lucide-react';

interface MedicalRecord {
  id: string;
  record_date: string;
  blood_pressure: string;
  blood_sugar: string;
  description: string;
  patients: { name: string; patient_id: number };
}

const DoctorRecordsPage = () => {
  const { user } = useUser();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchMyRecords = async () => {
      if (!user?.email) return;

      setLoading(true);

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

      const { data, error: recError } = await supabase
        .from('records')
        .select('id, record_date, blood_pressure, blood_sugar, description, patients ( name, patient_id )')
        .eq('doctor_id', doctor.id)
        .order('record_date', { ascending: false });

      if (recError) {
        setError(recError.message);
      } else {
        // Safe casting: Supabase join returns object for 1-1 relationship but TS may see it as array
        const formattedRecords = (data as any[]).map(rec => ({
          ...rec,
          patients: Array.isArray(rec.patients) ? rec.patients[0] : rec.patients
        }));
        setRecords(formattedRecords as MedicalRecord[]);
      }

      setLoading(false);
    };

    fetchMyRecords();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <FileText className="w-8 h-8 text-emerald-500" />
        My Medical Records
        {records.length > 0 && (
          <span className="text-sm bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-normal">
            {records.length} record{records.length !== 1 ? 's' : ''}
          </span>
        )}
      </h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center py-16 text-gray-500 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading your records...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-6 bg-red-50 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>Error: {error}</span>
          </div>
        )}

        {!loading && !error && records.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No records created yet</p>
            <p className="text-sm">Records you create for patients will appear here.</p>
          </div>
        )}

        {!loading && !error && records.length > 0 && (
          <div className="divide-y divide-gray-100">
            {records.map(record => (
              <div key={record.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-wrap items-center justify-between mb-3">
                  <p className="font-bold text-lg text-gray-800">
                    {new Date(record.record_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700 font-medium">{record.patients?.name}</span>
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-mono">
                      <Hash className="w-3 h-3" />
                      {String(record.patients?.patient_id).padStart(5, '0')}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border">
                    <Activity className="w-4 h-4 text-rose-500" />
                    <div>
                      <p className="text-xs text-gray-500">Blood Pressure</p>
                      <p className="font-semibold text-gray-800">{record.blood_pressure || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-xs text-gray-500">Blood Sugar</p>
                      <p className="font-semibold text-gray-800">{record.blood_sugar || 'N/A'}</p>
                    </div>
                  </div>
                  {record.description && (
                    <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg border">
                      <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Notes</p>
                        <p className="text-sm text-gray-700">{record.description}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorRecordsPage;

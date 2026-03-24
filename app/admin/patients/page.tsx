"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Users, Eye, Loader2, AlertCircle, UserPlus, Hash, Trash2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface Patient {
  id: string;
  patient_id: number;
  name: string;
  details: Record<string, unknown> | null;
}

const ManagePatientsPage = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const supabase = createClient();

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleDeletePatient = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to completely delete the patient record for ${name}? This will also delete all of their medical records. This action cannot be undone.`)) {
      return;
    }

    const { error } = await supabase.from('patients').delete().eq('id', id);

    if (error) {
      showNotification('error', 'Error deleting patient: ' + error.message);
    } else {
      setPatients(patients.filter(p => p.id !== id));
      showNotification('success', `Patient ${name} removed successfully.`);
    }
  };

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('patients')
        .select('id, patient_id, name, details')
        .order('name', { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setPatients(data as Patient[]);
      }
      setLoading(false);
    };
    fetchPatients();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <Users className="w-8 h-8 text-blue-500" />
        Patient Management
      </h1>

      {notification && (
        <div className={`flex items-center gap-3 p-4 rounded-lg mb-6 transition-all ${
          notification.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {notification.type === 'success'
            ? <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            : <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          }
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Stats Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-lg shadow-md flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-50">
            <Users className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Patients</p>
            <p className="text-2xl font-bold text-gray-800">{loading ? '...' : patients.length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-md flex items-center gap-4">
          <div className="p-3 rounded-lg bg-emerald-50">
            <UserPlus className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">ID Format</p>
            <p className="text-2xl font-bold text-gray-800">5-Digit</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-md flex items-center gap-4">
          <div className="p-3 rounded-lg bg-violet-50">
            <Hash className="w-6 h-6 text-violet-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">ID Range</p>
            <p className="text-2xl font-bold text-gray-800">10000–99999</p>
          </div>
        </div>
      </div>

      {/* Patient List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-700">All Patients</h2>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16 text-gray-500 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading patients...</span>
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
            <p className="font-medium">No patients found</p>
            <p className="text-sm">Patient records will appear here once added to the system.</p>
          </div>
        )}

        {!loading && !error && patients.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-mono font-semibold">
                        <Hash className="w-3.5 h-3.5" />
                        {String(patient.patient_id).padStart(5, '0')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-sm">
                          {patient.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <span className="font-medium text-gray-800">{patient.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Link
                          href={`/admin/patients/${patient.patient_id}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View Profile
                        </Link>
                        <button
                          onClick={() => handleDeletePatient(patient.id, patient.name)}
                          className="p-2 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer border-none"
                          title="Delete Patient"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagePatientsPage;

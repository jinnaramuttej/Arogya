"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, User, BookText, AlertCircle, Loader2, Activity, Droplets, FileText, Stethoscope, Hash } from 'lucide-react';

interface Patient {
  id: string;
  patient_id: number;
  name: string;
  details: Record<string, unknown> | null;
}

interface MedicalRecord {
  id: string;
  record_date: string;
  blood_pressure: string;
  blood_sugar: string;
  description: string;
  doctors: { name: string; specialty: string };
}

const ReportsPage = () => {
  const [patientIdSearch, setPatientIdSearch] = useState('');
  const [searchedPatient, setSearchedPatient] = useState<Patient | null>(null);
  const [patientRecords, setPatientRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const supabase = createClient();

  const handleSearchPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientIdSearch) return;

    setLoading(true);
    setError(null);
    setSearchedPatient(null);
    setPatientRecords([]);
    setHasSearched(true);

    const { data: patientData, error: patientError } = await supabase
      .from('patients')
      .select('*')
      .eq('patient_id', parseInt(patientIdSearch))
      .single();

    if (patientError || !patientData) {
      setError('Patient not found. Please check the ID and try again.');
      setLoading(false);
      return;
    }

    setSearchedPatient(patientData as Patient);

    const { data: recordsData, error: recordsError } = await supabase
      .from('records')
      .select(`*, doctors ( name, specialty )`)
      .eq('patient_id', patientData.id)
      .order('record_date', { ascending: false });

    if (recordsError) {
      setError('Error fetching patient records: ' + recordsError.message);
    } else {
      setPatientRecords(recordsData as MedicalRecord[]);
    }

    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <BookText className="w-8 h-8 text-amber-500" />
        Reports Library
      </h1>

      {/* Search Bar */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Patient Record Lookup</h2>
        <form onSubmit={handleSearchPatient} className="flex items-center gap-4">
          <Search className="w-6 h-6 text-gray-400 flex-shrink-0" />
          <input
            type="number"
            placeholder="Enter 5-Digit Patient ID..."
            value={patientIdSearch}
            onChange={(e) => setPatientIdSearch(e.target.value)}
            className="flex-grow p-3 border-2 border-gray-300 rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white py-3 px-6 rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Searching...</>
            ) : (
              'Search'
            )}
          </button>
        </form>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 text-red-700 border border-red-200 mb-8">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Empty State before search */}
      {!hasSearched && !loading && (
        <div className="bg-white p-12 rounded-lg shadow-md text-center text-gray-400">
          <Search className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium text-gray-500">Search for patient reports</p>
          <p className="text-sm">Enter a 5-digit Patient ID above to view their details and medical history.</p>
        </div>
      )}

      {/* Patient Information & Records */}
      {searchedPatient && (
        <div className="space-y-6">
          {/* Patient Details Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 text-blue-600 font-bold">
                {searchedPatient.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              {searchedPatient.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Patient ID</p>
                <p className="font-semibold text-gray-800 text-lg flex items-center gap-1">
                  <Hash className="w-4 h-4 text-blue-500" />
                  {String(searchedPatient.patient_id).padStart(5, '0')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Full Name</p>
                <p className="font-semibold text-gray-800 text-lg">{searchedPatient.name}</p>
              </div>
            </div>
          </div>

          {/* Medical History */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-gray-700 mb-6 flex items-center">
              <BookText className="w-6 h-6 mr-2 text-gray-500" />
              Medical History
              {patientRecords.length > 0 && (
                <span className="ml-2 text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-normal">
                  {patientRecords.length} record{patientRecords.length !== 1 ? 's' : ''}
                </span>
              )}
            </h3>

            {patientRecords.length > 0 ? (
              <div className="space-y-4">
                {patientRecords.map(record => (
                  <div key={record.id} className="border rounded-lg p-5 bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-wrap items-center justify-between mb-3">
                      <p className="font-bold text-lg text-gray-800">
                        {new Date(record.record_date).toLocaleDateString('en-IN', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Stethoscope className="w-3.5 h-3.5" />
                        {record.doctors.name} ({record.doctors.specialty})
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div className="flex items-center gap-2 bg-white p-3 rounded-lg border">
                        <Activity className="w-4 h-4 text-rose-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Blood Pressure</p>
                          <p className="font-semibold text-gray-800">{record.blood_pressure || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-white p-3 rounded-lg border">
                        <Droplets className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Blood Sugar</p>
                          <p className="font-semibold text-gray-800">{record.blood_sugar || 'N/A'}</p>
                        </div>
                      </div>
                      {record.description && (
                        <div className="flex items-start gap-2 bg-white p-3 rounded-lg border sm:col-span-2 lg:col-span-1">
                          <FileText className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
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
            ) : (
              <div className="text-center py-10 text-gray-400">
                <BookText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No medical records found</p>
                <p className="text-sm">This patient has no recorded visits yet.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;

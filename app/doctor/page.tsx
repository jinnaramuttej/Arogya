"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/hooks/useUser';
import { Search, User, PlusCircle, BookText, Stethoscope, AlertCircle, CheckCircle2, Loader2, Activity, Droplets, FileText, Hash } from 'lucide-react';

interface Doctor {
  id: string;
  doctor_id: number;
  name: string;
  specialty: string;
}

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

interface Notification {
  type: 'success' | 'error';
  message: string;
}

const DoctorDashboardPage = () => {
  const { user, loading: userLoading } = useUser();
  const [doctorProfile, setDoctorProfile] = useState<Doctor | null>(null);
  const [patientIdSearch, setPatientIdSearch] = useState('');
  const [searchedPatient, setSearchedPatient] = useState<Patient | null>(null);
  const [patientRecords, setPatientRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [newBp, setNewBp] = useState('');
  const [newSugar, setNewSugar] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const supabase = createClient();

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch doctor profile based on logged-in user email
  useEffect(() => {
    const fetchDoctorProfile = async () => {
      if (!user?.email) return;
      const { data } = await supabase
        .from('doctors')
        .select('id, doctor_id, name, specialty')
        .eq('email', user.email)
        .single();
      if (data) setDoctorProfile(data as Doctor);
    };
    fetchDoctorProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSearchPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientIdSearch) return;

    setLoading(true);
    setError(null);
    setSearchedPatient(null);
    setPatientRecords([]);

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

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchedPatient || (!newBp && !newSugar && !newDescription)) {
      showNotification('error', 'Please fill out at least one field for the new record.');
      return;
    }

    if (!doctorProfile) {
      showNotification('error', 'Doctor profile not found. Please contact admin.');
      return;
    }

    setSubmitting(true);
    const { error: insertError } = await supabase
      .from('records')
      .insert([{
        patient_id: searchedPatient.id,
        doctor_id: doctorProfile.id,
        blood_pressure: newBp,
        blood_sugar: newSugar,
        description: newDescription,
      }]);

    if (insertError) {
      showNotification('error', 'Error adding record: ' + insertError.message);
    } else {
      showNotification('success', 'Medical record added successfully!');
      // Refresh records
      handleSearchPatient(e);
      setNewBp('');
      setNewSugar('');
      setNewDescription('');
    }
    setSubmitting(false);
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500 gap-2">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Doctor Welcome Banner */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
            <Stethoscope className="w-7 h-7 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {doctorProfile ? `Welcome, Dr. ${doctorProfile.name}` : 'Doctor Dashboard'}
            </h1>
            <p className="text-gray-500">
              {doctorProfile ? `${doctorProfile.specialty} • ID: ${doctorProfile.doctor_id}` : user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`flex items-center gap-3 p-4 rounded-lg mb-6 ${
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

      {/* Patient Search */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Search Patient by ID</h2>
        <form onSubmit={handleSearchPatient} className="flex items-center gap-4">
          <Search className="w-6 h-6 text-gray-400 flex-shrink-0" />
          <input
            type="number"
            placeholder="Enter 5-Digit Patient ID..."
            value={patientIdSearch}
            onChange={(e) => setPatientIdSearch(e.target.value)}
            className="flex-grow p-3 border-2 border-gray-300 rounded-md bg-gray-50 focus:ring-2 focus:ring-emerald-300 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder-gray-400"
          />
          <button type="submit" disabled={loading} className="bg-emerald-500 text-white py-3 px-6 rounded-md hover:bg-emerald-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Searching...</> : 'Search'}
          </button>
        </form>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 text-red-700 border border-red-200 mb-6">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Patient Details and Record Entry */}
      {searchedPatient && (
        <div className="space-y-6">
          {/* Patient Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                {searchedPatient.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{searchedPatient.name}</h2>
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-blue-50 text-blue-700 text-sm font-mono font-semibold">
                  <Hash className="w-3.5 h-3.5" />
                  {String(searchedPatient.patient_id).padStart(5, '0')}
                </span>
              </div>
            </div>
          </div>

          {/* Add New Record */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center">
              <PlusCircle className="w-6 h-6 mr-2 text-emerald-500" />
              Add New Medical Record
            </h3>
            <form onSubmit={handleAddRecord} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Blood Pressure (e.g., 120/80)"
                    value={newBp}
                    onChange={e => setNewBp(e.target.value)}
                    className="pl-10 p-3 border-2 border-gray-300 rounded-md w-full bg-gray-50 focus:ring-2 focus:ring-emerald-300 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder-gray-400"
                  />
                </div>
                <div className="relative">
                  <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Blood Sugar (e.g., 95 mg/dL)"
                    value={newSugar}
                    onChange={e => setNewSugar(e.target.value)}
                    className="pl-10 p-3 border-2 border-gray-300 rounded-md w-full bg-gray-50 focus:ring-2 focus:ring-emerald-300 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder-gray-400"
                  />
                </div>
              </div>
              <textarea
                placeholder="Doctor's notes and observations..."
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 rounded-md bg-gray-50 focus:ring-2 focus:ring-emerald-300 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder-gray-400 h-28 resize-none"
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-emerald-500 text-white py-2.5 px-4 rounded-md hover:bg-emerald-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Medical Record'}
              </button>
            </form>
          </div>

          {/* Past Medical Records */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center">
              <BookText className="w-6 h-6 mr-2 text-gray-500" />
              Patient Medical History
              {patientRecords.length > 0 && (
                <span className="ml-2 text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-normal">
                  {patientRecords.length} record{patientRecords.length !== 1 ? 's' : ''}
                </span>
              )}
            </h3>
            {patientRecords.length > 0 ? (
              <div className="space-y-4">
                {patientRecords.map(record => (
                  <div key={record.id} className="border rounded-lg p-5 bg-gray-50">
                    <div className="flex flex-wrap items-center justify-between mb-3">
                      <p className="font-bold text-lg text-gray-800">
                        {new Date(record.record_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Stethoscope className="w-3.5 h-3.5" />
                        {record.doctors.name} ({record.doctors.specialty})
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="flex items-center gap-2 bg-white p-3 rounded-lg border">
                        <Activity className="w-4 h-4 text-rose-500" />
                        <div>
                          <p className="text-xs text-gray-500">Blood Pressure</p>
                          <p className="font-semibold text-gray-800">{record.blood_pressure || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-white p-3 rounded-lg border">
                        <Droplets className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="text-xs text-gray-500">Blood Sugar</p>
                          <p className="font-semibold text-gray-800">{record.blood_sugar || 'N/A'}</p>
                        </div>
                      </div>
                      {record.description && (
                        <div className="flex items-start gap-2 bg-white p-3 rounded-lg border">
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

      {/* Pre-search empty state */}
      {!searchedPatient && !error && !loading && (
        <div className="bg-white p-12 rounded-lg shadow-md text-center text-gray-400">
          <Search className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium text-gray-500">Search for a patient</p>
          <p className="text-sm">Enter a 5-digit Patient ID to view their records and add new entries.</p>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboardPage;

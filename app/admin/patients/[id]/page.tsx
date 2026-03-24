"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User, BookText, Activity, Droplets, FileText, Stethoscope, Loader2, AlertCircle, ArrowLeft, Hash, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Patient {
  id: string;
  patient_id: number;
  name: string;
  details: Record<string, any> | null;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
}

interface MedicalRecord {
  id: string;
  record_date: string;
  blood_pressure: string;
  blood_sugar: string;
  description: string;
  doctors: { name: string; specialty: string };
}

const PatientProfilePage = () => {
  const params = useParams();
  const patientIdParam = params.id as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [updatingDoctor, setUpdatingDoctor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const supabase = createClient();

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAssignDoctor = async () => {
    if (!patient) return;
    setUpdatingDoctor(true);
    
    const assignedDoc = doctors.find(d => d.id === selectedDoctorId);
    
    const newDetails = {
      ...(patient.details || {}),
      assigned_doctor_id: selectedDoctorId,
      assigned_doctor_name: assignedDoc ? `Dr. ${assignedDoc.name}` : null
    };

    const { error: updateError } = await supabase
      .from('patients')
      .update({ details: newDetails })
      .eq('id', patient.id);

    if (updateError) {
      showNotification('error', 'Failed to assign doctor: ' + updateError.message);
    } else {
      setPatient({ ...patient, details: newDetails });
      showNotification('success', 'Doctor assigned successfully!');
    }
    setUpdatingDoctor(false);
  };

  useEffect(() => {
    const fetchPatientProfile = async () => {
      setLoading(true);
      setError(null);

      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('patient_id', parseInt(patientIdParam))
        .single();

      if (patientError || !patientData) {
        setError('Patient not found. The patient ID may be incorrect.');
        setLoading(false);
        return;
      }

      if (patientData.details?.assigned_doctor_id) {
        setSelectedDoctorId(patientData.details.assigned_doctor_id);
      }
      setPatient(patientData as Patient);

      const { data: docs } = await supabase.from('doctors').select('id, name, specialty').order('name');
      if (docs) setDoctors(docs);

      const { data: recordsData, error: recordsError } = await supabase
        .from('records')
        .select(`*, doctors ( name, specialty )`)
        .eq('patient_id', patientData.id)
        .order('record_date', { ascending: false });

      if (recordsError) {
        setError('Error fetching medical records: ' + recordsError.message);
      } else {
        setRecords(recordsData as MedicalRecord[]);
      }

      setLoading(false);
    };

    fetchPatientProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientIdParam]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500 gap-2">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="text-lg">Loading patient profile...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Link href="/admin/patients" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Patient List
        </Link>
        <div className="flex items-center gap-3 p-6 rounded-lg bg-red-50 text-red-700 border border-red-200">
          <AlertCircle className="w-6 h-6 flex-shrink-0" />
          <div>
            <p className="font-semibold">Patient Not Found</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Back Link */}
      <Link href="/admin/patients" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Patient List
      </Link>

      {/* Notification */}
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

      {/* Patient Header Card */}
      {patient && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl flex-shrink-0">
              {patient.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{patient.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-mono font-semibold">
                  <Hash className="w-3.5 h-3.5" />
                  {String(patient.patient_id).padStart(5, '0')}
                </span>
                {patient.details?.assigned_doctor_name && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold ml-2">
                    <Stethoscope className="w-3.5 h-3.5" />
                    {patient.details.assigned_doctor_name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Doctor Component */}
      {patient && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-emerald-100">
          <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-500" />
            Assign Doctor
          </h3>
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-grow w-full">
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Select Primary Doctor</label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-emerald-300 focus:border-emerald-500 outline-none transition-all"
              >
                <option value="">-- No doctor assigned --</option>
                {doctors.map(doc => (
                  <option key={doc.id} value={doc.id}>
                    Dr. {doc.name} ({doc.specialty})
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAssignDoctor}
              disabled={updatingDoctor || selectedDoctorId === (patient.details?.assigned_doctor_id || '')}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors flex items-center gap-2 w-full sm:w-auto justify-center disabled:cursor-not-allowed"
            >
              {updatingDoctor ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Assignment'}
            </button>
          </div>
        </div>
      )}

      {/* Medical History */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-gray-700 mb-6 flex items-center">
          <BookText className="w-6 h-6 mr-2 text-gray-500" />
          Medical History
          {records.length > 0 && (
            <span className="ml-2 text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-normal">
              {records.length} record{records.length !== 1 ? 's' : ''}
            </span>
          )}
        </h3>

        {records.length > 0 ? (
          <div className="space-y-4">
            {records.map(record => (
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
  );
};

export default PatientProfilePage;

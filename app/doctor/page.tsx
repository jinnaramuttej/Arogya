"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/hooks/useUser';
import { Search, User, PlusCircle, BookText, Stethoscope, AlertCircle, CheckCircle2, Loader2, Activity, Droplets, FileText, Hash, CalendarDays, Clock, Upload, Download, Check, XCircle, Ticket, ChevronRight } from 'lucide-react';

interface Doctor {
  id: string;
  doctor_id: number;
  name: string;
  specialty: string;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  status: string;
  booking_number: string;
  token_number: number | null;
  patient_name: string;
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
  file_url: string | null;
  file_name: string | null;
  doctors: { name: string; specialty: string };
}

interface Notification {
  type: 'success' | 'error';
  message: string;
}

interface RecordField {
  id: string;
  field_name: string;
  field_type: string;
  is_required: boolean;
}

const DoctorDashboardPage = () => {
  const { user, loading: userLoading } = useUser();
  const [doctorProfile, setDoctorProfile] = useState<Doctor | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedPatient, setSearchedPatient] = useState<Patient | null>(null);
  const [patientRecords, setPatientRecords] = useState<MedicalRecord[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [newBp, setNewBp] = useState('');
  const [newSugar, setNewSugar] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Dynamic fields from admin settings
  const [recordFields, setRecordFields] = useState<RecordField[]>([]);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});

  const supabase = createClient();

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch doctor profile based on logged-in user email
  useEffect(() => {
    // Autofill search query with today's YYYYMMDD prefix
    const todayStr = new Date().toISOString().split("T")[0];
    setSearchQuery(todayStr.replace(/-/g, ""));

    const fetchDoctorProfile = async () => {
      if (!user?.email) return;
      const { data } = await supabase
        .from('doctors')
        .select('id, doctor_id, name, specialty')
        .eq('email', user.email)
        .single();
        
      if (data) {
        setDoctorProfile(data as Doctor);
        
        // Fetch upcoming appointments for this doctor
        const { data: apptData } = await supabase
          .from('appointments')
          .select('*')
          .eq('doctor_id', data.id)
          .order('date', { ascending: true })
          .order('time', { ascending: true });

        if (apptData && apptData.length > 0) {
          // Fetch patient names
          const userIds = apptData.map((a: any) => a.user_id);
          const { data: profiles } = await supabase.from('profiles').select('id, name').in('id', userIds);
          
          const mappedAppts = apptData.map((a: any) => ({
            ...a,
            patient_name: profiles?.find(p => p.id === a.user_id)?.name || 'Unknown Patient'
          }));
          setUpcomingAppointments(mappedAppts);
        }
      }
    }
    fetchDoctorProfile();

    // Also fetch dynamic record fields
    const fetchRecordFields = async () => {
      const { data } = await supabase.from('record_fields').select('*').order('sort_order');
      if (data) setRecordFields(data);
    };
    fetchRecordFields();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSearchPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setLoading(true);
    setError(null);
    setSearchedPatient(null);
    setPatientRecords([]);

    let patientData = null;

    // Check if it looks like a booking number (length > 6)
    if (query.length > 6) {
      // Find patient user_id from appointments
      const { data: appt, error: apptError } = await supabase
        .from('appointments')
        .select('user_id')
        .eq('booking_number', query)
        .single();

      if (apptError || !appt) {
        setError('Booking number not found. Please check and try again.');
        setLoading(false);
        return;
      }

      // Fetch the actual patient profile using user_id
      const { data: pData, error: pError } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', appt.user_id)
        .single();

      if (pError || !pData) {
        setError('Patient profile linked to this booking not found.');
        setLoading(false);
        return;
      }
      patientData = pData;

    } else {
      // Treat as a 5-digit Patient ID
      const { data: pData, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('patient_id', parseInt(query))
        .single();

      if (patientError || !pData) {
        setError('Patient not found. Please check the 5-digit ID and try again.');
        setLoading(false);
        return;
      }
      patientData = pData;
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

  // Approve appointment: set confirmed + assign 3-digit token
  const handleApproveAppointment = async (appointmentId: string) => {
    // Get current max token for today
    const today = new Date().toISOString().split('T')[0];
    const { data: todayAppts } = await supabase
      .from('appointments')
      .select('token_number')
      .eq('date', today)
      .eq('status', 'confirmed')
      .not('token_number', 'is', null)
      .order('token_number', { ascending: false })
      .limit(1);

    const nextToken = (todayAppts && todayAppts.length > 0 && todayAppts[0].token_number)
      ? todayAppts[0].token_number + 1
      : 1;

    const { error } = await supabase
      .from('appointments')
      .update({ status: 'confirmed', token_number: nextToken })
      .eq('id', appointmentId);

    if (error) {
      showNotification('error', 'Failed to approve: ' + error.message);
    } else {
      showNotification('success', `Appointment approved! Token #${String(nextToken).padStart(3, '0')} assigned.`);
      // Update local state
      setUpcomingAppointments(prev => prev.map(a =>
        a.id === appointmentId ? { ...a, status: 'confirmed', token_number: nextToken } : a
      ));
    }
  };

  // Reject appointment
  const handleRejectAppointment = async (appointmentId: string) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', appointmentId);

    if (error) {
      showNotification('error', 'Failed to reject: ' + error.message);
    } else {
      showNotification('success', 'Appointment rejected.');
      setUpcomingAppointments(prev => prev.map(a =>
        a.id === appointmentId ? { ...a, status: 'cancelled' } : a
      ));
    }
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

    let fileUrl: string | null = null;
    let fileName: string | null = null;

    // Upload file to Cloudinary if selected
    if (selectedFile) {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      if (!cloudName) {
        showNotification('error', 'Cloudinary cloud name is not configured. Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME to .env.local');
        setSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('upload_preset', 'oqens-arogya');
      formData.append('folder', `arogya/medical-reports/${searchedPatient.patient_id}`);

      try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();

        if (data.error) {
          showNotification('error', 'Upload failed: ' + data.error.message);
          setSubmitting(false);
          return;
        }

        fileUrl = data.secure_url;
        fileName = selectedFile.name;
      } catch (err: any) {
        showNotification('error', 'Upload failed: ' + (err?.message || 'Network error'));
        setSubmitting(false);
        return;
      }
    }

    const { error: insertError } = await supabase
      .from('records')
      .insert([{
        patient_id: searchedPatient.id,
        doctor_id: doctorProfile.id,
        blood_pressure: newBp,
        blood_sugar: newSugar,
        description: newDescription,
        file_url: fileUrl,
        file_name: fileName,
        custom_data: customFieldValues,
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
      setSelectedFile(null);
      setCustomFieldValues({});
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

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-emerald-500" />
          My Scheduled Appointments
        </h2>
        
        {upcomingAppointments.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>No upcoming appointments found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {upcomingAppointments.map(appt => (
              <div key={appt.id} className="border border-gray-100 bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                {/* Clickable header area -> goes to session page */}
                <Link href={`/doctor/appointments/${appt.id}`} className="block p-5 hover:bg-emerald-50/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold text-gray-800 text-lg">{appt.patient_name}</p>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1"><CalendarDays className="w-4 h-4"/> {new Date(appt.date).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> {appt.time}</span>
                      </div>
                    </div>
                  <div className="flex items-center gap-2">
                    {appt.token_number && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1">
                        <Ticket className="w-3.5 h-3.5" />
                        #{String(appt.token_number).padStart(3, '0')}
                      </span>
                    )}
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                      appt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                      appt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      appt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-gray-200 text-gray-700'
                    }`}>
                      {appt.status}
                    </span>
                  </div>
                </div>
                  {appt.booking_number && (
                    <div className="mt-3 pt-2 border-t border-gray-200 flex items-center justify-between">
                      <span className="text-xs text-gray-500 uppercase font-semibold">Booking ID</span>
                      <span className="font-mono text-sm font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">{appt.booking_number}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-end mt-2 text-xs text-emerald-600 font-semibold gap-1">
                    View Session <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
                {/* Approve / Reject Buttons - outside the link */}
                {appt.status === 'pending' && (
                  <div className="px-5 pb-4 flex gap-3">
                    <button
                      onClick={() => handleApproveAppointment(appt.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors font-semibold text-sm"
                    >
                      <Check className="w-4 h-4" /> Approve
                    </button>
                    <button
                      onClick={() => handleRejectAppointment(appt.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors font-semibold text-sm"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Patient Search */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Search Patient (Booking No. or ID)</h2>
        <form onSubmit={handleSearchPatient} className="flex items-center gap-4">
          <Search className="w-6 h-6 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Enter YYYYMMDD Booking Number or 5-Digit Patient ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow p-3 border-2 border-gray-300 rounded-md bg-gray-50 focus:ring-2 focus:ring-emerald-300 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder-gray-400 font-mono text-lg tracking-wider"
          />
          <button type="submit" disabled={loading || !searchQuery} className="bg-emerald-500 text-white py-3 px-6 rounded-md hover:bg-emerald-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 font-semibold">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Searching</> : 'Lookup Patient'}
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
                className="w-full p-3 border-2 border-gray-300 rounded-md bg-gray-50 focus:ring-2 focus:ring-emerald-300 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder-gray-400 h-28 resize-none text-gray-800"
              />
              {/* Dynamic Admin-Defined Fields */}
              {recordFields.length > 0 && (
                <div className="border-t-2 border-dashed border-gray-200 pt-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">Additional Fields</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recordFields.map(field => (
                      <div key={field.id}>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          {field.field_name}
                          {field.is_required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {field.field_type === 'text' && (
                          <input
                            type="text"
                            placeholder={`Enter ${field.field_name}...`}
                            value={customFieldValues[field.field_name] || ''}
                            onChange={e => setCustomFieldValues({...customFieldValues, [field.field_name]: e.target.value})}
                            className="p-3 border-2 border-gray-300 rounded-md w-full bg-gray-50 focus:ring-2 focus:ring-emerald-300 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder-gray-400 text-gray-800"
                          />
                        )}
                        {field.field_type === 'url' && (
                          <input
                            type="url"
                            placeholder="https://..."
                            value={customFieldValues[field.field_name] || ''}
                            onChange={e => setCustomFieldValues({...customFieldValues, [field.field_name]: e.target.value})}
                            className="p-3 border-2 border-gray-300 rounded-md w-full bg-gray-50 focus:ring-2 focus:ring-emerald-300 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder-gray-400 text-gray-800"
                          />
                        )}
                        {field.field_type === 'time' && (
                          <input
                            type="time"
                            value={customFieldValues[field.field_name] || ''}
                            onChange={e => setCustomFieldValues({...customFieldValues, [field.field_name]: e.target.value})}
                            className="p-3 border-2 border-gray-300 rounded-md w-full bg-gray-50 focus:ring-2 focus:ring-emerald-300 focus:border-emerald-500 focus:bg-white outline-none transition-all text-gray-800"
                          />
                        )}
                        {field.field_type === 'date' && (
                          <input
                            type="date"
                            value={customFieldValues[field.field_name] || ''}
                            onChange={e => setCustomFieldValues({...customFieldValues, [field.field_name]: e.target.value})}
                            className="p-3 border-2 border-gray-300 rounded-md w-full bg-gray-50 focus:ring-2 focus:ring-emerald-300 focus:border-emerald-500 focus:bg-white outline-none transition-all text-gray-800"
                          />
                        )}
                        {field.field_type === 'file' && (
                          <input
                            type="text"
                            placeholder="Paste file URL or Cloudinary link..."
                            value={customFieldValues[field.field_name] || ''}
                            onChange={e => setCustomFieldValues({...customFieldValues, [field.field_name]: e.target.value})}
                            className="p-3 border-2 border-gray-300 rounded-md w-full bg-gray-50 focus:ring-2 focus:ring-emerald-300 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder-gray-400 text-gray-800"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* File Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 hover:bg-emerald-50/50 transition-colors">
                <label className="flex flex-col items-center gap-2 cursor-pointer">
                  <Upload className="w-6 h-6 text-emerald-500" />
                  <span className="text-sm font-medium text-gray-600">
                    {selectedFile ? selectedFile.name : 'Upload Prescription / Report (PDF, Image)'}
                  </span>
                  <span className="text-xs text-gray-400">Click to browse or drag and drop</span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
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
                    {record.file_url && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <a
                          href={record.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium border border-emerald-200"
                        >
                          <Download className="w-4 h-4" />
                          {record.file_name || 'Download Report'}
                        </a>
                      </div>
                    )}
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
        <div className="bg-white p-12 rounded-lg shadow-md text-center text-gray-400 mt-6 border-2 border-dashed border-gray-200">
          <Search className="w-16 h-16 mx-auto mb-4 opacity-30 text-emerald-500" />
          <p className="text-xl font-bold text-gray-600 mb-2">Search for a patient appointment</p>
          <p className="text-sm max-w-md mx-auto leading-relaxed">
            The search bar is automatically pre-filled with today's date prefix. Just type the last 4 digits of the patient's booking number to pull up their profile and add securely to their medical records! You can also clear it and search by their 5-digit Patient ID.
          </p>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboardPage;

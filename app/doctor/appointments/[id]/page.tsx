"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/hooks/useUser';
import {
  ArrowLeft, CalendarDays, Clock, Hash, Ticket, CheckCircle2, AlertCircle,
  Loader2, Activity, Droplets, FileText, PlusCircle, Upload, BookText,
  Stethoscope, Download, Check, XCircle, User
} from 'lucide-react';
import Link from 'next/link';

interface RecordField {
  id: string;
  field_name: string;
  field_type: string;
  is_required: boolean;
}

interface MedicalRecord {
  id: string;
  record_date: string;
  blood_pressure: string;
  blood_sugar: string;
  description: string;
  file_url: string | null;
  file_name: string | null;
  custom_data: Record<string, string> | null;
  doctors: { name: string; specialty: string };
}

interface Notification {
  type: 'success' | 'error';
  message: string;
}

interface AppointmentSession {
  id: string;
  doctor_name: string;
  specialty: string;
  date: string;
  time: string;
  status: string;
  booking_number: string;
  token_number: number | null;
  user_id: string;
}

interface PatientInfo {
  id: string;
  patient_id: number;
  name: string;
}

export default function AppointmentSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const supabase = createClient();

  const [appointment, setAppointment] = useState<AppointmentSession | null>(null);
  const [patient, setPatient] = useState<PatientInfo | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [recordFields, setRecordFields] = useState<RecordField[]>([]);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [newBp, setNewBp] = useState('');
  const [newSugar, setNewSugar] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Load everything on mount
  useEffect(() => {
    if (!id) return;

    const fetchAll = async () => {
      setLoading(true);

      // 1. Fetch appointment
      const { data: appt, error: apptErr } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', id)
        .single();

      if (apptErr || !appt) {
        setLoading(false);
        return;
      }
      setAppointment(appt as AppointmentSession);

      // 2. Fetch patient info linked to this appointment's user_id
      const { data: pat } = await supabase
        .from('patients')
        .select('id, patient_id, name')
        .eq('user_id', appt.user_id)
        .single();

      if (pat) {
        setPatient(pat as PatientInfo);

        // 3. Fetch existing records for this patient
        const { data: recs } = await supabase
          .from('records')
          .select('*, doctors(name, specialty)')
          .eq('patient_id', pat.id)
          .order('record_date', { ascending: false });

        setRecords((recs as MedicalRecord[]) || []);
      }

      // 4. Fetch doctor id for current user
      if (user?.email) {
        const { data: doc } = await supabase
          .from('doctors')
          .select('id')
          .eq('email', user.email)
          .single();
        if (doc) setDoctorId(doc.id);
      }

      // 5. Fetch custom fields
      const { data: fields } = await supabase
        .from('record_fields')
        .select('*')
        .order('sort_order');
      setRecordFields(fields || []);

      setLoading(false);
    };

    fetchAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  const handleApprove = async () => {
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
      ? todayAppts[0].token_number + 1 : 1;

    const { error } = await supabase
      .from('appointments')
      .update({ status: 'confirmed', token_number: nextToken })
      .eq('id', id);

    if (error) {
      showNotification('error', 'Failed to approve: ' + error.message);
    } else {
      setAppointment(prev => prev ? { ...prev, status: 'confirmed', token_number: nextToken } : prev);
      showNotification('success', `Approved! Token #${String(nextToken).padStart(3, '0')} assigned.`);
    }
  };

  const handleReject = async () => {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (error) {
      showNotification('error', 'Failed to reject: ' + error.message);
    } else {
      setAppointment(prev => prev ? { ...prev, status: 'cancelled' } : prev);
      showNotification('success', 'Appointment rejected.');
    }
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient || !doctorId) {
      showNotification('error', 'Patient or doctor profile not found.');
      return;
    }
    if (!newBp && !newSugar && !newDescription && Object.keys(customFieldValues).length === 0 && !selectedFile) {
      showNotification('error', 'Please fill at least one field.');
      return;
    }

    setSubmitting(true);

    let fileUrl: string | null = null;
    let fileName: string | null = null;

    if (selectedFile) {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      if (!cloudName) {
        showNotification('error', 'Cloudinary cloud name not configured.');
        setSubmitting(false);
        return;
      }
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('upload_preset', 'oqens-arogya');
      formData.append('folder', `arogya/medical-reports/${patient.patient_id}`);
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
      } catch {
        showNotification('error', 'Upload failed: network error');
        setSubmitting(false);
        return;
      }
    }

    const { data: newRec, error } = await supabase
      .from('records')
      .insert([{
        patient_id: patient.id,
        doctor_id: doctorId,
        blood_pressure: newBp,
        blood_sugar: newSugar,
        description: newDescription,
        file_url: fileUrl,
        file_name: fileName,
        custom_data: customFieldValues,
      }])
      .select('*, doctors(name, specialty)')
      .single();

    if (error) {
      showNotification('error', 'Failed to save record: ' + error.message);
    } else {
      showNotification('success', 'Record saved successfully!');
      setRecords(prev => [newRec as MedicalRecord, ...prev]);
      setNewBp(''); setNewSugar(''); setNewDescription('');
      setSelectedFile(null); setCustomFieldValues({});
    }
    setSubmitting(false);
  };

  if (loading || userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen gap-3 text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
        <span>Loading session...</span>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p className="text-lg font-medium">Appointment not found.</p>
        <Link href="/doctor" className="text-emerald-600 hover:underline mt-2 inline-block">← Back to Dashboard</Link>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Back Link */}
      <Link href="/doctor" className="inline-flex items-center gap-2 text-gray-500 hover:text-emerald-600 transition-colors text-sm font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      {/* Notification */}
      {notification && (
        <div className={`flex items-center gap-3 p-4 rounded-lg border ${
          notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {notification.type === 'success'
            ? <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            : <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Appointment Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <User className="w-6 h-6 text-emerald-500" />
              {patient?.name || 'Unknown Patient'}
            </h1>
            {patient && (
              <span className="inline-flex items-center gap-1 mt-1 px-3 py-0.5 rounded-full bg-blue-50 text-blue-700 text-sm font-mono font-semibold">
                <Hash className="w-3.5 h-3.5" />
                {String(patient.patient_id).padStart(5, '0')}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {appointment.token_number && (
              <span className="px-3 py-1.5 rounded-full text-sm font-bold bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1.5">
                <Ticket className="w-4 h-4" />
                Token #{String(appointment.token_number).padStart(3, '0')}
              </span>
            )}
            <span className={`px-3 py-1.5 rounded-full text-sm font-bold uppercase border ${statusColors[appointment.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
              {appointment.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-lg text-sm text-gray-700">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Date</p>
            <p className="font-semibold flex items-center gap-1"><CalendarDays className="w-4 h-4 text-emerald-500" /> {new Date(appointment.date).toLocaleDateString('en-IN', { weekday:'short', month:'short', day:'numeric' })}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Time</p>
            <p className="font-semibold flex items-center gap-1"><Clock className="w-4 h-4 text-emerald-500" /> {appointment.time}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Doctor</p>
            <p className="font-semibold">{appointment.doctor_name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Booking ID</p>
            <p className="font-mono font-bold text-emerald-700 text-xs">{appointment.booking_number}</p>
          </div>
        </div>

        {/* Approve / Reject */}
        {appointment.status === 'pending' && (
          <div className="flex gap-3 mt-4">
            <button onClick={handleApprove} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-semibold">
              <Check className="w-4 h-4" /> Approve
            </button>
            <button onClick={handleReject} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold">
              <XCircle className="w-4 h-4" /> Reject
            </button>
          </div>
        )}
      </div>

      {/* Add Record Form */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-emerald-500" />
          Add Session Record
        </h2>
        <form onSubmit={handleAddRecord} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Blood Pressure (e.g. 120/80)" value={newBp}
                onChange={e => setNewBp(e.target.value)}
                className="pl-10 p-3 border-2 border-gray-300 rounded-lg w-full bg-gray-50 focus:ring-2 focus:ring-emerald-300 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder-gray-400 text-gray-800" />
            </div>
            <div className="relative">
              <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Blood Sugar (e.g. 95 mg/dL)" value={newSugar}
                onChange={e => setNewSugar(e.target.value)}
                className="pl-10 p-3 border-2 border-gray-300 rounded-lg w-full bg-gray-50 focus:ring-2 focus:ring-emerald-300 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder-gray-400 text-gray-800" />
            </div>
          </div>

          <textarea placeholder="Doctor's notes and observations..." value={newDescription}
            onChange={e => setNewDescription(e.target.value)}
            className="w-full p-3 border-2 border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-emerald-300 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder-gray-400 h-28 resize-none text-gray-800" />

          {/* Dynamic Admin Fields */}
          {recordFields.length > 0 && (
            <div className="border-t-2 border-dashed border-gray-200 pt-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">Additional Fields</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recordFields.map(field => (
                  <div key={field.id}>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      {field.field_name}{field.is_required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <input
                      type={field.field_type === 'file' ? 'text' : field.field_type === 'url' ? 'url' : field.field_type === 'time' ? 'time' : field.field_type === 'date' ? 'date' : 'text'}
                      placeholder={field.field_type === 'file' ? 'Paste Cloudinary URL...' : field.field_type === 'url' ? 'https://...' : `Enter ${field.field_name}...`}
                      value={customFieldValues[field.field_name] || ''}
                      onChange={e => setCustomFieldValues({ ...customFieldValues, [field.field_name]: e.target.value })}
                      className="p-3 border-2 border-gray-300 rounded-lg w-full bg-gray-50 focus:ring-2 focus:ring-emerald-300 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder-gray-400 text-gray-800"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 hover:bg-emerald-50/50 transition-colors cursor-pointer">
            <label className="flex flex-col items-center gap-2 cursor-pointer">
              <Upload className="w-6 h-6 text-emerald-500" />
              <span className="text-sm font-medium text-gray-600">
                {selectedFile ? selectedFile.name : 'Upload Prescription / Report (PDF, Image)'}
              </span>
              <span className="text-xs text-gray-400">Click to browse</span>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden"
                onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
            </label>
          </div>

          <button type="submit" disabled={submitting}
            className="w-full bg-emerald-500 text-white py-3 rounded-lg hover:bg-emerald-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold text-base">
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Record'}
          </button>
        </form>
      </div>

      {/* Past Records for this patient */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
          <BookText className="w-5 h-5 text-gray-500" />
          Past Records
          {records.length > 0 && (
            <span className="ml-2 text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-normal">
              {records.length}
            </span>
          )}
        </h2>

        {records.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <BookText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No records yet. Add the first one above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map(rec => (
              <div key={rec.id} className="border rounded-lg p-5 bg-gray-50">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <p className="font-bold text-gray-800">
                    {new Date(rec.record_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Stethoscope className="w-3.5 h-3.5" /> {rec.doctors?.name}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2 bg-white p-3 rounded-lg border">
                    <Activity className="w-4 h-4 text-rose-500" />
                    <div>
                      <p className="text-xs text-gray-500">Blood Pressure</p>
                      <p className="font-semibold text-gray-800">{rec.blood_pressure || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-white p-3 rounded-lg border">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-xs text-gray-500">Blood Sugar</p>
                      <p className="font-semibold text-gray-800">{rec.blood_sugar || 'N/A'}</p>
                    </div>
                  </div>
                  {rec.description && (
                    <div className="flex items-start gap-2 bg-white p-3 rounded-lg border">
                      <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Notes</p>
                        <p className="text-sm text-gray-700">{rec.description}</p>
                      </div>
                    </div>
                  )}
                </div>
                {/* Custom Fields */}
                {rec.custom_data && Object.keys(rec.custom_data).length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {Object.entries(rec.custom_data).map(([k, v]) => v ? (
                      <div key={k} className="bg-white px-3 py-2 rounded-lg border text-sm">
                        <span className="text-xs text-gray-400 block">{k}</span>
                        {v.startsWith('http') ? (
                          <a href={v} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline font-medium truncate block">{v}</a>
                        ) : (
                          <span className="text-gray-800 font-medium">{v}</span>
                        )}
                      </div>
                    ) : null)}
                  </div>
                )}
                {/* File download */}
                {rec.file_url && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <a href={rec.file_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium border border-emerald-200">
                      <Download className="w-4 h-4" />
                      {rec.file_name || 'Download Report'}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

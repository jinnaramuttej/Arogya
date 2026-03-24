"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PlusCircle, Trash2, Stethoscope, AlertCircle, CheckCircle2, Loader2, Mail, Lock } from 'lucide-react';

interface Doctor {
  id: string;
  doctor_id: number;
  name: string;
  specialty: string;
  email?: string;
}

interface Notification {
  type: 'success' | 'error';
  message: string;
}

const ManageDoctorsPage = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);

  const [newDoctorName, setNewDoctorName] = useState('');
  const [newDoctorSpecialty, setNewDoctorSpecialty] = useState('');
  const [newDoctorId, setNewDoctorId] = useState('');
  const [newDoctorEmail, setNewDoctorEmail] = useState('');
  const [newDoctorPassword, setNewDoctorPassword] = useState('');

  const supabase = createClient();

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    // Auto-generate initial 5-digit ID
    setNewDoctorId(Math.floor(10000 + Math.random() * 90000).toString());
    
    const fetchDoctors = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('doctors').select('id, doctor_id, name, specialty, email');
      if (error) {
        setError(error.message);
      } else {
        setDoctors(data as Doctor[]);
      }
      setLoading(false);
    };
    fetchDoctors();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoctorName || !newDoctorSpecialty || !newDoctorId || !newDoctorEmail || !newDoctorPassword) {
      showNotification('error', 'Please fill out all fields including email and password.');
      return;
    }

    if (newDoctorPassword.length < 6) {
      showNotification('error', 'Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);

    // 1. Create a Supabase auth account for the doctor
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: newDoctorEmail,
      password: newDoctorPassword,
      options: { data: { name: newDoctorName } },
    });

    if (authError) {
      showNotification('error', 'Error creating doctor account: ' + authError.message);
      setSubmitting(false);
      return;
    }

    // 2. Create a profile with doctor role
    if (authData.user) {
      await supabase.from('profiles').upsert({
        id: authData.user.id,
        email: newDoctorEmail,
        name: newDoctorName,
        role: 'doctor',
        created_at: new Date().toISOString(),
      }, { onConflict: 'id' });
    }

    // 3. Insert into doctors table
    const { data, error } = await supabase
      .from('doctors')
      .insert([{
        doctor_id: parseInt(newDoctorId),
        name: newDoctorName,
        specialty: newDoctorSpecialty,
        email: newDoctorEmail,
      }])
      .select();

    if (error) {
      showNotification('error', 'Error adding doctor record: ' + error.message);
    } else if (data) {
      setDoctors([...doctors, ...data as Doctor[]]);
      showNotification('success', `Dr. ${newDoctorName} created with login credentials.`);
      setNewDoctorName('');
      setNewDoctorSpecialty('');
      setNewDoctorEmail('');
      setNewDoctorPassword('');
      // Generate matching 5-digit ID for next doctor
      setNewDoctorId(Math.floor(10000 + Math.random() * 90000).toString());
    }
    setSubmitting(false);
  };

  const handleDeleteDoctor = async (id: string, name: string) => {
    if (!confirm('Are you sure you want to delete this doctor?')) {
      return;
    }
    const { error } = await supabase.from('doctors').delete().eq('id', id);
    if (error) {
      showNotification('error', 'Error deleting doctor: ' + error.message);
    } else {
      setDoctors(doctors.filter(doc => doc.id !== id));
      showNotification('success', `Dr. ${name} removed successfully.`);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <Stethoscope className="w-8 h-8 text-emerald-500" />
        Manage Doctors
      </h1>

      {/* Inline Notification */}
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

      {/* Add Doctor Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center">
          <PlusCircle className="w-6 h-6 mr-2 text-blue-500" />
          Add New Doctor
        </h2>
        <form onSubmit={handleAddDoctor} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Doctor Name"
              value={newDoctorName}
              onChange={(e) => setNewDoctorName(e.target.value)}
              className="p-3 border-2 border-gray-300 text-gray-800 rounded-md w-full bg-gray-50 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder-gray-400"
            />
            <input
              type="text"
              placeholder="Specialty"
              value={newDoctorSpecialty}
              onChange={(e) => setNewDoctorSpecialty(e.target.value)}
              className="p-3 border-2 border-gray-300 text-gray-800 rounded-md w-full bg-gray-50 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder-gray-400"
            />
            <input
              type="number"
              placeholder="5-Digit ID"
              value={newDoctorId}
              readOnly
              className="p-3 border-2 border-gray-300 text-gray-600 rounded-md w-full bg-gray-200 cursor-not-allowed outline-none font-mono"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                placeholder="Doctor Email (for login)"
                value={newDoctorEmail}
                onChange={(e) => setNewDoctorEmail(e.target.value)}
                className="pl-10 p-3 border-2 border-gray-300 text-gray-800 rounded-md w-full bg-gray-50 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder-gray-400"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                placeholder="Initial Password (min 6 chars)"
                value={newDoctorPassword}
                onChange={(e) => setNewDoctorPassword(e.target.value)}
                className="pl-10 p-3 border-2 border-gray-300 text-gray-800 rounded-md w-full bg-gray-50 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder-gray-400"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-500 text-white py-2.5 px-4 rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Creating Doctor Account...</>
            ) : (
              'Add Doctor'
            )}
          </button>
        </form>
      </div>

      {/* Doctor List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-700 mb-4">Existing Doctors</h2>
        {loading && (
          <div className="flex items-center justify-center py-10 text-gray-500 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading doctors...</span>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>Error: {error}</span>
          </div>
        )}
        {!loading && !error && doctors.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            <Stethoscope className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No doctors found</p>
            <p className="text-sm">Add a new doctor using the form above.</p>
          </div>
        )}
        <div className="space-y-3">
          {doctors.map(doctor => (
            <div key={doctor.id} className="flex justify-between items-center p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Stethoscope className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">{doctor.name} <span className="text-sm text-gray-500 font-normal">({doctor.doctor_id})</span></p>
                  <p className="text-sm text-gray-600">{doctor.specialty}</p>
                  {doctor.email && <p className="text-xs text-gray-400 flex items-center gap-1"><Mail className="w-3 h-3" />{doctor.email}</p>}
                </div>
              </div>
              <button onClick={() => handleDeleteDoctor(doctor.id, doctor.name)} className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-all" title="Delete doctor">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageDoctorsPage;

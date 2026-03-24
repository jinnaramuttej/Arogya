"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/hooks/useUser';
import { Lock, CheckCircle2, AlertCircle, Loader2, Shield, Clock, Plus, X, Save } from 'lucide-react';

interface Notification {
  type: 'success' | 'error';
  message: string;
}

const DoctorSettingsPage = () => {
  const { user } = useUser();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);

  // Slots state
  const [slots, setSlots] = useState<string[]>([]);
  const [newSlot, setNewSlot] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [savingSlots, setSavingSlots] = useState(false);
  const [doctorId, setDoctorId] = useState<string | null>(null);

  const supabase = createClient();

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Fetch existing slots
  useEffect(() => {
    const fetchSlots = async () => {
      if (!user?.email) return;
      const { data } = await supabase
        .from('doctors')
        .select('id, available_slots')
        .eq('email', user.email)
        .single();

      if (data) {
        setDoctorId(data.id);
        const parsed = data.available_slots || [];
        setSlots(Array.isArray(parsed) ? parsed : JSON.parse(parsed));
      }
      setLoadingSlots(false);
    };
    fetchSlots();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleAddSlot = () => {
    const trimmed = newSlot.trim();
    if (!trimmed) return;
    if (slots.includes(trimmed)) {
      showNotification('error', 'This slot already exists.');
      return;
    }
    setSlots([...slots, trimmed]);
    setNewSlot('');
  };

  const handleRemoveSlot = (slot: string) => {
    setSlots(slots.filter(s => s !== slot));
  };

  const handleSaveSlots = async () => {
    if (!doctorId) {
      showNotification('error', 'Doctor profile not found.');
      return;
    }
    setSavingSlots(true);
    const { error } = await supabase
      .from('doctors')
      .update({ available_slots: slots })
      .eq('id', doctorId);

    if (error) {
      showNotification('error', 'Failed to save slots: ' + error.message);
    } else {
      showNotification('success', 'Available slots updated successfully! Patients will now see these slots when booking.');
    }
    setSavingSlots(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      showNotification('error', 'Please fill out all fields.');
      return;
    }
    if (newPassword.length < 6) {
      showNotification('error', 'New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showNotification('error', 'New passwords do not match.');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      showNotification('error', 'Failed to update password: ' + error.message);
    } else {
      showNotification('success', 'Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
    setSubmitting(false);
  };

  // Common slot suggestions
  const SLOT_SUGGESTIONS = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM'];

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Notification */}
      {notification && (
        <div className={`flex items-center gap-3 p-4 rounded-lg ${
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

      {/* ===== Slot Management ===== */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <Clock className="w-8 h-8 text-emerald-500" />
          Manage Available Slots
        </h1>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-sm text-gray-500 mb-4">
            Configure the time slots patients can book when scheduling an appointment with you.
          </p>

          {loadingSlots ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
            </div>
          ) : (
            <>
              {/* Current slots */}
              <div className="flex flex-wrap gap-2 mb-6 min-h-[40px]">
                {slots.length === 0 ? (
                  <p className="text-gray-400 text-sm italic">No slots configured yet. Add some below.</p>
                ) : (
                  slots.map(slot => (
                    <span
                      key={slot}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-medium"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      {slot}
                      <button
                        onClick={() => handleRemoveSlot(slot)}
                        className="ml-1 hover:text-red-500 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Add custom slot */}
              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  placeholder="e.g. 2:30 PM"
                  value={newSlot}
                  onChange={(e) => setNewSlot(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSlot()}
                  className="flex-grow p-3 border-2 border-gray-300 rounded-md bg-gray-50 focus:ring-2 focus:ring-emerald-300 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder-gray-400 text-gray-800"
                />
                <button
                  onClick={handleAddSlot}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors flex items-center gap-1.5 font-medium"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>

              {/* Quick add suggestions */}
              <div className="mb-6">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Quick Add:</p>
                <div className="flex flex-wrap gap-1.5">
                  {SLOT_SUGGESTIONS.filter(s => !slots.includes(s)).map(s => (
                    <button
                      key={s}
                      onClick={() => setSlots([...slots, s])}
                      className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 text-xs hover:bg-emerald-100 hover:text-emerald-700 transition-colors border border-gray-200"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Save */}
              <button
                onClick={handleSaveSlots}
                disabled={savingSlots}
                className="w-full bg-emerald-500 text-white py-3 rounded-md hover:bg-emerald-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
              >
                {savingSlots ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Slots</>}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ===== Change Password ===== */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
          <Shield className="w-7 h-7 text-gray-500" />
          Change Password
        </h2>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <form onSubmit={handleChangePassword} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  placeholder="Enter new password (min 6 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10 p-3 border-2 border-gray-300 rounded-md w-full bg-gray-50 focus:ring-2 focus:ring-emerald-300 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder-gray-400 text-gray-800"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 p-3 border-2 border-gray-300 rounded-md w-full bg-gray-50 focus:ring-2 focus:ring-emerald-300 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder-gray-400 text-gray-800"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
            >
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DoctorSettingsPage;

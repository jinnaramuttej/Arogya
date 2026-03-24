"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Lock, CheckCircle2, AlertCircle, Loader2, Shield } from 'lucide-react';

interface Notification {
  type: 'success' | 'error';
  message: string;
}

const DoctorSettingsPage = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);

  const supabase = createClient();

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
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

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <Shield className="w-8 h-8 text-emerald-500" />
        Change Password
      </h1>

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
                className="pl-10 p-3 border-2 border-gray-300 rounded-md w-full bg-gray-50 focus:ring-2 focus:ring-emerald-300 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder-gray-400"
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
                className="pl-10 p-3 border-2 border-gray-300 rounded-md w-full bg-gray-50 focus:ring-2 focus:ring-emerald-300 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder-gray-400"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-emerald-500 text-white py-3 px-4 rounded-md hover:bg-emerald-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
          >
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DoctorSettingsPage;

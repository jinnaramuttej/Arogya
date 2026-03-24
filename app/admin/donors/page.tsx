"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PlusCircle, Trash2, HeartHandshake, AlertCircle, CheckCircle2, Loader2, Droplets, Phone, MapPin } from 'lucide-react';

interface Donor {
  id: string;
  name: string;
  blood_group: string;
  phone: string;
  location: string;
}

interface Notification {
  type: 'success' | 'error';
  message: string;
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const ManageDonorsPage = () => {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);

  const [newName, setNewName] = useState('');
  const [newBloodGroup, setNewBloodGroup] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newLocation, setNewLocation] = useState('');

  const supabase = createClient();

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    const fetchDonors = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('donors')
        .select('id, name, blood_group, phone, location')
        .order('name', { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setDonors(data as Donor[]);
      }
      setLoading(false);
    };
    fetchDonors();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddDonor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newBloodGroup || !newPhone || !newLocation) {
      showNotification('error', 'Please fill out all fields for the new donor.');
      return;
    }

    setSubmitting(true);
    const { data, error } = await supabase
      .from('donors')
      .insert([{ name: newName, blood_group: newBloodGroup, phone: newPhone, location: newLocation }])
      .select();

    if (error) {
      showNotification('error', 'Error adding donor: ' + error.message);
    } else if (data) {
      setDonors([...donors, ...data as Donor[]]);
      showNotification('success', `${newName} added as a donor successfully.`);
      setNewName('');
      setNewBloodGroup('');
      setNewPhone('');
      setNewLocation('');
    }
    setSubmitting(false);
  };

  const handleDeleteDonor = async (id: string, name: string) => {
    if (!confirm('Are you sure you want to remove this donor?')) return;

    const { error } = await supabase.from('donors').delete().eq('id', id);
    if (error) {
      showNotification('error', 'Error removing donor: ' + error.message);
    } else {
      setDonors(donors.filter(d => d.id !== id));
      showNotification('success', `${name} removed successfully.`);
    }
  };

  const bloodGroupColor = (bg: string) => {
    const colors: Record<string, string> = {
      'A+': 'bg-red-100 text-red-700', 'A-': 'bg-red-50 text-red-600',
      'B+': 'bg-blue-100 text-blue-700', 'B-': 'bg-blue-50 text-blue-600',
      'AB+': 'bg-purple-100 text-purple-700', 'AB-': 'bg-purple-50 text-purple-600',
      'O+': 'bg-emerald-100 text-emerald-700', 'O-': 'bg-emerald-50 text-emerald-600',
    };
    return colors[bg] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <HeartHandshake className="w-8 h-8 text-rose-500" />
        Donor Management
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

      {/* Add Donor Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center">
          <PlusCircle className="w-6 h-6 mr-2 text-blue-500" />
          Register New Donor
        </h2>
        <form onSubmit={handleAddDonor} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Full Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="p-3 border-2 border-gray-300 rounded-md w-full bg-gray-50 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder-gray-400"
            />
            <select
              value={newBloodGroup}
              onChange={(e) => setNewBloodGroup(e.target.value)}
              className="p-3 border-2 border-gray-300 rounded-md w-full bg-gray-50 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-700"
            >
              <option value="">Select Blood Group</option>
              {BLOOD_GROUPS.map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
            <input
              type="tel"
              placeholder="Phone Number"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className="p-3 border-2 border-gray-300 rounded-md w-full bg-gray-50 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder-gray-400"
            />
            <input
              type="text"
              placeholder="Location"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              className="p-3 border-2 border-gray-300 rounded-md w-full bg-gray-50 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder-gray-400"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-rose-500 text-white py-2.5 px-4 rounded-md hover:bg-rose-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Registering...</>
            ) : (
              'Register Donor'
            )}
          </button>
        </form>
      </div>

      {/* Donor List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-700">Registered Donors</h2>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16 text-gray-500 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading donors...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-6 bg-red-50 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>Error: {error}</span>
          </div>
        )}

        {!loading && !error && donors.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <HeartHandshake className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No donors registered yet</p>
            <p className="text-sm">Register a new donor using the form above.</p>
          </div>
        )}

        {!loading && !error && donors.length > 0 && (
          <div className="divide-y divide-gray-100">
            {donors.map(donor => (
              <div key={donor.id} className="flex justify-between items-center px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                    <HeartHandshake className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{donor.name}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {donor.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {donor.location}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 ${bloodGroupColor(donor.blood_group)}`}>
                    <Droplets className="w-3.5 h-3.5" />
                    {donor.blood_group}
                  </span>
                  <button onClick={() => handleDeleteDonor(donor.id, donor.name)} className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-all" title="Remove donor">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageDonorsPage;

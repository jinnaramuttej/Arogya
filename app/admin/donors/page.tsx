"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PlusCircle, Trash2, Droplet, AlertCircle, CheckCircle2, Loader2, MapPin } from 'lucide-react';

interface Donor {
  id: string;
  name: string;
  blood_group: string;
  location: string;
  distance_km: number;
  last_donation: string;
  status: string;
  phone: string;
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const ManageDonorsPage = () => {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const [newName, setNewName] = useState('');
  const [newGroup, setNewGroup] = useState('O+');
  const [newLocation, setNewLocation] = useState('');
  const [newDistance, setNewDistance] = useState('5.0');
  const [newPhone, setNewPhone] = useState('Hidden');

  const supabase = createClient();

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    const fetchDonors = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('blood_donors').select('*');
      if (error) {
        setError(error.message);
      } else {
        setDonors(data as Donor[]);
      }
      setLoading(false);
    };
    fetchDonors();
  }, [supabase]);

  const handleAddDonor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newLocation || !newDistance) {
      showNotification('error', 'Please fill out all required fields.');
      return;
    }

    setSubmitting(true);
    const { data, error } = await supabase
      .from('blood_donors')
      .insert([{ 
        name: newName, 
        blood_group: newGroup, 
        location: newLocation, 
        distance_km: parseFloat(newDistance), 
        last_donation: new Date().toISOString().split('T')[0],
        status: 'Available',
        phone: newPhone
      }])
      .select();

    if (error) {
      showNotification('error', 'Error adding donor: ' + error.message);
    } else if (data) {
      setDonors([data[0] as Donor, ...donors]);
      showNotification('success', `${newName} added successfully.`);
      setNewName('');
      setNewLocation('');
      setNewDistance('5.0');
      setNewPhone('Hidden');
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm('Are you sure you want to remove this donor from the network?')) return;
    
    const { error } = await supabase.from('blood_donors').delete().eq('id', id);
    if (error) {
      showNotification('error', 'Error deleting donor: ' + error.message);
    } else {
      setDonors(donors.filter(d => d.id !== id));
      showNotification('success', `${name} removed securely.`);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <Droplet className="w-8 h-8 text-rose-500" />
        Blood Donor Network Management
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

      {/* Add Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center">
          <PlusCircle className="w-6 h-6 mr-2 text-rose-500" />
          Register New Donor
        </h2>
        <form onSubmit={handleAddDonor} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Donor Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="p-3 border-2 border-gray-300 rounded-md w-full bg-gray-50 focus:ring-2 focus:ring-rose-300 focus:border-rose-500"
            />
            <select
              value={newGroup}
              onChange={(e) => setNewGroup(e.target.value)}
              className="p-3 border-2 border-gray-300 rounded-md w-full bg-gray-50 focus:ring-2 focus:ring-rose-300 focus:border-rose-500"
            >
              {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <input
              type="text"
              placeholder="City / Region"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              className="p-3 border-2 border-gray-300 rounded-md w-full bg-gray-50 focus:ring-2 focus:ring-rose-300 focus:border-rose-500"
            />
            <input
              type="number"
              step="0.1"
              placeholder="Radius Distance (km)"
              value={newDistance}
              onChange={(e) => setNewDistance(e.target.value)}
              className="p-3 border-2 border-gray-300 rounded-md w-full bg-gray-50 focus:ring-2 focus:ring-rose-300 focus:border-rose-500"
            />
            <input
              type="text"
              placeholder="Phone (e.g. Hidden or +91...)"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className="p-3 border-2 border-gray-300 rounded-md w-full bg-gray-50 focus:ring-2 focus:ring-rose-300 focus:border-rose-500 lg:col-span-2"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-rose-500 text-white py-2.5 px-4 rounded-md hover:bg-rose-600 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add to Network'}
          </button>
        </form>
      </div>

      {/* Grid */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-700 mb-4">Master Donor Directory</h2>
        {loading ? (
          <div className="flex items-center justify-center py-10 text-gray-500 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Syncing records...</span>
          </div>
        ) : error ? (
          <div className="p-4 rounded-lg bg-red-50 text-red-700 flex gap-2"><AlertCircle/>{error}</div>
        ) : donors.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Droplet className="w-12 h-12 mx-auto mb-3 opacity-50 text-rose-400" />
            <p className="font-medium">No donors found in database</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {donors.map(donor => (
              <div key={donor.id} className="flex gap-4 p-4 border border-rose-100 rounded-xl bg-rose-50/50 hover:bg-rose-50 transition-colors">
                <div className="w-14 h-14 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 font-bold text-lg flex-shrink-0">
                  {donor.blood_group}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-800">{donor.name}</h3>
                    <button onClick={() => handleDelete(donor.id, donor.name)} className="text-red-400 hover:text-red-600 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs font-semibold uppercase text-rose-500 mt-1">{donor.status}</p>
                  <p className="text-xs flex items-center gap-1 text-gray-500 mt-1 truncate">
                    <MapPin className="w-3 h-3"/> {donor.location} • {donor.distance_km} km
                  </p>
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

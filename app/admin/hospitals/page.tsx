"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PlusCircle, Trash2, Hospital as HospitalIcon, AlertCircle, CheckCircle2, Loader2, MapPin, ExternalLink } from 'lucide-react';

interface Hospital {
  id: string;
  name: string;
  location: string;
}

interface Notification {
  type: 'success' | 'error';
  message: string;
}

const ManageHospitalsPage = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);

  const [newHospitalName, setNewHospitalName] = useState('');
  const [newHospitalLocation, setNewHospitalLocation] = useState('');

  const supabase = createClient();

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    const fetchHospitals = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('hospitals').select('id, name, location');
      if (error) {
        setError(error.message);
      } else {
        setHospitals(data as Hospital[]);
      }
      setLoading(false);
    };
    fetchHospitals();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHospitalName || !newHospitalLocation) {
      showNotification('error', 'Please fill out all fields for the new hospital.');
      return;
    }

    // Validate that the location is a Google Maps URL
    if (!newHospitalLocation.includes('google.com/maps') && !newHospitalLocation.includes('goo.gl/maps') && !newHospitalLocation.includes('maps.app.goo.gl')) {
      showNotification('error', 'Location must be a Google Maps URL (e.g. https://maps.google.com/...)');
      return;
    }

    setSubmitting(true);
    const { data, error } = await supabase
      .from('hospitals')
      .insert([{ name: newHospitalName, location: newHospitalLocation }])
      .select();

    if (error) {
      showNotification('error', 'Error adding hospital: ' + error.message);
    } else if (data) {
      setHospitals([...hospitals, ...data as Hospital[]]);
      showNotification('success', `${newHospitalName} added successfully.`);
      setNewHospitalName('');
      setNewHospitalLocation('');
    }
    setSubmitting(false);
  };

  const handleDeleteHospital = async (id: string, name: string) => {
    if (!confirm('Are you sure you want to delete this hospital?')) {
      return;
    }
    const { error } = await supabase.from('hospitals').delete().eq('id', id);
    if (error) {
      showNotification('error', 'Error deleting hospital: ' + error.message);
    } else {
      setHospitals(hospitals.filter(h => h.id !== id));
      showNotification('success', `${name} removed successfully.`);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <HospitalIcon className="w-8 h-8 text-violet-500" />
        Manage Hospitals
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

      {/* Add Hospital Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center">
          <PlusCircle className="w-6 h-6 mr-2 text-blue-500" />
          Add New Hospital
        </h2>
        <form onSubmit={handleAddHospital} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Hospital Name"
              value={newHospitalName}
              onChange={(e) => setNewHospitalName(e.target.value)}
              className="p-3 border-2 border-gray-300 rounded-md w-full bg-gray-50 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder-gray-400"
            />
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="url"
                placeholder="Google Maps URL (https://maps.google.com/...)"
                value={newHospitalLocation}
                onChange={(e) => setNewHospitalLocation(e.target.value)}
                className="pl-10 p-3 border-2 border-gray-300 rounded-md w-full bg-gray-50 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder-gray-400"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-500 text-white py-2.5 px-4 rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</>
            ) : (
              'Add Hospital'
            )}
          </button>
        </form>
      </div>

      {/* Hospital List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-700 mb-4">Existing Hospitals</h2>
        {loading && (
          <div className="flex items-center justify-center py-10 text-gray-500 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading hospitals...</span>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>Error: {error}</span>
          </div>
        )}
        {!loading && !error && hospitals.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            <HospitalIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No hospitals found</p>
            <p className="text-sm">Add a new hospital using the form above.</p>
          </div>
        )}
        <div className="space-y-3">
          {hospitals.map(hospital => (
            <div key={hospital.id} className="flex justify-between items-center p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <HospitalIcon className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">{hospital.name}</p>
                  <a
                    href={hospital.location}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    View on Google Maps
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <button onClick={() => handleDeleteHospital(hospital.id, hospital.name)} className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-all" title="Delete hospital">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageHospitalsPage;

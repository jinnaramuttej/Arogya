"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PlusCircle, Trash2, Pill, AlertCircle, CheckCircle2, Loader2, IndianRupee } from 'lucide-react';

interface Medication {
  id: string;
  name: string;
  category: string;
  dosage: string;
  price: number;
  img: string;
}

const ManagePharmacyPage = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Prescription');
  const [newDosage, setNewDosage] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newImg, setNewImg] = useState('/images/products/metformin.png'); // Default fallback

  const supabase = createClient();

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    const fetchMedications = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('medications').select('*').order('name');
      if (error) {
        setError(error.message);
      } else {
        setMedications(data as Medication[]);
      }
      setLoading(false);
    };
    fetchMedications();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newDosage || !newPrice) {
      showNotification('error', 'Please fill out all required fields.');
      return;
    }

    setSubmitting(true);
    const { data, error } = await supabase
      .from('medications')
      .insert([{ 
        name: newName, 
        category: newCategory, 
        dosage: newDosage, 
        price: parseInt(newPrice), 
        img: newImg 
      }])
      .select();

    if (error) {
      showNotification('error', 'Error adding medication: ' + error.message);
    } else if (data) {
      setMedications([...medications, ...data as Medication[]]);
      showNotification('success', `${newName} added successfully.`);
      setNewName('');
      setNewDosage('');
      setNewPrice('');
      setNewImg('/images/products/metformin.png');
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm('Are you sure you want to delete this medication from the store?')) return;
    
    const { error } = await supabase.from('medications').delete().eq('id', id);
    if (error) {
      showNotification('error', 'Error deleting medication: ' + error.message);
    } else {
      setMedications(medications.filter(m => m.id !== id));
      showNotification('success', `${name} removed securely.`);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <Pill className="w-8 h-8 text-teal-500" />
        Pharmacy Inventory
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

      {/* Add Medication Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center">
          <PlusCircle className="w-6 h-6 mr-2 text-teal-500" />
          Add E-Store Inventory
        </h2>
        <form onSubmit={handleAddMedication} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Product Name (e.g. Paracetamol)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="p-3 border-2 border-gray-300 rounded-md w-full bg-gray-50 focus:ring-2 focus:ring-teal-300 focus:border-teal-500"
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="p-3 border-2 border-gray-300 rounded-md w-full bg-gray-50 focus:ring-2 focus:ring-teal-300 focus:border-teal-500"
            >
              <option value="Prescription">Prescription</option>
              <option value="Supplements">Supplements</option>
              <option value="Devices">Devices</option>
            </select>
            <input
              type="text"
              placeholder="Dosage Instructions"
              value={newDosage}
              onChange={(e) => setNewDosage(e.target.value)}
              className="p-3 border-2 border-gray-300 rounded-md w-full bg-gray-50 focus:ring-2 focus:ring-teal-300 focus:border-teal-500"
            />
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                placeholder="Price (INR)"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="pl-10 p-3 border-2 border-gray-300 rounded-md w-full bg-gray-50 focus:ring-2 focus:ring-teal-300 focus:border-teal-500"
              />
            </div>
            <input
              type="text"
              placeholder="Image Route (/images/products/...)"
              value={newImg}
              onChange={(e) => setNewImg(e.target.value)}
              className="p-3 border-2 border-gray-300 rounded-md w-full bg-gray-50 focus:ring-2 focus:ring-teal-300 focus:border-teal-500 lg:col-span-2"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-teal-500 text-white py-2.5 px-4 rounded-md hover:bg-teal-600 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publish to Store'}
          </button>
        </form>
      </div>

      {/* Medication List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-700 mb-4">Live Storefront Inventory</h2>
        {loading ? (
          <div className="flex items-center justify-center py-10 text-gray-500 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading database...</span>
          </div>
        ) : error ? (
          <div className="p-4 rounded-lg bg-red-50 text-red-700 flex gap-2"><AlertCircle/>{error}</div>
        ) : medications.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Pill className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No medications found in database</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {medications.map(med => (
              <div key={med.id} className="flex gap-4 p-4 border border-gray-200 rounded-xl bg-gray-50 hover:bg-white transition-colors">
                <div className="w-16 h-16 rounded-lg bg-white border border-gray-100 flex items-center justify-center p-2 flex-shrink-0">
                  <img src={med.img} alt={med.name} className="w-full h-full object-contain" />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-800 leading-tight">{med.name}</h3>
                    <button onClick={() => handleDelete(med.id, med.name)} className="text-red-400 hover:text-red-600 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs font-semibold uppercase text-teal-600 mt-1">{med.category}</p>
                  <p className="text-xs text-gray-500 mb-2 truncate max-w-[150px]">{med.dosage}</p>
                  <p className="font-bold">₹{med.price}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagePharmacyPage;

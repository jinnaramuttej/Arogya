"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Settings, Plus, Trash2, CheckCircle2, AlertCircle, Loader2, Type, FileText, Link2, Clock, CalendarDays, GripVertical } from 'lucide-react';

interface RecordField {
  id: string;
  field_name: string;
  field_type: string;
  is_required: boolean;
  sort_order: number;
}

interface Notification {
  type: 'success' | 'error';
  message: string;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Text', icon: Type, description: 'Short or long text input' },
  { value: 'file', label: 'File Upload', icon: FileText, description: 'PDF, Image upload via Cloudinary' },
  { value: 'url', label: 'URL', icon: Link2, description: 'Web link / external resource' },
  { value: 'time', label: 'Time', icon: Clock, description: 'Time picker (HH:MM)' },
  { value: 'date', label: 'Date', icon: CalendarDays, description: 'Date picker' },
];

const AdminSettingsPage = () => {
  const [fields, setFields] = useState<RecordField[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<Notification | null>(null);

  // New field form
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState('text');
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [adding, setAdding] = useState(false);

  const supabase = createClient();

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Fetch existing fields
  useEffect(() => {
    const fetchFields = async () => {
      const { data, error } = await supabase
        .from('record_fields')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        showNotification('error', 'Failed to load fields: ' + error.message);
      } else {
        setFields(data || []);
      }
      setLoading(false);
    };
    fetchFields();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddField = async () => {
    const trimmed = newFieldName.trim();
    if (!trimmed) {
      showNotification('error', 'Field name is required.');
      return;
    }

    setAdding(true);
    const { data, error } = await supabase
      .from('record_fields')
      .insert([{
        field_name: trimmed,
        field_type: newFieldType,
        is_required: newFieldRequired,
        sort_order: fields.length,
      }])
      .select()
      .single();

    if (error) {
      showNotification('error', 'Failed to add field: ' + error.message);
    } else if (data) {
      setFields([...fields, data]);
      setNewFieldName('');
      setNewFieldType('text');
      setNewFieldRequired(false);
      showNotification('success', `Field "${trimmed}" added! Doctors will now see this field when adding records.`);
    }
    setAdding(false);
  };

  const handleDeleteField = async (field: RecordField) => {
    const { error } = await supabase
      .from('record_fields')
      .delete()
      .eq('id', field.id);

    if (error) {
      showNotification('error', 'Failed to delete field: ' + error.message);
    } else {
      setFields(fields.filter(f => f.id !== field.id));
      showNotification('success', `Field "${field.field_name}" removed.`);
    }
  };

  const getTypeInfo = (type: string) => FIELD_TYPES.find(t => t.value === type) || FIELD_TYPES[0];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
        <Settings className="w-8 h-8 text-indigo-500" />
        Admin Settings
      </h1>
      <p className="text-gray-500 mb-8">Configure dynamic fields for medical records. Changes reflect across all doctor dashboards instantly.</p>

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

      {/* Add New Field */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-indigo-500" />
          Add Custom Record Field
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Field Name</label>
            <input
              type="text"
              placeholder="e.g. X-Ray Report, Body Temperature, Follow-up Date..."
              value={newFieldName}
              onChange={(e) => setNewFieldName(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-md bg-gray-50 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder-gray-400 text-gray-800"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Field Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {FIELD_TYPES.map(ft => {
                const Icon = ft.icon;
                return (
                  <button
                    key={ft.value}
                    onClick={() => setNewFieldType(ft.value)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      newFieldType === ft.value
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1" />
                    <p className="text-sm font-semibold">{ft.label}</p>
                    <p className="text-xs opacity-70 leading-tight mt-0.5">{ft.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="required-check"
              checked={newFieldRequired}
              onChange={(e) => setNewFieldRequired(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-gray-300"
            />
            <label htmlFor="required-check" className="text-sm text-gray-700">Mark as required field</label>
          </div>

          <button
            onClick={handleAddField}
            disabled={adding || !newFieldName.trim()}
            className="w-full bg-indigo-500 text-white py-3 rounded-md hover:bg-indigo-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
          >
            {adding ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</> : <><Plus className="w-4 h-4" /> Add Field</>}
          </button>
        </div>
      </div>

      {/* Existing Fields List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-700 mb-4">
          Active Record Fields
          {fields.length > 0 && (
            <span className="ml-2 text-sm bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-normal">
              {fields.length} field{fields.length !== 1 ? 's' : ''}
            </span>
          )}
        </h2>

        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          </div>
        ) : fields.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Settings className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No custom fields configured</p>
            <p className="text-sm">Add fields above and they will appear in the doctor&apos;s medical record form.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {fields.map((field) => {
              const typeInfo = getTypeInfo(field.field_type);
              const Icon = typeInfo.icon;
              return (
                <div key={field.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-4 h-4 text-gray-300" />
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-indigo-100 text-indigo-600`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{field.field_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full capitalize">{typeInfo.label}</span>
                        {field.is_required && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Required</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteField(field)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete field"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettingsPage;

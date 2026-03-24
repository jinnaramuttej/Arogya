"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Users, Search, Shield, Stethoscope, User, Loader2, AlertCircle, CheckCircle2, ChevronDown, Camera } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'patient' | 'doctor' | 'admin';
  created_at: string;
}

interface Notification {
  type: 'success' | 'error';
  message: string;
}

const ROLES = [
  { value: 'patient', label: 'Patient', icon: User, color: 'bg-blue-100 text-blue-700' },
  { value: 'doctor', label: 'Doctor', icon: Stethoscope, color: 'bg-emerald-100 text-emerald-700' },
  { value: 'admin', label: 'Admin', icon: Shield, color: 'bg-red-100 text-red-700' },
];

const ManageUsersPage = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [notification, setNotification] = useState<Notification | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  const supabase = createClient();

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, name, role, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setUsers(data as UserProfile[]);
        setFilteredUsers(data as UserProfile[]);
      }
      setLoading(false);
    };
    fetchUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let result = users;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(u =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      );
    }

    if (roleFilter !== 'all') {
      result = result.filter(u => u.role === roleFilter);
    }

    setFilteredUsers(result);
  }, [searchQuery, roleFilter, users]);

  const handleRoleChange = async (user: UserProfile, newRole: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', user.id);

    if (error) {
      showNotification('error', 'Failed to update role: ' + error.message);
      return;
    }

    // If making them a doctor, ensure they are in the doctors table so they show in searches
    if (newRole === 'doctor' && user.email) {
      const { data: existingDoc } = await supabase.from('doctors').select('id').eq('email', user.email).single();
      if (!existingDoc) {
        // Auto-assign a random 5-digit doctor ID
        const randomDocId = Math.floor(10000 + Math.random() * 90000);
        await supabase.from('doctors').insert([{
          doctor_id: randomDocId,
          name: user.name || user.email.split('@')[0],
          specialty: 'General Physician', // Default specialty
          email: user.email
        }]);
      }
    }

    setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole as UserProfile['role'] } : u));
    showNotification('success', `Role updated to ${newRole} successfully.`);
  };

  const handleEnableReverify = async (user: UserProfile) => {
    const { error } = await supabase
      .from('profiles')
      .update({ face_descriptor: null, avatar_base64: null })
      .eq('id', user.id);

    if (error) {
      showNotification('error', 'Failed to enable re-verify: ' + error.message);
    } else {
      showNotification('success', `Face re-verification enabled for ${user.name || user.email}.`);
    }
  };

  const getRoleInfo = (role: string) => ROLES.find(r => r.value === role) || ROLES[0];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <Users className="w-8 h-8 text-indigo-500" />
        User Directory
      </h1>

      {/* Notification */}
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

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-50"><User className="w-5 h-5 text-blue-500" /></div>
          <div>
            <p className="text-sm text-gray-500">Patients</p>
            <p className="text-xl font-bold text-gray-800">{users.filter(u => u.role === 'patient').length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-50"><Stethoscope className="w-5 h-5 text-emerald-500" /></div>
          <div>
            <p className="text-sm text-gray-500">Doctors</p>
            <p className="text-xl font-bold text-gray-800">{users.filter(u => u.role === 'doctor').length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-red-50"><Shield className="w-5 h-5 text-red-500" /></div>
          <div>
            <p className="text-sm text-gray-500">Admins</p>
            <p className="text-xl font-bold text-gray-800">{users.filter(u => u.role === 'admin').length}</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-2 flex-grow">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border-b-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="p-2 border-2 border-gray-300 rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all"
        >
          <option value="all">All Roles</option>
          {ROLES.map(r => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      {/* User List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-700">All Users</h2>
          <span className="text-sm text-gray-500">{filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}</span>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16 text-gray-500 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading users...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-6 bg-red-50 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>Error: {error}</span>
          </div>
        )}

        {!loading && !error && filteredUsers.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No users found</p>
            <p className="text-sm">Try adjusting your search or filter.</p>
          </div>
        )}

        {!loading && !error && filteredUsers.length > 0 && (
          <div className="divide-y divide-gray-100">
            {filteredUsers.map(user => {
              const roleInfo = getRoleInfo(user.role);
              const RoleIcon = roleInfo.icon;
              const isExpanded = expandedUserId === user.id;

              return (
                <div key={user.id}>
                  <div
                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setExpandedUserId(isExpanded ? null : user.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-600 font-bold text-sm">
                        {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{user.name || 'Unnamed'}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${roleInfo.color}`}>
                        <RoleIcon className="w-3.5 h-3.5" />
                        {roleInfo.label}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {/* Expanded Profile Panel */}
                  {isExpanded && (
                    <div className="px-6 pb-4 bg-gray-50 border-t border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">User ID</p>
                          <p className="text-sm font-mono text-gray-700 break-all">{user.id}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Joined</p>
                          <p className="text-sm text-gray-700">
                            {new Date(user.created_at).toLocaleDateString('en-IN', {
                              year: 'numeric', month: 'long', day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Email</p>
                          <p className="text-sm text-gray-700">{user.email}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Change Role</p>
                          <div className="flex gap-2">
                            {ROLES.map(r => (
                              <button
                                key={r.value}
                                onClick={(e) => { e.stopPropagation(); handleRoleChange(user, r.value); }}
                                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                                  user.role === r.value
                                    ? r.color + ' ring-2 ring-offset-1 ring-current'
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}
                              >
                                {r.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="md:col-span-2 pt-2 mt-2 border-t border-gray-200/50">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEnableReverify(user); }}
                            className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                          >
                            <Camera className="w-4 h-4" />
                            Enable Face Re-verify
                          </button>
                          <p className="text-xs text-gray-500 mt-1">
                            This will clear their current face data and force them to register a new face upon next login.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsersPage;

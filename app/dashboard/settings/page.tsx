"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/hooks/useUser';
import { User, Activity, AlertCircle, CheckCircle2, Loader2, Save, LogOut, Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfileSettingsPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasFaceRegistered, setHasFaceRegistered] = useState(false);
  const [notification, setNotification] = useState<{type: 'success'|'error', msg: string}|null>(null);

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Prefer not to say',
    blood_group: 'Unknown',
    conditions: '',
    allergies: ''
  });

  const showNotification = (type: 'success'|'error', msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/auth');
      return;
    }

    const fetchProfile = async () => {
      if (!user) return;
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      
      if (data) {
        setFormData({
          name: data.name || user.user_metadata?.full_name || '',
          age: data.age?.toString() || '',
          gender: data.gender || 'Prefer not to say',
          blood_group: data.blood_group || 'Unknown',
          conditions: data.conditions || '',
          allergies: data.allergies || ''
        });
        if (data.face_descriptor) {
          setHasFaceRegistered(true);
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user, userLoading, supabase, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    const payload = {
      id: user.id,
      name: formData.name,
      age: formData.age ? parseInt(formData.age) : null,
      gender: formData.gender,
      blood_group: formData.blood_group,
      conditions: formData.conditions,
      allergies: formData.allergies
    };

    const { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' });

    if (error) {
      showNotification('error', error.message);
    } else {
      showNotification('success', 'Profile settings secured successfully.');
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading || userLoading) {
    return (
      <div className="min-h-screen pt-32 pb-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-32 pb-24">
      <div className="container mx-auto px-6 max-w-3xl">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <User className="w-8 h-8 text-primary" />
              Profile & Security
            </h1>
            <p className="text-sm text-muted-foreground mt-2">Manage your clinical demographic properties natively.</p>
          </div>
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-2 hover:bg-destructive/10 text-destructive border border-destructive/20 px-4 py-2 rounded-xl transition-colors text-sm font-semibold"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        {notification && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 border ${
            notification.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600' : 'bg-red-500/10 border-red-500/30 text-red-600'
          }`}>
            {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="text-sm font-semibold">{notification.msg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card/70 border border-border/60 rounded-[2rem] p-8 shadow-sm">
            <h2 className="text-lg font-bold mb-6 border-b border-border/60 pb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Core Identity
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Legal Name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-background border border-border/60 rounded-xl px-4 py-3 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Account Email</label>
                <input 
                  type="text" 
                  value={user?.email || ''} 
                  disabled
                  className="w-full bg-muted/50 border border-border/60 rounded-xl px-4 py-3 text-sm text-muted-foreground cursor-not-allowed"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Age</label>
                <input 
                  type="number" 
                  value={formData.age} 
                  onChange={e => setFormData({...formData, age: e.target.value})}
                  className="w-full bg-background border border-border/60 rounded-xl px-4 py-3 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Gender identity</label>
                <select 
                  value={formData.gender} 
                  onChange={e => setFormData({...formData, gender: e.target.value})}
                  className="w-full bg-background border border-border/60 rounded-xl px-4 py-3 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-card/70 border border-border/60 rounded-[2rem] p-8 shadow-sm">
            <h2 className="text-lg font-bold mb-6 border-b border-border/60 pb-3 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" /> Precision Medical Data
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Blood Type</label>
                <select 
                  value={formData.blood_group} 
                  onChange={e => setFormData({...formData, blood_group: e.target.value})}
                  className="w-full md:w-1/2 bg-background border border-border/60 rounded-xl px-4 py-3 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition"
                >
                  <option value="Unknown">Unknown</option>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Primary Conditions</label>
                <textarea 
                  rows={3}
                  value={formData.conditions} 
                  onChange={e => setFormData({...formData, conditions: e.target.value})}
                  placeholder="e.g. Type 2 Diabetes, Mild Hypertension"
                  className="w-full bg-background border border-border/60 rounded-xl px-4 py-3 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition resize-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Known Allergies</label>
                <textarea 
                  rows={3}
                  value={formData.allergies} 
                  onChange={e => setFormData({...formData, allergies: e.target.value})}
                  placeholder="e.g. Penicillin, Latex, Peanuts"
                  className="w-full bg-background border border-border/60 rounded-xl px-4 py-3 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-card/70 border border-border/60 rounded-[2rem] p-8 shadow-sm">
            <h2 className="text-lg font-bold mb-6 border-b border-border/60 pb-3 flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-500" /> Biometric Identity
            </h2>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-4 rounded-xl bg-background border border-border/60">
              <div>
                <p className="font-semibold">{hasFaceRegistered ? "Face ID Active & Secured" : "No Face Registered"}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {hasFaceRegistered 
                    ? "Your biometric matrix is actively securing your login access." 
                    : "Register your face to enable passwordless global sign-ins natively."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/verify?mode=register")}
                className={`shrink-0 px-6 py-3 rounded-xl font-semibold transition flex items-center gap-2 ${
                  hasFaceRegistered 
                    ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20" 
                    : "bg-primary text-primary-foreground shadow-lg hover:scale-105 active:scale-95"
                }`}
              >
                {hasFaceRegistered ? <CheckCircle2 className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                {hasFaceRegistered ? "Verified Identity" : "Setup Face ID"}
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Configuration
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

"use client";

import { Activity, Calendar, Pill, Stethoscope, HeartPulse, Droplet, Brain, ShieldCheck, ClipboardCheck } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useLanguage } from "@/lib/context/LanguageContext";
import { useUser } from "@/lib/hooks/useUser";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const QuickStats = () => {
  const { t } = useLanguage();
  const stats = [
    { label: t("nav_records") || "Dashboard", value: "Apr 2, 2026 • 9:30 AM", icon: Calendar },
    { label: t("nav_store") || "Medications", value: "2 Today", icon: Pill },
    { label: t("nav_blood") || "Lab Results", value: "3 New", icon: Droplet },
    { label: t("nav_dashboard") || "Wellness Score", value: "84 / 100", icon: Activity }
  ];
  return (
    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-lg shadow-primary/5">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center">
              <stat.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</p>
              <p className="text-lg font-semibold mt-1">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const vitals = [
  { label: "Heart Rate", value: "72 bpm", trend: "+2 bpm", status: "Stable" },
  { label: "Blood Pressure", value: "118/76", trend: "-4 mmHg", status: "Optimal" },
  { label: "Sleep", value: "7h 32m", trend: "+18m", status: "Good" },
  { label: "Steps", value: "8,240", trend: "+620", status: "On Track" }
];

const appointments = [
  { title: "Primary Care Checkup", date: "Apr 2", time: "9:30 AM", location: "Arogya Clinic - Midtown" },
  { title: "Nutrition Coaching", date: "Apr 5", time: "3:00 PM", location: "Virtual Session" },
  { title: "Dermatology Follow-up", date: "Apr 12", time: "11:15 AM", location: "East Wing, Room 210" }
];

const medications = [
  { name: "Metformin", dose: "500 mg", schedule: "After breakfast", adherence: "92%" },
  { name: "Atorvastatin", dose: "10 mg", schedule: "Night", adherence: "88%" },
  { name: "Vitamin D3", dose: "1000 IU", schedule: "Lunch", adherence: "95%" }
];

const labs = [
  { name: "CBC Panel", status: "Normal", date: "Mar 22", detail: "WBC 6.1 • Hgb 13.8" },
  { name: "Lipid Profile", status: "Review", date: "Mar 20", detail: "LDL 128 • HDL 48" },
  { name: "HbA1c", status: "Improved", date: "Mar 18", detail: "6.2% (↓0.3)" }
];

const tasks = [
  "Log breakfast and water intake",
  "Complete daily mobility stretch",
  "Confirm April checkup details",
  "Share smartwatch sync permission"
];

const PatientDashboard = () => {
  const { t } = useLanguage();
  const { user } = useUser();
  const supabase = createClient();
  const [liveMedications, setLiveMedications] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loadingMeds, setLoadingMeds] = useState(true);

  const [userName, setUserName] = useState("Aarav Mehta");

  useEffect(() => {
    if (user?.user_metadata?.full_name || user?.user_metadata?.name) {
      setUserName(user.user_metadata.full_name || user.user_metadata.name);
    } else {
      const stored = localStorage.getItem("az_user_name");
      if (stored) setUserName(stored);
    }
  }, [user]);

  useEffect(() => {
    const fetchMeds = async () => {
      if (!user) {
        setLoadingMeds(false);
        return;
      }
      const { data, error } = await supabase
        .from('user_prescriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('ordered_at', { ascending: false });
        
      if (data) setLiveMedications(data);

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profileData) setProfile(profileData);

      setLoadingMeds(false);
    };
    fetchMeds();
  }, [user, supabase]);
  return (
    <div className="min-h-screen bg-background text-foreground">
<main className="pt-32 pb-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">{t("nav_dashboard")}</p>
                <span className="text-[10px] uppercase tracking-[0.3em] px-3 py-1 rounded-full border border-border/60 bg-card/70 text-muted-foreground">
                  Demo Data
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mt-3">
                {t("home_ai_title") || "Welcome back,"} <span className="gradient-text">{userName}</span>
              </h1>
              <div className="mt-3 text-sm text-muted-foreground space-y-1">
                {profile ? (
                  <>
                    <p>Age {profile.age || "--"} • {profile.gender || "Not specified"} • MRN: AZ-{user?.id?.substring(0,8).toUpperCase()}</p>
                    <p>Primary conditions: {profile.conditions || "None recorded"}</p>
                    <p>Allergies: {profile.allergies || "None recorded"}</p>
                    <p>Blood Group: <span className="font-semibold text-primary">{profile.blood_group || "Unknown"}</span></p>
                  </>
                ) : (
                  <>
                    <p>Pending profile completion • MRN: AZ-{user?.id?.substring(0,8).toUpperCase() || "NEW"}</p>
                    <p>Please update your medical profile securely underneath <a href="/dashboard/settings" className="text-primary hover:underline">Settings</a>.</p>
                  </>
                )}
              </div>
            </div>
          <div className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-lg shadow-primary/5">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Stethoscope className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Primary Physician</p>
                <p className="text-lg font-semibold">Dr. Meera Iyer</p>
                <p className="text-xs text-muted-foreground">Endocrinology • Arogya Midtown</p>
                <p className="text-xs text-muted-foreground mt-1">Last visit: Mar 10, 2026</p>
              </div>
            </div>
          </div>
        </div>

        <QuickStats />

        <div className="mt-12 grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
          <div className="rounded-3xl border border-border/60 bg-card/80 p-8 shadow-lg shadow-primary/5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Vitals & Trends</h2>
              <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Today</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {vitals.map((vital) => (
                <div key={vital.label} className="rounded-2xl border border-border/60 bg-background/60 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{vital.label}</p>
                  <p className="text-2xl font-semibold mt-2">{vital.value}</p>
                  <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                    <span>{vital.status}</span>
                    <span>{vital.trend}</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-muted/60">
                    <div className="h-2 w-2/3 rounded-full bg-gradient-to-r from-primary to-secondary" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-border/60 bg-card/80 p-8 shadow-lg shadow-primary/5">
            <div className="flex items-center gap-3 mb-6">
              <Brain className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">AI Insights</h2>
            </div>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                Your fasting glucose average is down 5% this week. Keep breakfast protein steady to
                maintain the trend.
              </p>
              <p>
                Blood pressure is within target range. Continue sodium tracking for consistent control.
              </p>
              <div className="rounded-2xl border border-border/60 bg-background/60 p-4 text-foreground">
                Suggested focus: <span className="font-semibold">20-minute walk</span> after dinner tonight.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid lg:grid-cols-3 gap-8">
          <div className="rounded-3xl border border-border/60 bg-card/80 p-7 shadow-lg shadow-primary/5">
            <div className="flex items-center gap-3 mb-5">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold">Upcoming Appointments</h3>
            </div>
            <div className="space-y-4">
              {appointments.map((item) => (
                <div key={item.title} className="rounded-2xl border border-border/60 bg-background/60 p-4">
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.date} • {item.time}</p>
                  <p className="text-xs text-muted-foreground">{item.location}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-border/60 bg-card/80 p-7 shadow-lg shadow-primary/5">
            <div className="flex items-center gap-3 mb-5">
              <Pill className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold">Medications</h3>
            </div>
            <div className="space-y-4">
              {loadingMeds ? (
                <div className="text-center py-6 text-sm text-muted-foreground">Loading prescriptions...</div>
              ) : liveMedications.length > 0 ? (
                liveMedications.map((med) => (
                  <div key={med.id} className="rounded-2xl border border-border/60 bg-background/60 p-4 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{med.medication_name}</p>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">{med.status}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Dosage: {med.dosage || "As prescribed"}</p>
                    <p className="text-xs text-muted-foreground mt-1">Cost: ₹{med.price}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground mb-3">No active orders found.</p>
                  <Link href="/prescription" className="text-xs font-semibold text-primary hover:underline">
                    Order from Pharmacy &rarr;
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-border/60 bg-card/80 p-7 shadow-lg shadow-primary/5">
            <div className="flex items-center gap-3 mb-5">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold">Lab Results</h3>
            </div>
            <div className="space-y-4">
              {labs.map((lab) => (
                <div key={lab.name} className="rounded-2xl border border-border/60 bg-background/60 p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">{lab.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{lab.date} • {lab.detail}</p>
                  </div>
                  <span className="rounded-full border border-border/60 bg-card/80 px-3 py-1 text-xs font-semibold">
                    {lab.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 rounded-3xl border border-border/60 bg-card/80 p-8 shadow-lg shadow-primary/5">
          <div className="flex items-center gap-3 mb-4">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-semibold">Today’s Care Tasks</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tasks.map((task) => (
              <div key={task} className="rounded-2xl border border-border/60 bg-background/60 p-4 text-sm text-muted-foreground">
                {task}
              </div>
            ))}
          </div>
        </div>
        </div>
      </main>
</div>
  );
};

export default PatientDashboard;

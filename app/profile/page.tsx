"use client";

import { useMemo } from "react";
import {
  Activity,
  CalendarDays,
  ClipboardList,
  Droplets,
  FileText,
  HeartPulse,
  PhoneCall,
  ShieldCheck,
  UserCircle
} from "lucide-react";

const Profile = () => {
  const userName = useMemo(() => {
    if (typeof window === "undefined") return "Aarav Mehta";
    return localStorage.getItem("az_user_name") || "Aarav Mehta";
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
<main className="pt-28 pb-24">
        <section className="container mx-auto px-6">
          <div className="rounded-[2.5rem] border border-border/60 bg-gradient-to-br from-card via-background to-card/70 p-8 md:p-12 shadow-xl shadow-primary/5 relative overflow-hidden">
            <div className="absolute -top-16 right-0 h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />
            <div className="absolute -bottom-20 left-0 h-64 w-64 rounded-full bg-secondary/10 blur-[120px]" />
            <div className="relative z-10 flex flex-col lg:flex-row gap-8 lg:items-center lg:justify-between">
              <div className="flex items-center gap-5">
                <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center">
                  <UserCircle className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Patient Profile</p>
                  <h1 className="text-3xl md:text-4xl font-bold mt-2">{userName}</h1>
                  <p className="text-sm text-muted-foreground mt-1">MRN: AZ-239418 • Age 42 • Male</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className="rounded-full border border-border/60 bg-card/70 px-4 py-2 text-xs font-semibold text-muted-foreground">
                  Demo Data
                </span>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-700">
                  Active Patient
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 mt-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="rounded-3xl border border-border/60 bg-card/80 p-7 shadow-lg shadow-primary/5">
              <div className="flex items-center gap-3 mb-4">
                <ClipboardList className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Personal Details</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p><span className="font-semibold text-foreground">DOB:</span> 13 Aug 1983</p>
                <p><span className="font-semibold text-foreground">Blood Group:</span> O+</p>
                <p><span className="font-semibold text-foreground">Address:</span> 12, Residency Road, Bengaluru</p>
                <p><span className="font-semibold text-foreground">Language:</span> English, Kannada</p>
                <p><span className="font-semibold text-foreground">Emergency Contact:</span> Priya Mehta • +91 90000 11223</p>
              </div>
            </div>

            <div className="rounded-3xl border border-border/60 bg-card/80 p-7 shadow-lg shadow-primary/5">
              <div className="flex items-center gap-3 mb-4">
                <HeartPulse className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Health Summary</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p><span className="font-semibold text-foreground">Primary Conditions:</span> Type 2 Diabetes, Mild Hypertension</p>
                <p><span className="font-semibold text-foreground">Allergies:</span> Penicillin, Latex</p>
                <p><span className="font-semibold text-foreground">Care Plan:</span> Glucose monitoring, low sodium diet</p>
                <p><span className="font-semibold text-foreground">Primary Physician:</span> Dr. Meera Iyer</p>
                <p><span className="font-semibold text-foreground">Last Visit:</span> Mar 10, 2026</p>
              </div>
            </div>

            <div className="rounded-3xl border border-border/60 bg-card/80 p-7 shadow-lg shadow-primary/5">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Coverage</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p><span className="font-semibold text-foreground">Insurance:</span> Arogya Plus Gold</p>
                <p><span className="font-semibold text-foreground">Policy #:</span> AG-8820319</p>
                <p><span className="font-semibold text-foreground">Coverage:</span> OPD + Hospitalization</p>
                <p><span className="font-semibold text-foreground">Valid Until:</span> Dec 31, 2026</p>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 mt-12">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8">
            <div className="rounded-3xl border border-border/60 bg-card/80 p-7 shadow-lg shadow-primary/5">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Vitals Snapshot</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                {[
                  { label: "Heart Rate", value: "72 bpm" },
                  { label: "Blood Pressure", value: "118/76" },
                  { label: "HbA1c", value: "6.2%" },
                  { label: "BMI", value: "24.8" }
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-lg font-semibold mt-1">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-border/60 bg-card/80 p-7 shadow-lg shadow-primary/5">
              <div className="flex items-center gap-3 mb-4">
                <CalendarDays className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Upcoming Care</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                  <p className="font-semibold text-foreground">Primary Care Checkup</p>
                  <p className="text-xs text-muted-foreground">Apr 2, 2026 • 9:30 AM</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                  <p className="font-semibold text-foreground">Lab Panel</p>
                  <p className="text-xs text-muted-foreground">Apr 6, 2026 • Fasting</p>
                </div>
              </div>
              <button className="mt-5 w-full rounded-xl bg-primary text-primary-foreground py-2 text-sm font-semibold">
                Manage appointments
              </button>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 mt-12">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="rounded-3xl border border-border/60 bg-card/80 p-7 shadow-lg shadow-primary/5">
              <div className="flex items-center gap-3 mb-4">
                <Droplets className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Medications</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                {["Metformin XR 500 mg • Morning", "Atorvastatin 10 mg • Night", "Vitamin D3 • Lunch"].map((item) => (
                  <div key={item} className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-border/60 bg-card/80 p-7 shadow-lg shadow-primary/5">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Medical Notes</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>Diet focus: reduce refined carbs, increase protein and fiber.</p>
                <p>Exercise: 20-minute walk after dinner, 5x weekly.</p>
                <p>Next review: monitor HbA1c in 6 weeks.</p>
              </div>
              <button className="mt-5 w-full rounded-xl border border-border/60 bg-background/70 py-2 text-sm font-semibold">
                Download summary
              </button>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 mt-12">
          <div className="rounded-3xl border border-border/60 bg-card/80 p-7 shadow-lg shadow-primary/5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <PhoneCall className="w-6 h-6 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Need to update details?</p>
                <p className="text-lg font-semibold">Contact your care coordinator</p>
              </div>
            </div>
            <button
              className="rounded-xl bg-destructive text-destructive-foreground px-6 py-2 text-sm font-semibold"
              onClick={() => {
                localStorage.removeItem("az_logged_in");
                localStorage.removeItem("az_user_name");
                window.location.href = "/";
              }}
            >
              Logout
            </button>
          </div>
        </section>
      </main>
</div>
  );
};

export default Profile;

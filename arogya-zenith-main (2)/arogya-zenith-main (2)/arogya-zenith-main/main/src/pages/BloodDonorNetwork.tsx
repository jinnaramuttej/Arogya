import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import {
  Activity,
  AlertCircle,
  BadgeCheck,
  CalendarDays,
  Droplets,
  MapPin,
  PhoneCall,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  UserPlus,
  X
} from "lucide-react";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

type DonorStatus = "Available" | "Recently Donated" | "Unavailable";

type Donor = {
  id: string;
  name: string;
  group: string;
  location: string;
  distanceKm: number;
  lastDonation: string;
  status: DonorStatus;
  phone: string;
};

const DONORS: Donor[] = [
  {
    id: "d-1",
    name: "Ananya Rao",
    group: "O+",
    location: "Indiranagar, Bengaluru",
    distanceKm: 2.1,
    lastDonation: "2025-12-18",
    status: "Available",
    phone: "+91 98765 43210"
  },
  {
    id: "d-2",
    name: "Karthik Mehta",
    group: "A-",
    location: "Koramangala, Bengaluru",
    distanceKm: 3.6,
    lastDonation: "2026-02-02",
    status: "Recently Donated",
    phone: "+91 99887 11223"
  },
  {
    id: "d-3",
    name: "Priya Menon",
    group: "B+",
    location: "HSR Layout, Bengaluru",
    distanceKm: 1.4,
    lastDonation: "2025-10-01",
    status: "Available",
    phone: "+91 99001 22445"
  },
  {
    id: "d-4",
    name: "Rohit Singh",
    group: "O-",
    location: "Whitefield, Bengaluru",
    distanceKm: 6.8,
    lastDonation: "2026-01-10",
    status: "Unavailable",
    phone: "+91 90123 45789"
  },
  {
    id: "d-5",
    name: "Neha Kapoor",
    group: "AB+",
    location: "Jayanagar, Bengaluru",
    distanceKm: 4.2,
    lastDonation: "2025-11-12",
    status: "Available",
    phone: "+91 97654 31987"
  },
  { id: "d-6", name: "Sanya Malhotra", group: "B+", location: "Lucknow", distanceKm: 5.2, lastDonation: "2025-11-20", status: "Available", phone: "Hidden" },
  { id: "d-7", name: "Kabir Joshi", group: "O+", location: "Jaipur", distanceKm: 8.4, lastDonation: "2025-12-05", status: "Available", phone: "Hidden" },
  { id: "d-8", name: "Meera Iyer", group: "AB-", location: "Ahmedabad", distanceKm: 12.1, lastDonation: "2026-01-15", status: "Available", phone: "Hidden" },
  { id: "d-9", name: "Aditya Reddy", group: "B+", location: "Kolkata", distanceKm: 15.6, lastDonation: "2025-10-10", status: "Available", phone: "Hidden" },
  { id: "d-10", name: "Ishita Verma", group: "A-", location: "Pune", distanceKm: 4.8, lastDonation: "2026-02-20", status: "Available", phone: "Hidden" },
  { id: "d-11", name: "Rohan Kumar", group: "O-", location: "Chennai", distanceKm: 22.3, lastDonation: "2025-09-05", status: "Available", phone: "Hidden" },
  { id: "d-12", name: "Ananya Gupta", group: "AB+", location: "Hyderabad", distanceKm: 3.2, lastDonation: "2026-03-01", status: "Available", phone: "Hidden" },
  { id: "d-13", name: "Vihaan Singh", group: "B-", location: "Bangalore", distanceKm: 1.1, lastDonation: "2025-12-25", status: "Available", phone: "Hidden" },
  { id: "d-14", name: "Diya Sharma", group: "A+", location: "Delhi", distanceKm: 18.2, lastDonation: "2026-01-30", status: "Available", phone: "Hidden" },
  { id: "d-15", name: "Aarav Patel", group: "O+", location: "Mumbai", distanceKm: 25.5, lastDonation: "2025-11-15", status: "Available", phone: "Hidden" },
  { id: "d-16", name: "Sreaya Gupta", group: "B+", location: "Bangalore", distanceKm: 0.8, lastDonation: "2026-02-14", status: "Available", phone: "Hidden" },
  { id: "d-17", name: "Varshini Reddy", group: "O+", location: "Hyderabad", distanceKm: 2.5, lastDonation: "2026-01-05", status: "Available", phone: "Hidden" },
  { id: "d-18", name: "varshini", group: "O+", location: "hyderabad", distanceKm: 4.1, lastDonation: "2025-12-12", status: "Available", phone: "Hidden" },
  { id: "d-19", name: "sravya", group: "A+", location: "warangal", distanceKm: 145, lastDonation: "2026-01-20", status: "Available", phone: "Hidden" },
  { id: "d-20", name: "Sai yashvanth reddy", group: "O+", location: "mahabubnagar", distanceKm: 95, lastDonation: "2025-11-30", status: "Available", phone: "Hidden" },
  { id: "d-21", name: "KOMAL .V", group: "A+", location: "dubai", distanceKm: 2500, lastDonation: "2026-03-10", status: "Available", phone: "Hidden" },
  { id: "d-22", name: "Saketh", group: "A+", location: "hanamkonda", distanceKm: 142, lastDonation: "2026-02-05", status: "Available", phone: "Hidden" },
  { id: "d-23", name: "Asish Chowdary", group: "O+", location: "rajamundry", distanceKm: 450, lastDonation: "2026-01-15", status: "Available", phone: "Hidden" },
  { id: "d-24", name: "Venkata Reddy", group: "A+", location: "guntur", distanceKm: 270, lastDonation: "2026-03-05", status: "Available", phone: "Hidden" },
  { id: "d-25", name: "Asish chowdary", group: "A+", location: "rajamundry", distanceKm: 451, lastDonation: "2025-10-10", status: "Available", phone: "Hidden" },
  { id: "d-26", name: "varshini", group: "B+", location: "hyderabad", distanceKm: 3.9, lastDonation: "2026-02-28", status: "Available", phone: "Hidden" }
];

const REQUESTS_SEED = [
  {
    id: "r-1",
    hospital: "St. Agnes Hospital",
    group: "O-",
    contact: "+91 90123 45678",
    urgency: "Critical",
    location: "Malleswaram, Bengaluru"
  },
  {
    id: "r-2",
    hospital: "CityCare Trauma Unit",
    group: "A+",
    contact: "+91 90011 22334",
    urgency: "High",
    location: "Hebbal, Bengaluru"
  }
];

const statusStyles: Record<DonorStatus, string> = {
  Available: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  "Recently Donated": "bg-amber-500/15 text-amber-600 border-amber-500/30",
  Unavailable: "bg-slate-500/15 text-slate-500 border-slate-500/30"
};

const clayCard =
  "rounded-3xl border border-border/60 bg-card/80 shadow-[0_18px_40px_rgba(14,165,164,0.15)]";

const daysSince = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

const BloodDonorNetwork = () => {
  const { t } = useLanguage();
  const [searchGroup, setSearchGroup] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [radius, setRadius] = useState(10);
  const [availability, setAvailability] = useState<DonorStatus | "Any">("Any");
  const [minDays, setMinDays] = useState(0);

  const [requests, setRequests] = useState(REQUESTS_SEED);
  const [alertSent, setAlertSent] = useState("");

  const [regName, setRegName] = useState("");
  const [regAge, setRegAge] = useState("");
  const [regGroup, setRegGroup] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regLocation, setRegLocation] = useState("");
  const [regLastDonation, setRegLastDonation] = useState("");
  const [eligibilityMsg, setEligibilityMsg] = useState("");

  const [dashboardStatus, setDashboardStatus] = useState<DonorStatus>("Available");
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);

  const DonorChatModal = ({ donor, onClose }: { donor: Donor; onClose: () => void }) => {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-4xl h-[600px] bg-[#0f172a] border border-white/10 rounded-[2rem] shadow-2xl flex overflow-hidden text-white"
        >
          {/* Sidebar */}
          <div className="w-80 border-r border-white/10 flex flex-col bg-[#1e293b]/50">
            <div className="p-6 border-b border-white/10">
              <h3 className="font-bold text-lg">{t("chat_sidebar_title")}</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              <div className="p-4 rounded-2xl bg-primary/20 border border-primary/30 flex justify-between items-start">
                <div>
                  <p className="font-bold text-sm">{donor.name}</p>
                  <p className="text-[11px] text-white/50 mt-1">Starting request...</p>
                </div>
                <span className="text-[10px] text-white/40">Active</span>
              </div>
            </div>
          </div>

          {/* Main Chat */}
          <div className="flex-1 flex flex-col bg-[#0f172a]">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Donor Connect</h2>
                <p className="text-xs text-white/50 mt-1 tracking-wider uppercase font-semibold">{t("chat_id")}: {donor.id}</p>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                title="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Pane */}
            <div className="flex-1 p-8 overflow-y-auto flex flex-center flex-col items-center justify-center text-center">
              <div className="max-w-xs space-y-2">
                 <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                   <Send className="w-8 h-8 text-primary" />
                 </div>
                 <p className="text-sm font-semibold">{t("chat_empty_msg")}</p>
                 <p className="text-xs text-white/40">Your messages are encrypted and secure.</p>
              </div>
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-white/10 bg-[#1e293b]/30">
              <div className="flex items-center gap-3">
                <input 
                  type="text" 
                  placeholder={t("chat_input_placeholder")}
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                />
                <button className="px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors text-sm font-semibold">
                  {t("chat_clear_btn")}
                </button>
                <button className="px-8 py-3 rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-sm font-semibold">
                  {t("chat_send_btn")}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  const filteredDonors = useMemo(() => {
    return DONORS.filter((donor) => {
      if (searchGroup && donor.group !== searchGroup) return false;
      if (availability !== "Any" && donor.status !== availability) return false;
      if (searchLocation && !donor.location.toLowerCase().includes(searchLocation.toLowerCase())) return false;
      if (donor.distanceKm > radius) return false;
      if (minDays > 0 && daysSince(donor.lastDonation) < minDays) return false;
      return true;
    }).sort((a, b) => {
      const priority = (d: Donor) =>
        d.status === "Available" ? 0 : d.status === "Recently Donated" ? 1 : 2;
      return priority(a) - priority(b) || a.distanceKm - b.distanceKm;
    });
  }, [availability, minDays, radius, searchGroup, searchLocation]);

  const aiMatches = filteredDonors.slice(0, 3);

  const handleEmergencyRequest = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const hospital = String(form.get("hospital") || "");
    const group = String(form.get("group") || "");
    const contact = String(form.get("contact") || "");
    const urgency = String(form.get("urgency") || "High");
    const location = String(form.get("location") || "");
    if (!hospital || !group || !contact || !location) return;
    setRequests((prev) => [
      {
        id: `r-${prev.length + 3}`,
        hospital,
        group,
        contact,
        urgency,
        location
      },
      ...prev
    ]);
    const notified = filteredDonors.filter((d) => d.group === group && d.distanceKm <= radius).length;
    setAlertSent(`Alert sent to ${notified || 0} nearby donors within ${radius} km.`);
    setTimeout(() => setAlertSent(""), 5000);
    e.currentTarget.reset();
  };

  const [matchingMode, setMatchingMode] = useState(false);
  const handleAutoMatch = () => {
    setMatchingMode(true);
    setTimeout(() => {
      setMatchingMode(false);
      setAlertSent(t("blood_match_success") || "Smart match complete. Priority donors highlighted.");
      setTimeout(() => setAlertSent(""), 3000);
    }, 2000);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const ageNum = Number(regAge);
    const days = regLastDonation ? daysSince(regLastDonation) : 999;
    if (ageNum < 18 || ageNum > 60) {
      setEligibilityMsg("Not eligible: donors must be 18-60 years old.");
      return;
    }
    if (days < 90) {
      setEligibilityMsg("Not eligible: last donation must be at least 90 days ago.");
      return;
    }
    setEligibilityMsg("You are eligible. A coordinator will verify your details.");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-28 pb-24">
        <section className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2.5rem] border border-border/60 bg-gradient-to-br from-card via-background to-card/70 p-8 md:p-12 shadow-xl shadow-primary/5 relative overflow-hidden"
          >
            <div className="absolute -top-16 right-0 h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />
            <div className="absolute -bottom-20 left-0 h-64 w-64 rounded-full bg-secondary/10 blur-[120px]" />
            <div className="relative z-10 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                  <Droplets className="w-4 h-4" />
                  {t("blood_heading")}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mt-6 leading-tight">
                  {t("blood_subheading")}
                </h1>
                <p className="text-lg text-muted-foreground mt-4 max-w-xl">
                  {t("blood_desc")}
                </p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <button 
                    onClick={() => scrollToSection("emergency-request")}
                    className="btn-primary px-7 py-3"
                  >
                    {t("blood_request_btn")}
                  </button>
                  <button 
                    onClick={() => scrollToSection("donor-registration")}
                    className="btn-outline px-7 py-3"
                  >
                    {t("blood_become_donor_btn")}
                  </button>
                </div>
                <div className="mt-6 flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-4 py-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    {t("blood_verified_donors")}
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-4 py-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    {t("blood_ai_matching")}
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-4 py-2">
                    <BadgeCheck className="w-4 h-4 text-primary" />
                    {t("blood_alerts")}
                  </div>
                </div>
              </div>

              <div className={`${clayCard} p-6`}>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{t("blood_quick_match")}</p>
                <div className="mt-4 space-y-4">
                  {aiMatches.map((donor) => (
                    <div key={donor.id} className="rounded-2xl border border-border/60 bg-background/70 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{donor.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {donor.group} • {donor.distanceKm} km
                          </p>
                        </div>
                        <span className={`text-[10px] px-3 py-1 rounded-full border ${statusStyles[donor.status]}`}>
                          {donor.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={handleAutoMatch}
                  disabled={matchingMode}
                  className="mt-5 w-full rounded-xl bg-primary text-primary-foreground py-2 text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {matchingMode && <Activity className="w-4 h-4 animate-spin" />}
                  {matchingMode ? t("blood_matching") || "Matching..." : t("blood_auto_match_btn")}
                </button>
              </div>
            </div>
          </motion.div>
        </section>

        <section id="search-donors" className="container mx-auto px-6 mt-16">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-10">
            <div className={`${clayCard} p-7`}>
              <div className="flex items-center gap-3 mb-6">
                <Search className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-semibold">{t("blood_search") || "Smart Donor Search"}</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="blood-group-select" className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t("blood_group_label")}</label>
                  <select 
                    id="blood-group-select"
                    value={searchGroup} 
                    onChange={(e) => setSearchGroup(e.target.value)} 
                    className="input-field mt-2"
                    title={t("blood_group_label")}
                  >
                    <option value="">All groups</option>
                    {BLOOD_GROUPS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t("blood_location_label") || "Location"}</label>
                  <input
                    className="input-field mt-2"
                    placeholder={t("blood_location_placeholder")}
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t("blood_distance_label")}</label>
                  <input
                    type="range"
                    min={1}
                    max={25}
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    className="w-full mt-4"
                    title={t("blood_radius_msg")?.replace("{0}", radius.toString())}
                  />
                  <p className="text-xs text-muted-foreground mt-2">{t("blood_radius_msg")?.replace("{0}", radius.toString())}</p>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t("blood_availability_label")}</label>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value as DonorStatus | "Any")}
                    className="input-field mt-2"
                    title={t("blood_availability_label")}
                  >
                    <option value="Any">{t("blood_any_label")}</option>
                    <option value="Available">{t("blood_available_label")}</option>
                    <option value="Recently Donated">{t("blood_recently_donated_label")}</option>
                    <option value="Unavailable">{t("blood_unavailable_label")}</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t("blood_last_donation_label")}</label>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[0, 90, 120].map((days) => (
                      <button
                        key={days}
                        onClick={() => setMinDays(days)}
                        className={`rounded-full px-4 py-2 text-xs font-semibold border ${
                          minDays === days ? "bg-primary text-primary-foreground border-primary" : "bg-card/70 border-border/60 text-muted-foreground"
                        }`}
                        title={days === 0 ? t("blood_any_label") : `${days}+ ${t("blood_days_ago")}`}
                      >
                        {days === 0 ? t("blood_any_label") : `${days}+ ${t("blood_days_ago")}`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className={`${clayCard} p-7`}>
              <h3 className="text-xl font-semibold">{t("blood_ai_match_title")}</h3>
              <p className="text-sm text-muted-foreground mt-3">
                {t("blood_ai_match_desc")}
              </p>
              <div className="mt-4 space-y-3">
                {aiMatches.map((donor) => (
                  <div key={donor.id} className="rounded-2xl border border-border/60 bg-background/70 p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{donor.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {donor.group} • {donor.distanceKm} km • {t("blood_last_donated")} {daysSince(donor.lastDonation)} {t("blood_days_ago")}
                      </p>
                    </div>
                    <button 
                      onClick={() => setSelectedDonor(donor)}
                      className="rounded-xl border border-border/60 bg-card/70 px-3 py-2 text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition"
                      title={t("blood_connect_btn")}
                    >
                      {t("blood_connect_btn")}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDonors.map((donor) => (
              <motion.div
                key={donor.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`${clayCard} p-5`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {donor.group}
                    </div>
                    <div>
                      <p className="font-semibold">{donor.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5" />
                        {donor.location} • {donor.distanceKm} km
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] px-3 py-1 rounded-full border ${statusStyles[donor.status]}`}>
                    {donor.status}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{t("blood_last_donated")}: {donor.lastDonation}</span>
                  <span>{daysSince(donor.lastDonation)} {t("blood_days_ago")}</span>
                </div>
                <button 
                  onClick={() => setSelectedDonor(donor)}
                  className="mt-4 w-full rounded-xl bg-primary text-primary-foreground py-2 text-sm font-semibold flex items-center justify-center gap-2"
                  title={t("blood_contact_btn")}
                >
                  <PhoneCall className="w-4 h-4" />
                  {t("blood_contact_btn")}
                </button>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="emergency-request" className="container mx-auto px-6 mt-16">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-10">
            <div className={`${clayCard} p-7`}>
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <h2 className="text-2xl font-semibold">{t("blood_emergency_title") || "Emergency Request System"}</h2>
              </div>
              {alertSent && (
                <div className="mb-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
                  {alertSent}
                </div>
              )}
              <form onSubmit={handleEmergencyRequest} className="grid sm:grid-cols-2 gap-4">
                <input name="hospital" className="input-field" placeholder="Hospital name" required />
                <select name="group" className="input-field" required title={t("blood_group_label")}>
                  <option value="">Required blood group</option>
                  {BLOOD_GROUPS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                <input name="contact" className="input-field" placeholder="Contact number" required />
                <input name="location" className="input-field" placeholder="Location" required />
                <select name="urgency" className="input-field sm:col-span-2" title="Urgency Level">
                  <option value="High">High urgency</option>
                  <option value="Critical">Critical</option>
                </select>
                <button type="submit" className="btn-primary sm:col-span-2 py-3 flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" />
                  Broadcast Request
                </button>
              </form>
            </div>

            <div className={`${clayCard} p-7`}>
              <h3 className="text-xl font-semibold">{t("blood_live_requests_title")}</h3>
              <div className="mt-4 space-y-4">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className={`rounded-2xl border p-4 ${
                      req.urgency === "Critical"
                        ? "border-destructive/40 bg-destructive/10"
                        : "border-border/60 bg-background/70"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{req.hospital}</p>
                      <span className="text-xs font-semibold text-destructive">
                        {req.urgency === "Critical" ? t("blood_urgency_critical") : t("blood_urgency_high")}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("blood_required_msg")?.replace("{0}", req.group).replace("{1}", req.location)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Contact ID: {req.id}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="donor-registration" className="container mx-auto px-6 mt-16">
          <div className="grid lg:grid-cols-[1fr_1fr] gap-8">
            <div className={`${clayCard} p-7`}>
              <div className="flex items-center gap-3 mb-4">
                <UserPlus className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-semibold">{t("blood_become_donor_btn")}</h2>
              </div>
              <form onSubmit={handleRegister} className="space-y-4">
                <input
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="input-field"
                  placeholder="Full name"
                  required
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    value={regAge}
                    onChange={(e) => setRegAge(e.target.value)}
                    className="input-field"
                    placeholder="Age"
                    type="number"
                    min={18}
                    max={60}
                    required
                  />
                  <select value={regGroup} onChange={(e) => setRegGroup(e.target.value)} className="input-field" required>
                    <option value="">Blood group</option>
                    {BLOOD_GROUPS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="input-field"
                  placeholder="Phone number"
                  required
                />
                <input
                  value={regLocation}
                  onChange={(e) => setRegLocation(e.target.value)}
                  className="input-field"
                  placeholder="Location"
                  required
                />
                <input
                  value={regLastDonation}
                  onChange={(e) => setRegLastDonation(e.target.value)}
                  className="input-field"
                  type="date"
                  placeholder="Last donation date"
                />
                <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Submit for verification
                </button>
              </form>
              {eligibilityMsg && (
                <p className="mt-4 text-sm text-muted-foreground flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-primary" />
                  {eligibilityMsg}
                </p>
              )}
              <div className="mt-4 rounded-2xl border border-border/60 bg-background/70 p-4 text-xs text-muted-foreground">
                Eligibility: Age 18–60, no donation in the last 90 days, healthy weight, no recent infections.
              </div>
            </div>

            <div className={`${clayCard} p-7`}>
              <div className="flex items-center gap-3 mb-4">
                <CalendarDays className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-semibold">Donor Dashboard</h2>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/70 p-5">
                <p className="text-sm text-muted-foreground">Profile</p>
                <p className="text-lg font-semibold mt-1">Aarav Mehta • O+</p>
                <p className="text-xs text-muted-foreground">Last donation: 2025-12-18</p>
                <p className="text-xs text-muted-foreground">Next eligible: 2026-03-18</p>
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <select
                    value={dashboardStatus}
                    onChange={(e) => setDashboardStatus(e.target.value as DonorStatus)}
                    className="input-field max-w-[200px]"
                    title="Donor Availability Status"
                  >
                    <option value="Available">Available</option>
                    <option value="Recently Donated">Recently Donated</option>
                    <option value="Unavailable">Unavailable</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {["2025-12-18 • 1 unit", "2025-09-05 • 1 unit", "2025-05-22 • 1 unit"].map((entry) => (
                  <div key={entry} className="rounded-2xl border border-border/60 bg-background/70 p-3 text-sm">
                    {entry}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 mt-16">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8">
            <div className={`${clayCard} p-7`}>
              <h2 className="text-2xl font-semibold">Notifications</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Nearby donors are alerted automatically when an emergency request is posted.
              </p>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-700">
                  3 donors notified within 5 km for O- at St. Agnes Hospital.
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
                  Push alerts enabled for emergency requests in Bengaluru.
                </div>
              </div>
            </div>

            <div className={`${clayCard} p-7`}>
              <h2 className="text-2xl font-semibold">Map View</h2>
              <p className="text-sm text-muted-foreground mt-2">Optional enhancement: visualize nearby donors.</p>
              <div className="mt-4 h-56 rounded-2xl border border-border/60 bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center text-sm text-muted-foreground">
                Map integration coming soon
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <AnimatePresence>
        {selectedDonor && (
          <DonorChatModal 
            donor={selectedDonor} 
            onClose={() => setSelectedDonor(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default BloodDonorNetwork;

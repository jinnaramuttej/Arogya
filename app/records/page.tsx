"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Upload, Plus, Activity, Calendar, User, Clipboard, Download, Droplets, ArrowRight, Brain } from "lucide-react";
import Link from "next/link";

import { useLanguage } from "@/lib/context/LanguageContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const HealthRecords = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const [records, setRecords] = useState([
    { id: 1, name: "Health Checkup Report", date: "2026-03-20", type: "PDF", size: "2.4 MB" },
    { id: 2, name: "Blood Test Results", date: "2026-02-15", type: "PDF", size: "1.1 MB" },
    { id: 3, name: "Cardiology Consultation", date: "2026-01-10", type: "PDF", size: "3.8 MB" },
  ]);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [form, setForm] = useState({ medicine: "", dosage: "", duration: "" });
  const [showBloodRequest, setShowBloodRequest] = useState(false);

  const handlePrescriptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newP = { ...form, date: new Date().toISOString().split("T")[0], id: Date.now() };
    setPrescriptions([newP, ...prescriptions]);
    setForm({ medicine: "", dosage: "", duration: "" });
    setShowPrescriptionForm(false);
    toast.success("Prescription added to secure vault");
    
    if (form.medicine.toLowerCase().includes("surgery")) {
      setShowBloodRequest(true);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const newRecord = {
      id: Date.now(),
      name: file.name,
      date: new Date().toISOString().split("T")[0],
      type: file.type.split("/")[1]?.toUpperCase() || "DOC",
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
    };
    
    setRecords([newRecord, ...records]);
    toast.success("Document uploaded securely");
  };

  const handleDeleteRecord = (id: number) => {
    setRecords(records.filter(r => r.id !== id));
    toast.info("Record removed");
  };

  const handleDeletePrescription = (id: number) => {
    setPrescriptions(prescriptions.filter(p => p.id !== id));
    toast.info("Prescription removed");
  };

  const handleAnalysis = (data: any) => {
    toast.loading("Preparing AI Clinical Analysis...");
    setTimeout(() => {
      router.push("/symptom");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Blobs */}
      <div className="floating-blob w-[500px] h-[500px] bg-primary/20 -top-24 -left-24" />
      <div className="floating-blob w-[400px] h-[400px] bg-secondary/20 bottom-0 -right-24" />
<main className="container mx-auto px-6 pt-32 pb-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-16">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold">
                <Clipboard className="w-4 h-4" />
                {t("records_hero_badge")}
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                {t("records_hero_title")} <br />
                <span className="gradient-text">{t("records_hero_title_2")}</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-xl">
                {t("records_hero_desc")}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <input 
                type="file" 
                id="record-upload" 
                className="hidden" 
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.jpg,.png"
                title="Upload Medical Record"
              />
              <button 
                onClick={() => document.getElementById("record-upload")?.click()}
                className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-card border border-border/50 font-bold hover:border-primary/50 transition-all hover:shadow-lg"
                title={t("records_upload_btn")}
              >
                <Upload className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" /> 
                {t("records_upload_btn")}
              </button>
              <button
                onClick={() => setShowPrescriptionForm(true)}
                className="btn-primary flex items-center gap-3 px-8 py-4"
                title={t("records_new_entry_btn")}
              >
                <Plus className="w-5 h-5" /> {t("records_new_entry_btn")}
              </button>
            </div>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Health Profile - Left Column (Bento Item) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="md:col-span-4 lg:col-span-3 bento-item p-8 bg-gradient-to-br from-card to-muted/20"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{t("records_profile_title")}</h3>
              </div>
              
              <div className="space-y-6">
                {[
                  { label: "records_blood_group", value: "O+", color: "text-destructive", icon: Droplets },
                  { label: "records_weight", value: "72 kg", color: "text-primary", icon: Activity },
                  { label: "records_allergies", value: t("chat_clear_btn") === "साफ करें" ? "कोई नहीं" : (t("chat_clear_btn") === "క్లియర్" ? "ఏమీ లేదు" : "None"), color: "text-secondary", icon: Clipboard },
                  { label: "records_last_checkup", value: `2 ${t("blood_days_ago")}`, color: "text-muted-foreground", icon: Calendar },
                ].map((stat, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-background/50 rounded-2xl border border-border/50 group hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-3">
                      <stat.icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">{t(stat.label)}</span>
                    </div>
                    <span className={`font-bold ${stat.color}`}>{stat.value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-primary/5 border border-primary/10 rounded-2xl">
                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">{t("records_health_status")}</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  <p className="text-sm font-semibold">{t("records_health_optimal")}</p>
                </div>
              </div>
            </motion.div>

            {/* Recent Medical Records - Middle Column (Bento Item) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="md:col-span-8 lg:col-span-6 bento-item p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                    <Clipboard className="w-5 h-5 text-secondary" />
                  </div>
                  <h3 className="text-xl font-bold">{t("records_archive_title")}</h3>
                </div>
                <button className="text-sm font-bold text-primary hover:underline">{t("records_view_all")}</button>
              </div>

              <div className="grid gap-4">
                {records.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-border/40 rounded-3xl">
                    <p className="text-muted-foreground italic">{t("records_no_docs")}</p>
                  </div>
                ) : (
                  records.map((record) => (
                    <div key={record.id} className="p-6 bg-muted/20 border border-border/50 rounded-2xl flex items-center justify-between group hover:bg-background hover:border-primary/30 transition-all cursor-pointer">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-xl bg-background flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                          <FileText className="w-7 h-7 text-primary" />
                        </div>
                        <div>
                          <p className="font-bold text-lg group-hover:text-primary transition-colors">{record.name}</p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {record.date}</span>
                            <span className="w-1 h-1 rounded-full bg-border" />
                            <span>{record.size}</span>
                          </div>
                          <div className="mt-3 flex gap-2">
                             <button 
                               onClick={(e) => { e.stopPropagation(); handleAnalysis(record); }}
                               className="text-[10px] font-bold text-primary px-3 py-1 rounded-lg bg-primary/5 border border-primary/20 hover:bg-primary hover:text-white transition"
                             >
                               AI ANALYSIS
                             </button>
                             <button 
                               onClick={(e) => { e.stopPropagation(); handleDeleteRecord(record.id); }}
                               className="text-[10px] font-bold text-destructive px-3 py-1 rounded-lg bg-destructive/5 border border-destructive/20 hover:bg-destructive hover:text-white transition"
                             >
                               REMOVE
                             </button>
                          </div>
                        </div>
                      </div>
                      <button 
                        className="p-3 rounded-xl bg-background border border-border/50 text-muted-foreground hover:text-primary hover:border-primary/30 transition-all shadow-sm"
                        title="Download"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Digital Prescriptions - Right/Bottom Column (Bento Item) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="md:col-span-12 lg:col-span-3 bento-item p-8 bg-gradient-to-br from-card to-primary/5"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{t("records_prescriptions_title")}</h3>
              </div>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {prescriptions.length === 0 ? (
                  <div className="text-center py-12 px-6 border-2 border-dashed border-border/50 rounded-3xl bg-background/30">
                    <button 
                      onClick={() => setShowPrescriptionForm(true)}
                      className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 hover:bg-primary/20 hover:text-primary transition-all"
                      title={t("records_new_entry_btn")}
                    >
                      <Plus className="w-6 h-6 text-muted-foreground" />
                    </button>
                    <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                      {t("records_no_prescriptions")} <br />
                      <button onClick={() => setShowPrescriptionForm(true)} className="text-primary hover:underline font-bold" title={t("records_add_one")}>{t("records_add_one")}</button> {t("records_start_tracking")}
                    </p>
                    <button 
                      onClick={() => handleAnalysis({ type: "PRESCRIPTION_SCAN" })}
                      className="mt-6 w-full py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-xs flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all shadow-md group"
                      title={t("records_ai_analysis")}
                    >
                      <Brain className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                      {t("records_ai_analysis")}
                    </button>
                  </div>
                ) : (
                  prescriptions.map((p, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 bg-background border border-border/50 rounded-2xl space-y-4 hover:shadow-md transition-all group"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Plus className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{t("records_medicine_label")}</p>
                            <p className="font-bold">{p.medicine}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => handleAnalysis(p)}
                            className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-primary hover:text-white transition"
                            title={t("records_ai_analysis")}
                          >
                            <Brain className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeletePrescription(p.id)}
                            className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-destructive hover:text-white transition"
                            title={t("records_remove")}
                          >
                            <Clipboard className="w-3.5 h-3.5 rotate-45" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-muted/20 rounded-xl border border-border/30">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">{t("records_dosage_label")}</p>
                          <p className="text-xs font-bold">{p.dosage}</p>
                        </div>
                        <div className="p-3 bg-muted/20 rounded-xl border border-border/30">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">{t("records_days")}</p>
                          <p className="text-xs font-bold">{p.duration}</p>
                        </div>
                      </div>

                      {p.medicine.toLowerCase().includes("surgery") && (
                        <Link href="/blood" className="flex items-center justify-between p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive hover:bg-destructive/20 transition-all font-bold text-[10px] uppercase tracking-tighter group/btn" title={t("records_surgery_alert")}>
                          <div className="flex items-center gap-2">
                            <Droplets className="w-3.5 h-3.5 animate-bounce" />
                            {t("records_surgery_alert")}
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>

          </div>
        </motion.div>
      </main>

      {showPrescriptionForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-background/60 backdrop-blur-xl"
            onClick={() => setShowPrescriptionForm(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative glass-card p-10 max-w-lg w-full shadow-2xl overflow-hidden border-primary/20"
          >
            {/* Modal Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-[80px] rounded-full" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Plus className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">{t("records_modal_title")}</h2>
                  <p className="text-muted-foreground">{t("records_modal_desc")}</p>
                </div>
              </div>

              <form onSubmit={handlePrescriptionSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{t("records_medicine_label")}</label>
                  <input
                    type="text"
                    className="input-field py-4"
                    placeholder="e.g., Paracetamol"
                    value={form.medicine}
                    onChange={(e) => setForm({ ...form, medicine: e.target.value })}
                    required
                    title={t("records_medicine_label")}
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{t("records_dosage_label")}</label>
                    <input
                      type="text"
                      className="input-field py-4"
                      placeholder="e.g., 500mg"
                      value={form.dosage}
                      onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                      required
                      title={t("records_dosage_label")}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{t("records_duration_label")}</label>
                    <input
                      type="text"
                      className="input-field py-4"
                      placeholder="e.g., 5 days"
                      value={form.duration}
                      onChange={(e) => setForm({ ...form, duration: e.target.value })}
                      required
                      title={t("records_duration_label")}
                    />
                  </div>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPrescriptionForm(false)}
                    className="flex-1 px-8 py-4 rounded-2xl bg-muted/50 border border-border font-bold hover:bg-muted transition-all"
                    title={t("records_modal_cancel")}
                  >
                    {t("records_modal_cancel")}
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-2 px-12"
                    title={t("records_modal_save")}
                  >
                    {t("records_modal_save")}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
</div>
  );
};

export default HealthRecords;

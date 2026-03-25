import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { MapPin, ShieldCheck, Activity, AlertTriangle, ArrowRight, Info, Clock, UserPlus, Brain } from "lucide-react";
import AIBotExperience from "@/components/AIBotExperience";
import { useLanguage } from "@/context/LanguageContext";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useMemo, useState } from "react";

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// Clinics moved inside component for localization

const SymptomChecker = () => {
  const { t } = useLanguage();
  
  const clinics = useMemo(() => [
    { name: t("clinic_prime") || "Arogya Prime Clinic", lat: 12.9716, lng: 77.5946, distance: "1.2 km" },
    { name: t("clinic_care") || "CityCare Urgent Center", lat: 12.965, lng: 77.604, distance: "2.8 km" },
    { name: t("clinic_lifeline") || "Lifeline Diagnostics", lat: 12.9784, lng: 77.589, distance: "3.5 km" }
  ], [t]);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-28 pb-24">
        <section className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2.5rem] border border-border/60 bg-gradient-to-br from-card via-background to-card/70 p-8 md:p-12 shadow-xl shadow-primary/5"
          >
            <div className="flex flex-col lg:flex-row gap-10 lg:items-center lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                  <Brain className="w-4 h-4" />
                  {t("symptoms_badge") || "AI Neural Health Engine"}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mt-6 leading-tight">
                  {t("symptoms_hero_title")} <span className="gradient-text">{t("symptoms_hero_title_2") || "Neural Analysis."}</span>
                </h1>
                <p className="text-lg text-muted-foreground mt-4 max-w-xl">
                  {t("symptoms_hero_desc")}
                </p>
              </div>
              <div className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-lg shadow-primary/5">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{t("blood_alerts") || "Safety Protocol"}</p>
                <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary mt-0.5" />
                    {t("symptoms_emergency_disclaimer") || "Seek immediate care for chest pain or severe bleeding."}
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-primary mt-0.5" />
                    {t("symptoms_realtime_msg") || "Our AI evaluates symptoms in real-time."}
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-primary mt-0.5" />
                    {t("symptoms_call_emergency") || "Emergency services should be called for critical issues."}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="container mx-auto px-6 mt-12 mb-12">
          <AIBotExperience />
        </section>

        <section className="container mx-auto px-6">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8">
            <div className="rounded-3xl border border-border/60 bg-card/80 p-7 shadow-lg shadow-primary/5">
              <h3 className="text-xl font-semibold">{t("symptoms_trend") || "Projected Symptom Trend"}</h3>
              <p className="text-xs text-muted-foreground mt-2">{t("home_ai_badge") || "24/7 Intelligent Monitoring"}</p>
              <div className="mt-4 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[
                    { time: "0h", level: 4 },
                    { time: "4h", level: 6 },
                    { time: "8h", level: 5 },
                    { time: "12h", level: 7 },
                    { time: "16h", level: 6 },
                    { time: "20h", level: 8 },
                  ]}>
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="level" stroke="#0EA5A4" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                {t("symptoms_trend_msg") || "AI predicts a potential variations in intensity. Monitor closely as per the bot's advice."}
              </div>
            </div>

            <div className="rounded-3xl border border-border/60 bg-card/80 p-7 shadow-lg shadow-primary/5">
              <h3 className="text-xl font-semibold flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary" />
                {t("symptoms_nearby_care") || "Nearby Emergency Care"}
              </h3>
              <div className="mt-4 h-56 rounded-2xl overflow-hidden border border-border/60">
                <MapContainer center={[12.9716, 77.5946] as any} zoom={12} style={{ height: "100%", width: "100%" }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Circle center={[12.9716, 77.5946] as any} radius={2500} pathOptions={{ color: "#0EA5A4" } as any} />
                  {clinics.map((clinic) => (
                    <Marker key={clinic.name} position={[clinic.lat, clinic.lng] as any} icon={markerIcon}>
                      <Popup>
                        <strong>{clinic.name}</strong>
                        <br />
                        {clinic.distance} {t("symptoms_away") || "away"}
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 pb-12 mt-12">
          <div className="flex gap-3 p-4 bg-muted/30 rounded-xl max-w-4xl mx-auto">
            <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("symptoms_legal_disclaimer") || "LEGAL DISCLAIMER: This tool is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition."}
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SymptomChecker;

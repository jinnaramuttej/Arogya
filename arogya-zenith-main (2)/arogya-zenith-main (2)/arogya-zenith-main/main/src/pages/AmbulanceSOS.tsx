import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Ambulance, MapPin, Siren, Activity, PhoneCall, ShieldCheck, Timer, HeartPulse } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const AmbulanceSOS = () => {
  const [sosStatus, setSosStatus] = useState<"idle" | "dispatching" | "dispatched">("idle");
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);

  const markerIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  });

  const ambulanceIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    className: "text-primary"
  });

  const etaTrend = [
    { time: "Now", eta: 9 },
    { time: "2m", eta: 8 },
    { time: "4m", eta: 7 },
    { time: "6m", eta: 6 },
    { time: "8m", eta: 5 }
  ];

  const triggerSOS = () => {
    setSosStatus("dispatching");
    // Simulate GPS fetch
    setTimeout(() => {
      setLocation({
        lat: 12.9716,
        lng: 77.5946,
        address: "Bengaluru Central, Karnataka, India"
      });
      setSosStatus("dispatched");
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-28 pb-24">
        <section className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[2.5rem] border border-border/60 bg-gradient-to-br from-card via-background to-card/70 p-8 md:p-12 shadow-xl shadow-primary/5"
          >
            <div className="flex flex-col lg:flex-row gap-10 lg:items-center lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-destructive/20 bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive">
                  <Siren className="w-4 h-4" />
                  Emergency SOS
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mt-6 leading-tight">
                  One tap to dispatch urgent care.
                </h1>
                <p className="text-lg text-muted-foreground mt-4 max-w-xl">
                  Real-time triage, priority dispatch, and live tracking when every second counts.
                </p>
                <div className="mt-6 flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-4 py-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    Verified responders
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-4 py-2">
                    <Timer className="w-4 h-4 text-primary" />
                    Fast ETA updates
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-4 py-2">
                    <HeartPulse className="w-4 h-4 text-primary" />
                    Critical care ready
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-6">
                <div className={`w-36 h-36 rounded-full flex items-center justify-center transition-all duration-700 ${
                  sosStatus === "idle" ? "bg-muted shadow-[0_0_40px_rgba(59,130,246,0.1)]" :
                  sosStatus === "dispatching" ? "bg-destructive/20 animate-ping" : "bg-destructive shadow-[0_0_80px_rgba(239,68,68,0.4)]"
                }`}>
                  <Siren className={`w-16 h-16 ${sosStatus === "idle" ? "text-muted-foreground" : "text-white"}`} />
                </div>
                <button
                  onClick={triggerSOS}
                  disabled={sosStatus !== "idle"}
                  className={`px-10 py-5 rounded-3xl text-2xl font-black tracking-tight transition-all transform active:scale-95 ${
                    sosStatus === "idle" ? "bg-destructive text-white shadow-2xl shadow-destructive/20 hover:opacity-90" : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  {sosStatus === "idle" ? "ACTIVATE SOS" : "SOS ACTIVE"}
                </button>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="container mx-auto px-6 mt-12">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10">
            <div className="glass-card text-left space-y-8">
              <h3 className="font-bold text-2xl flex items-center gap-3">
                <Activity className="w-6 h-6 text-primary" />
                Command Center
              </h3>

              {sosStatus === "dispatched" ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-5"
                >
                  <div className="p-6 bg-secondary/10 border border-secondary/20 rounded-3xl flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
                      <Ambulance className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Response Status</p>
                      <p className="font-bold text-lg">Unit #402 Dispatched</p>
                      <p className="text-xs text-secondary font-bold">Priority traffic pre-emption active</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
                    ETA: 6–8 minutes • Trauma unit notified • Oxygen support onboard
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">ETA trend</p>
                    <div className="mt-3 h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={etaTrend}>
                          <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} domain={[0, 10]} />
                          <Tooltip />
                          <Area type="monotone" dataKey="eta" stroke="#0EA5A4" fill="rgba(14,165,164,0.2)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <button className="w-full btn-outline flex items-center justify-center gap-3 py-4 text-lg">
                    <PhoneCall className="w-5 h-5" />
                    Direct Dispatch Line
                  </button>
                </motion.div>
              ) : (
                <div className="rounded-2xl border border-border/60 bg-background/70 p-5 text-sm text-muted-foreground">
                  Trigger SOS to start live tracking, automated dispatch, and emergency contact alerts.
                </div>
              )}
            </div>

            <div className="glass-card p-0 h-[560px] relative overflow-hidden">
              <MapContainer
                center={location ? [location.lat, location.lng] : [12.9716, 77.5946]}
                zoom={12}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {location && (
                  <>
                    <Marker position={[location.lat, location.lng]} icon={markerIcon}>
                      <Popup>Incident location</Popup>
                    </Marker>
                    <Marker position={[location.lat + 0.02, location.lng - 0.02]} icon={ambulanceIcon}>
                      <Popup>Ambulance Unit #402</Popup>
                    </Marker>
                    <Polyline
                      positions={[
                        [location.lat + 0.02, location.lng - 0.02],
                        [location.lat, location.lng]
                      ]}
                      pathOptions={{ color: "#0EA5A4" }}
                    />
                  </>
                )}
              </MapContainer>
              {location ? (
                <div className="absolute bottom-6 left-6 right-6 p-5 glass rounded-2xl text-left shadow-2xl border-white/20">
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] mb-2">Live Telemetry Data</p>
                  <p className="font-mono text-sm font-bold text-primary">
                    {location.lat.toFixed(4)} / {location.lng.toFixed(4)}
                  </p>
                  <p className="text-lg font-extrabold mt-3 truncate">{location.address}</p>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-muted/10">
                  <div className="relative mb-6">
                    <MapPin className="w-16 h-16 opacity-10" />
                    <div className="absolute inset-0 animate-pulse bg-primary/5 rounded-full blur-2xl" />
                  </div>
                  <p className="text-sm font-bold tracking-widest uppercase opacity-40">Awaiting Signal Activation...</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AmbulanceSOS;

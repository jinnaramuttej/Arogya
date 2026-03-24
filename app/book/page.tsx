"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle, Star, Search, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import GlassCard from "@/components/ui/GlassCard";
import { useLanguage } from "@/lib/i18n/context";
import { t } from "@/lib/i18n/translations";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/hooks/useUser";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: string;
  slots: string[];
}

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

function BookContent() {
  const { lang } = useLanguage();
  const { user } = useUser();
  const [dbDoctors, setDbDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [fetchingDocs, setFetchingDocs] = useState(true);
  
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const searchParams = useSearchParams();

  /* Fetch doctors from Supabase on mount */
  useEffect(() => {
    const fetchDoctors = async () => {
      setFetchingDocs(true);
      const supabase = createClient();
      
      const { data, error: fetchError } = await supabase
        .from('doctors')
        .select('id, name, specialty')
        .order('name');
      
      if (!fetchError && data) {
        // Map DB doctors to include mock ratings and dummy time slots
        const formatted = data.map(d => ({
          id: d.id,
          name: `Dr. ${d.name}`,
          specialty: d.specialty,
          rating: (4.5 + Math.random() * 0.5).toFixed(1),
          slots: ["9:00 AM", "10:30 AM", "1:00 PM", "3:30 PM", "5:00 PM"]
        }));
        
        setDbDoctors(formatted);
        setFilteredDoctors(formatted);

        // Auto-select doctor when coming from /symptom with ?specialty=
        const specialtyParam = searchParams.get("specialty");
        if (specialtyParam) {
          const match = formatted.find(
            (d) => d.specialty.toLowerCase() === specialtyParam.toLowerCase()
          );
          if (match) setSelectedDoctor(match.id);
        }
      }
      setFetchingDocs(false);
    };
    
    fetchDoctors();
  }, [searchParams]);

  /* Handle Search Filtering */
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredDoctors(dbDoctors);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      setFilteredDoctors(dbDoctors.filter(d => 
        d.name.toLowerCase().includes(lowerQuery) || 
        d.specialty.toLowerCase().includes(lowerQuery)
      ));
    }
  }, [searchQuery, dbDoctors]);

  const handleBook = async () => {
    if (!selectedDoctor || !selectedSlot) return;
    if (!user) {
      setError("Please login to book an appointment.");
      return;
    }
    
    setLoading(true);
    setError(null);
    const supabase = createClient();
    
    const doc = dbDoctors.find((d) => d.id === selectedDoctor);
    if (!doc) return;

    // Generate YYYYMMDD0001 format
    // Generate YYYYMMDD prefix
    const todayStr = new Date().toISOString().split("T")[0];
    const yyyymmdd = todayStr.replace(/-/g, "");
    
    // Important: Replaced count() with a 4-digit random sequence to prevent 
    // duplicate "YYYYMMDD0001" constraint errors caused by RLS policies hiding other users' rows.
    const sequence = Math.floor(1000 + Math.random() * 9000).toString();
    const generatedBookingNumber = `${yyyymmdd}${sequence}`;

    // Try to insert the appointment
    const { error: insertError } = await supabase
      .from("appointments")
      .insert([
        {
          user_id: user.id,
          doctor_id: doc.id,
          doctor_name: doc.name,
          specialty: doc.specialty,
          date: new Date().toISOString().split("T")[0],
          time: selectedSlot,
          status: "pending",
          booking_number: generatedBookingNumber,
        },
      ]);

    setLoading(false);

    if (insertError) {
      // Handle the missing table gracefully
      if (insertError.message.includes('relation "public.appointments" does not exist') || insertError.message.includes('booking_number')) {
        setError("Database error: Run the updated appointments_schema.sql script as Admin.");
      } else {
        setError(insertError.message);
      }
    } else {
      setBookingId(generatedBookingNumber);
      setBooked(true);
      setTimeout(() => {
        setBooked(false);
        setBookingId(null);
      }, 15000); // Give them 15 seconds to read
      setSelectedDoctor(null);
      setSelectedSlot(null);
    }
  };

  return (
    <div className="px-4 sm:px-6 py-8 max-w-6xl mx-auto min-h-[80vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="text-3xl sm:text-4xl font-semibold text-white">
          {t("bookTitle", lang) || "Book an Appointment"}
        </h1>
        <p className="text-white/70 mt-2">
          {t("bookSubtitle", lang) || "Choose a doctor and pick a time that works for you."}
        </p>
      </motion.div>

      {/* Status Messages */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-rose-200 text-sm text-center"
        >
          {error}
        </motion.div>
      )}

      {booked && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-100 text-center shadow-[0_0_30px_rgba(16,185,129,0.15)]"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <CheckCircle className="w-6 h-6 flex-shrink-0 text-emerald-400" />
            <span className="font-bold text-lg">Appointment booked successfully!</span>
          </div>
          {bookingId && (
            <div className="bg-black/30 backdrop-blur-md inline-block px-8 py-4 rounded-xl border border-white/10 mt-2 shadow-inner">
              <p className="text-sm text-emerald-200/70 mb-1 uppercase tracking-wider font-semibold">Your Booking ID</p>
              <p className="text-3xl font-mono font-bold tracking-widest text-white">{bookingId}</p>
            </div>
          )}
          <p className="text-sm text-emerald-100/70 mt-4">Save this reference number. You can also view it in your dashboard.</p>
        </motion.div>
      )}

      {/* Search Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 max-w-2xl mx-auto"
      >
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-accent-light transition-colors" />
          <input
            type="text"
            placeholder="Search doctors by name or specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent-light focus:border-transparent transition-all backdrop-blur-md shadow-lg"
          />
        </div>
      </motion.div>

      {/* Doctor Grid */}
      {fetchingDocs ? (
        <div className="flex flex-col items-center justify-center py-20 text-white/60">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-accent" />
          <p>Finding available doctors within our network...</p>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="text-center py-20 text-white/60 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm p-8 max-w-lg mx-auto">
          <p className="text-xl mb-2">No doctors found matching "{searchQuery}"</p>
          <p className="text-sm opacity-70 mb-6">Try searching by a different name or specialty category.</p>
          <button 
            onClick={() => setSearchQuery("")} 
            className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium"
          >
            Clear Search Filter
          </button>
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {filteredDoctors.map((doc) => {
            const isSelected = selectedDoctor === doc.id;
            return (
              <motion.div key={doc.id} variants={item}>
                <GlassCard
                  noHover={isSelected}
                  className={`cursor-pointer overflow-hidden transition-all duration-300 ${
                    isSelected ? "!border-accent-lighter !shadow-[0_0_30px_rgba(59,130,246,0.2)] bg-white/10" : ""
                  }`}
                  onClick={() => {
                    setSelectedDoctor(doc.id);
                    setSelectedSlot(null);
                  }}
                >
                  {/* Doctor Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-white tracking-tight">{doc.name}</h3>
                      <p className="text-accent-light bg-accent/10 px-3 py-1 rounded-full text-xs font-medium inline-block mt-2 border border-accent/20">
                        {doc.specialty}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-yellow-400 text-sm font-bold bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/5">
                      <Star className="w-4 h-4 fill-current" />
                      {doc.rating}
                    </div>
                  </div>

                  {/* Booking Slots Drawer */}
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-6 pt-5 border-t border-white/10"
                    >
                      <p className="text-white/80 text-sm font-medium mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-accent-light" />
                        Select Available Time
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {doc.slots.map((slot) => (
                          <button
                            key={slot}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSlot(slot);
                            }}
                            className={`px-4 py-2.5 rounded-xl text-sm border transition-all cursor-pointer font-medium ${
                              selectedSlot === slot
                                ? "bg-gradient-to-br from-accent-light to-accent text-white border-transparent shadow-[0_4px_15px_rgba(59,130,246,0.4)] transform scale-[1.02]"
                                : "bg-white/5 text-white/80 border-white/10 hover:bg-white/10 hover:border-white/20"
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                      
                      {selectedSlot && (
                        <motion.button
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBook();
                          }}
                          disabled={loading}
                          className="mt-6 w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_25px_rgba(16,185,129,0.5)] transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {loading ? <><Loader2 className="w-5 h-5 animate-spin"/> Processing...</> : "Confirm Appointment"}
                        </motion.button>
                      )}
                    </motion.div>
                  )}
                </GlassCard>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-white/10 border-t-accent-light rounded-full animate-spin" />
        <p className="text-white/60 font-medium">Preparing booking portal...</p>
      </div>
    }>
      <BookContent />
    </Suspense>
  );
}

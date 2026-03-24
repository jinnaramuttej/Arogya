"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle, Star } from "lucide-react";
import { useSearchParams } from "next/navigation";
import GlassCard from "@/components/ui/GlassCard";
import { useLanguage } from "@/lib/i18n/context";
import { t } from "@/lib/i18n/translations";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/hooks/useUser";

/* Mock doctor data — in production this comes from Supabase */
const doctors = [
  {
    id: "1",
    name: "Dr. Priya Sharma",
    specialty: "General Physician",
    rating: 4.8,
    slots: ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM"],
  },
  {
    id: "2",
    name: "Dr. Ravi Kumar",
    specialty: "Cardiologist",
    rating: 4.9,
    slots: ["10:30 AM", "11:30 AM", "1:00 PM", "4:00 PM"],
  },
  {
    id: "3",
    name: "Dr. Ananya Reddy",
    specialty: "Dermatologist",
    rating: 4.7,
    slots: ["9:30 AM", "12:00 PM", "2:30 PM", "5:00 PM"],
  },
  {
    id: "4",
    name: "Dr. Vikram Patel",
    specialty: "Orthopedic Surgeon",
    rating: 4.6,
    slots: ["8:00 AM", "10:00 AM", "1:00 PM", "3:30 PM"],
  },
];

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function BookPage() {
  const { lang } = useLanguage();
  const { user } = useUser();
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  /* Auto-select doctor when coming from /symptom with ?specialty= */
  useEffect(() => {
    const specialty = searchParams.get("specialty");
    if (specialty) {
      const match = doctors.find(
        (d) => d.specialty.toLowerCase() === specialty.toLowerCase()
      );
      if (match) setSelectedDoctor(match.id);
    }
  }, [searchParams]);

  const handleBook = async () => {
    if (!selectedDoctor || !selectedSlot) return;
    if (!user) {
      setError("Please login to book an appointment.");
      return;
    }
    
    setLoading(true);
    setError(null);
    const supabase = createClient();
    
    const doc = doctors.find((d) => d.id === selectedDoctor);
    if (!doc) return;

    const { data: _data, error: insertError } = await supabase
      .from("appointments")
      .insert([
        {
          user_id: user.id,
          doctor_name: doc.name,
          specialty: doc.specialty,
          date: new Date().toISOString().split("T")[0],
          time: selectedSlot,
          status: "pending",
        },
      ]);

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
    } else {
      setBooked(true);
      setTimeout(() => setBooked(false), 3000);
      setSelectedDoctor(null);
      setSelectedSlot(null);
    }
  };

  return (
    <div className="px-4 sm:px-6 py-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="text-3xl sm:text-4xl font-semibold text-white">
          {t("bookTitle", lang)}
        </h1>
        <p className="text-white/70 mt-2">{t("bookSubtitle", lang)}</p>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-danger/20 border border-danger/30 text-danger-light text-sm text-center"
        >
          {error}
        </motion.div>
      )}

      {booked && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-success/20 border border-success/30 text-success-light text-sm text-center flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-5 h-5" />
          Appointment booked successfully!
        </motion.div>
      )}

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {doctors.map((doc) => {
          const isSelected = selectedDoctor === doc.id;
          return (
            <motion.div key={doc.id} variants={item}>
              <GlassCard
                noHover={isSelected}
                className={`cursor-pointer ${
                  isSelected ? "!border-accent-lighter !shadow-glass-hover" : ""
                }`}
                onClick={() => {
                  setSelectedDoctor(doc.id);
                  setSelectedSlot(null);
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{doc.name}</h3>
                    <p className="text-white/60 text-sm">{doc.specialty}</p>
                  </div>
                  <div className="flex items-center gap-1 text-warning-light text-sm">
                    <Star className="w-4 h-4 fill-current" />
                    {doc.rating}
                  </div>
                </div>

                {/* Slots */}
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 pt-4 border-t border-glass-border"
                  >
                    <p className="text-white/70 text-sm mb-3">{t("selectSlot", lang)}</p>
                    <div className="flex flex-wrap gap-2">
                      {doc.slots.map((slot) => (
                        <button
                          key={slot}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSlot(slot);
                          }}
                          className={`px-4 py-2 rounded-full text-sm border transition-all cursor-pointer ${
                            selectedSlot === slot
                              ? "bg-accent text-white border-accent shadow-accent"
                              : "bg-white/5 text-white/80 border-glass-border hover:bg-white/10"
                          }`}
                        >
                          <Clock className="w-3 h-3 inline mr-1" />
                          {slot}
                        </button>
                      ))}
                    </div>
                    {selectedSlot && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBook();
                        }}
                        disabled={loading}
                        className="mt-4 w-full py-3 rounded-full bg-gradient-to-r from-accent-light to-accent text-white font-semibold shadow-accent hover:shadow-accent-hover hover:-translate-y-0.5 transition-all cursor-pointer border-none disabled:opacity-50"
                      >
                        {loading ? "Booking..." : t("confirmBooking", lang)}
                      </button>
                    )}
                  </motion.div>
                )}
              </GlassCard>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

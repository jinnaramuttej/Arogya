"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle, Star, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import GlassCard from "@/components/ui/GlassCard";
import { useLanguage } from "@/lib/i18n/context";
import { t } from "@/lib/i18n/translations";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/hooks/useUser";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating?: number;
}

/* Default time slots for booking */
const DEFAULT_SLOTS = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"];

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

function BookContent() {
  const { lang } = useLanguage();
  const { user } = useUser();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  /* Fetch real doctors from Supabase */
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoadingDoctors(true);
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from("doctors")
        .select("id, name, specialty")
        .order("name");

      if (fetchError) {
        setError("Failed to load doctors: " + fetchError.message);
      } else if (data) {
        // Add a pseudo-random rating for display based on the name hash
        const enriched = data.map((doc) => ({
          ...doc,
          rating: parseFloat((4.5 + ((doc.name.charCodeAt(0) % 5) / 10)).toFixed(1)),
        }));
        setDoctors(enriched);
      }
      setLoadingDoctors(false);
    };
    fetchDoctors();
  }, []);

  /* Auto-select doctor when coming from /symptom with ?specialty= */
  useEffect(() => {
    if (doctors.length === 0) return;
    const specialty = searchParams.get("specialty");
    if (specialty) {
      const match = doctors.find(
        (d) => d.specialty.toLowerCase() === specialty.toLowerCase()
      );
      if (match) setSelectedDoctor(match.id);
    }
  }, [searchParams, doctors]);

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

    // Generate a booking number: YYYYMMDD + 4 random digits
    const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
    const randomSuffix = String(Math.floor(1000 + Math.random() * 9000));
    const bookingNumber = today + randomSuffix;

    const { error: insertError } = await supabase
      .from("appointments")
      .insert([
        {
          user_id: user.id,
          doctor_id: doc.id,
          doctor_name: `Dr. ${doc.name}`,
          specialty: doc.specialty,
          date: new Date().toISOString().split("T")[0],
          time: selectedSlot,
          status: "pending",
          booking_number: bookingNumber,
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
        <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 dark:text-white">
          {t("bookTitle", lang)}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{t("bookSubtitle", lang)}</p>
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

      {loadingDoctors ? (
        <div className="flex items-center justify-center py-20 text-gray-400 gap-3">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg">Loading doctors...</span>
        </div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg font-medium">No doctors available.</p>
          <p className="text-sm mt-1">Please ask an admin to register doctors first.</p>
        </div>
      ) : (
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
                    isSelected ? "!border-red-400 !shadow-card-hover" : ""
                  }`}
                  onClick={() => {
                    setSelectedDoctor(doc.id);
                    setSelectedSlot(null);
                  }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Dr. {doc.name}</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">{doc.specialty}</p>
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
                      className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600"
                    >
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{t("selectSlot", lang)}</p>
                      <div className="flex flex-wrap gap-2">
                        {DEFAULT_SLOTS.map((slot) => (
                          <button
                            key={slot}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSlot(slot);
                            }}
                            className={`px-4 py-2 rounded-full text-sm border transition-all cursor-pointer ${
                              selectedSlot === slot
                                ? "bg-red-600 text-white border-red-600 shadow-brand"
                                : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
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
                          className="mt-4 w-full py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold shadow-brand hover:shadow-brand-hover hover:-translate-y-0.5 transition-all cursor-pointer border-none disabled:opacity-50"
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
      )}
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 max-w-7xl mx-auto flex items-center justify-center"><div className="w-10 h-10 border-2 border-accent-lighter border-t-transparent rounded-full animate-spin" /></div>}>
      <BookContent />
    </Suspense>
  );
}

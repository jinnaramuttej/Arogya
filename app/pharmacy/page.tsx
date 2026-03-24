"use client";

import { useLanguage } from "@/lib/i18n/context";
import PrescriptionForm from "@/components/features/PrescriptionForm";
import { useUser } from "@/lib/hooks/useUser";

export default function PharmacyPage() {
  const { lang } = useLanguage();
  const { user } = useUser();

  const handleSaved = () => {
    alert(lang === "en" ? "Prescription submitted to pharmacy!" : "Medicines ordered!");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 min-h-[70vh]">
      <h1 className="mb-2 text-center text-3xl font-semibold text-gray-900 dark:text-white">
        Pharmacy
      </h1>
      <p className="mb-10 text-center text-gray-500 dark:text-gray-400">
        Upload your prescription down below to order medicines directly from our affiliated pharmacies.
      </p>
      
      {user ? (
          <PrescriptionForm userId={user.id} onSaved={handleSaved} />
      ) : (
          <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
             <p className="text-gray-600 dark:text-gray-300">Please log in to use the Pharmacy services.</p>
          </div>
      )}
    </div>
  );
}

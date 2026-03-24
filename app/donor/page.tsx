"use client";

import { useState } from "react";
import { Droplet, HeartPulse } from "lucide-react";
import DonorForm from "@/components/features/DonorForm";
import DonorList from "@/components/features/DonorList";
import { useLanguage } from "@/lib/i18n/context";
import { t } from "@/lib/i18n/translations";

export default function DonorPage() {
  const { lang } = useLanguage();
  const [donorTab, setDonorTab] = useState<"find" | "register">("find");

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 min-h-[70vh]">
      <section>
        <h1 className="mb-2 text-center text-3xl font-semibold text-gray-900 dark:text-white">
          {t("bloodDonorTitle", lang)}
        </h1>
        <p className="mb-10 text-center text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          {t("bloodDonorSubtitle", lang)}
        </p>

        <div className="mb-8 flex justify-center gap-3">
          <button
            onClick={() => setDonorTab("find")}
            className={`flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all cursor-pointer border ${
              donorTab === "find"
                ? "bg-danger text-white border-danger shadow-danger"
                : "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
            }`}
          >
            <Droplet className="h-5 w-5" />
            {t("findDonor", lang)}
          </button>
          <button
            onClick={() => setDonorTab("register")}
            className={`flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all cursor-pointer border ${
              donorTab === "register"
                ? "bg-danger text-white border-danger shadow-danger"
                : "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
            }`}
          >
            <HeartPulse className="h-5 w-5" />
            {t("registerDonor", lang)}
          </button>
        </div>

        {donorTab === "find" ? <DonorList /> : <DonorForm />}
      </section>
    </div>
  );
}

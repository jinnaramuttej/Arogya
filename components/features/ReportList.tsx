"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FileText, ExternalLink, Loader2 } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { useLanguage } from "@/lib/i18n/context";
import { t } from "@/lib/i18n/translations";
import { createClient } from "@/lib/supabase/client";

interface Report {
  id: string;
  file_name: string;
  file_url: string;
  created_at: string;
}

interface ReportListProps {
  userId: string;
  refreshKey: number;
}

export default function ReportList({ userId, refreshKey }: ReportListProps) {
  const { lang } = useLanguage();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error: fetchError } = await supabase
      .from("reports")
      .select("*")
      .eq("patient_id", userId)
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setReports((data as Report[]) || []);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports, refreshKey]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 text-accent-lighter animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-danger/20 border border-danger/30 text-danger-light text-sm text-center">
        {error}
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <GlassCard noHover className="text-center py-10">
        <FileText className="w-10 h-10 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">{t("noReports", lang)}</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-3">
      {reports.map((report, idx) => {
        const date = new Date(report.created_at).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

        return (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <GlassCard noHover>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 shrink-0">
                    <FileText className="w-5 h-5 text-accent-lighter" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-900 dark:text-white font-medium text-sm truncate">{report.file_name}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">{date}</p>
                  </div>
                </div>
                <a
                  href={report.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent/15 text-accent-lighter text-xs font-medium no-underline hover:bg-accent/25 transition-colors shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {t("viewReport", lang)}
                </a>
              </div>
            </GlassCard>
          </motion.div>
        );
      })}
    </div>
  );
}

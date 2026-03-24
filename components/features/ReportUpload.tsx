"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, Loader2, CheckCircle, FileUp } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { useLanguage } from "@/lib/i18n/context";
import { t } from "@/lib/i18n/translations";
import { createClient } from "@/lib/supabase/client";

interface ReportUploadProps {
  userId: string;
  onUploaded: () => void;
}

export default function ReportUpload({ userId, onUploaded }: ReportUploadProps) {
  const { lang } = useLanguage();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    setFileName(file.name);

    const supabase = createClient();
    const filePath = `${userId}/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("reports")
      .upload(filePath, file);

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("reports")
      .getPublicUrl(filePath);

    const { error: insertError } = await supabase.from("reports").insert([
      {
        patient_id: userId,
        file_name: file.name,
        file_url: urlData.publicUrl,
      },
    ]);

    if (insertError) {
      setError(insertError.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFileName(null);
        onUploaded();
      }, 2000);
    }
    setUploading(false);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <GlassCard noHover className="text-center py-6">
          <CheckCircle className="w-8 h-8 text-success-light mx-auto mb-2" />
          <p className="text-success-light font-semibold text-sm">{t("uploadSuccess", lang)}</p>
        </GlassCard>
      </motion.div>
    );
  }

  return (
    <GlassCard noHover>
      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        onChange={onFileChange}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="w-full flex flex-col items-center gap-3 py-6 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50"
      >
        {uploading ? (
          <>
            <Loader2 className="w-8 h-8 animate-spin text-red-500" />
            <span className="text-sm">{fileName}</span>
          </>
        ) : (
          <>
            <FileUp className="w-8 h-8" />
            <span className="text-sm font-medium">{t("uploadReport", lang)}</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">PDF, JPG, PNG (max 10MB)</span>
          </>
        )}
      </button>

      {error && (
        <div className="mt-3 p-3 rounded-xl bg-danger/20 border border-danger/30 text-danger-light text-sm text-center">
          {error}
        </div>
      )}
    </GlassCard>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Loader2, Upload, Bot, User } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import VoiceInput from "@/components/features/VoiceInput";
import { useLanguage } from "@/lib/i18n/context";
import { t } from "@/lib/i18n/translations";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/hooks/useUser";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface SymptomChatProps {
  initialContext: string;
  onSpeaking: (speaking: boolean) => void;
}

export default function SymptomChat({ initialContext, onSpeaking }: SymptomChatProps) {
  const { lang } = useLanguage();
  const { user } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: initialContext },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || sending) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setSending(true);
    onSpeaking(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "chat",
          messages: updatedMessages,
          language: lang,
        }),
      });

      const responseText = await res.text();
      setMessages((prev) => [...prev, { role: "assistant", content: responseText }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't process that. Please try again." },
      ]);
    }

    onSpeaking(false);
    setSending(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleVoice = (transcript: string) => {
    sendMessage(transcript);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    onSpeaking(true);

    try {
      // Upload to Supabase Storage
      const supabase = createClient();
      const filePath = `${user?.id || "anon"}/${Date.now()}_${file.name}`;

      await supabase.storage.from("reports").upload(filePath, file);
      const { data: urlData } = supabase.storage.from("reports").getPublicUrl(filePath);

      // Save to reports table if user is logged in
      if (user) {
        await supabase.from("reports").insert([
          {
            patient_id: user.id,
            file_name: file.name,
            file_url: urlData.publicUrl,
          },
        ]);
      }

      // Send to AI for analysis
      setMessages((prev) => [
        ...prev,
        { role: "user", content: `📄 Uploaded: ${file.name}` },
      ]);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "file",
          fileText: `File uploaded: ${file.name} (${file.type}). This is a medical report. Please provide a general analysis based on the file name and type. The file has been saved to the patient's health records.`,
          language: lang,
        }),
      });

      const responseText = await res.text();
      setMessages((prev) => [...prev, { role: "assistant", content: responseText }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Failed to upload file. Please try again." },
      ]);
    }

    onSpeaking(false);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="flex flex-col h-full min-h-[400px]">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[500px] mb-4">
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/20 shrink-0 mt-1">
                <Bot className="w-3.5 h-3.5 text-accent-lighter" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-brand-50 text-brand-900 border border-brand-200 dark:bg-brand-900/30 dark:text-brand-100 dark:border-brand-800"
                  : "bg-gray-50 text-gray-800 border border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
              }`}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 shrink-0 mt-1">
                <User className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
              </div>
            )}
          </motion.div>
        ))}

        {sending && (
          <div className="flex gap-2.5 items-center">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/20 shrink-0">
              <Bot className="w-3.5 h-3.5 text-accent-lighter" />
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3">
              <Loader2 className="w-4 h-4 text-accent-lighter animate-spin" />
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading || sending}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer shrink-0 disabled:opacity-40"
          title={t("uploadReport", lang)}
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
        </button>

        <VoiceInput onTranscript={handleVoice} disabled={sending} />

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("chatPlaceholder", lang)}
          disabled={sending}
          className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2.5 text-gray-900 dark:text-white text-sm outline-none placeholder-gray-400 dark:placeholder-gray-500 focus:border-brand-500 transition-colors disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white cursor-pointer border-none transition-all hover:shadow-accent disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

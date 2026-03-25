"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Mic, MicOff, Send, Loader2, Volume2, VolumeX } from "lucide-react";
import { useRouter } from "next/navigation";
import { getAIResponse, Message } from "@/lib/ai-service";
import { useLanguage } from "@/lib/context/LanguageContext";
import { toast } from "@/components/ui/sonner";

// Page navigation map — AI can say "Taking you to Store" and we redirect
const NAV_MAP: Record<string, string> = {
  store: "/prescription",
  pharmacy: "/prescription",
  dashboard: "/dashboard",
  symptom: "/symptom",
  symptoms: "/symptom",
  emergency: "/ambulance",
  sos: "/ambulance",
  ambulance: "/ambulance",
  blood: "/blood",
  donor: "/blood",
  records: "/records",
  profile: "/dashboard/settings",
  home: "/",
};

export default function FloatingAIBot() {
  const router = useRouter();
  const { language: globalLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm Arogya AI 👋 Describe your symptoms or ask me anything." },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<Message[]>([]);
  const handleVoiceInputRef = useRef<(t: string) => void>(() => {});
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  const getBotLang = (code: string) => {
    if (code === "hi") return "Hindi";
    if (code === "te") return "Telugu";
    return "English";
  };

  // Keep messagesRef in sync
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  // Preload voices
  useEffect(() => {
    const load = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length) voicesRef.current = v;
    };
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, []);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // Detect navigation intent in AI response
  const checkNavigation = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes("taking you to")) {
      for (const [keyword, path] of Object.entries(NAV_MAP)) {
        if (lower.includes(keyword)) {
          setTimeout(() => router.push(path), 800);
          break;
        }
      }
    }
  };

  const speak = (text: string, force = false) => {
    if (!autoSpeak && !force) return;
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const clean = text
      .replace(/[\u{1F000}-\u{1FFFF}]/gu, "")
      .replace(/[💊🏥👨‍⚕️🛒✅🔍⚠️]/gu, "")
      .replace(/\*+/g, "")
      .trim();
    if (!clean) return;

    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();

    const doSpeak = (voices: SpeechSynthesisVoice[]) => {
      const utterance = new SpeechSynthesisUtterance(clean);
      const langMap: Record<string, string> = { English: "en-IN", Hindi: "hi-IN", Telugu: "te-IN" };
      utterance.lang = langMap[getBotLang(globalLang)] || "en-IN";
      utterance.rate = 1.05;
      utterance.volume = 1;
      const voice = voices.find(v => v.lang.startsWith(utterance.lang.split("-")[0]))
        ?? voices.find(v => v.lang.startsWith("en"))
        ?? voices[0];
      if (voice) utterance.voice = voice;
      const ka = setInterval(() => {
        if (window.speechSynthesis.speaking) window.speechSynthesis.resume();
        else clearInterval(ka);
      }, 5000);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => { setIsSpeaking(false); clearInterval(ka); };
      utterance.onerror = () => { setIsSpeaking(false); clearInterval(ka); };
      window.speechSynthesis.speak(utterance);
    };

    const voices = voicesRef.current.length ? voicesRef.current : window.speechSynthesis.getVoices();
    if (voices.length) doSpeak(voices);
    else {
      const h = () => { voicesRef.current = window.speechSynthesis.getVoices(); doSpeak(voicesRef.current); window.speechSynthesis.removeEventListener("voiceschanged", h); };
      window.speechSynthesis.addEventListener("voiceschanged", h);
    }
  };

  const sendMessage = async (text: string, forceSpeak = false) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    messagesRef.current = [...messagesRef.current, userMsg];
    setInput("");
    setIsLoading(true);

    const reply = await getAIResponse(messagesRef.current, getBotLang(globalLang));
    setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    checkNavigation(reply);
    speak(reply, forceSpeak);
    setIsLoading(false);
  };

  // Voice input
  const startMic = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast.error("Voice not supported. Use Chrome or Edge."); return; }
    if (isRecording) return;

    const rec = new SR();
    const langMap: Record<string, string> = { English: "en-IN", Hindi: "hi-IN", Telugu: "te-IN" };
    rec.lang = langMap[getBotLang(globalLang)] || "en-IN";
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onstart = () => { setIsRecording(true); if (!open) setOpen(true); toast.info("🎙️ Listening..."); };
    rec.onend = () => setIsRecording(false);
    rec.onresult = (e: any) => {
      let interim = "", final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      setInput(final || interim);
      if (final) handleVoiceInputRef.current(final);
    };
    rec.onerror = (e: any) => {
      setIsRecording(false);
      const msgs: Record<string, string> = {
        "not-allowed": "🎙️ Mic permission denied. Allow it in browser settings.",
        "no-speech": "No speech detected.",
        "network": "Network error during voice input.",
      };
      toast.error(msgs[e.error] || `Mic error: ${e.error}`);
    };

    try { rec.start(); } catch { setIsRecording(false); }
  };

  const handleVoiceInput = (transcript: string) => {
    sendMessage(transcript, true);
  };
  handleVoiceInputRef.current = handleVoiceInput;

  return (
    <>
      {/* Floating buttons */}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col items-center gap-2">
        {/* Mic button (on top) */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={startMic}
          title="Voice command"
          className={`w-11 h-11 rounded-full shadow-lg flex items-center justify-center transition-all ${
            isRecording
              ? "bg-red-500 text-white animate-pulse shadow-red-500/50 shadow-[0_0_20px]"
              : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary hover:text-white hover:border-primary"
          }`}
        >
          {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </motion.button>

        {/* Bot button (launcher) */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setOpen(v => !v)}
          title="Arogya AI"
          className="w-14 h-14 rounded-full bg-primary text-white shadow-xl shadow-primary/40 flex items-center justify-center relative"
        >
          <AnimatePresence mode="wait">
            {open ? (
              <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <X className="w-6 h-6" />
              </motion.span>
            ) : (
              <motion.span key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <Bot className="w-6 h-6" />
              </motion.span>
            )}
          </AnimatePresence>
          {/* Speaking indicator */}
          {isSpeaking && (
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          )}
        </motion.button>
      </div>

      {/* Chat popup */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-28 right-6 z-[199] w-80 sm:w-96 rounded-2xl shadow-2xl overflow-hidden border border-border/60 bg-card"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-primary text-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold leading-none">Arogya AI</p>
                  <p className="text-[10px] text-white/70 mt-0.5">
                    {isSpeaking ? "🔊 Speaking..." : isLoading ? "Thinking..." : "Online"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAutoSpeak(v => !v)}
                className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition"
                title={autoSpeak ? "Mute" : "Unmute"}
              >
                {autoSpeak ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Messages */}
            <div className="h-72 overflow-y-auto p-3 space-y-3 bg-muted/20">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-white rounded-tr-none"
                      : "bg-card border border-border/50 text-foreground rounded-tl-none"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-card border border-border/50 rounded-xl rounded-tl-none px-3 py-2 flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border/50 bg-card">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMessage(input)}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-muted/40 rounded-xl px-3 py-2 text-xs outline-none border border-border/40 focus:border-primary/50 transition"
                  disabled={isLoading}
                />
                <button
                  onClick={startMic}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${
                    isRecording ? "bg-red-500 text-white animate-pulse" : "bg-muted hover:bg-primary hover:text-white text-muted-foreground"
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isLoading}
                  className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-40 hover:bg-primary/90 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

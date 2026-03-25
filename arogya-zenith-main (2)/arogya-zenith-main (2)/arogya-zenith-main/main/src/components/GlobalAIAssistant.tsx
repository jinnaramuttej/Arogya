import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Mic, Send, Bot, Headset, Volume2, VolumeX, Navigation } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { getAIResponse } from "@/lib/ai-service";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const GlobalAIAssistant = () => {
  const { t, language: globalLang } = useLanguage();
  
  const getBotLang = (code: string) => {
    if (code === "hi") return "Hindi";
    if (code === "te") return "Telugu";
    return "English";
  };

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: t("bot_initial_msg") || "Hello! I'm your AI health assistant. Let me know your symptoms or ask me anything." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation mapping
  const routes: Record<string, string> = {
    "dashboard": "/patient-dashboard",
    "home": "/",
    "store": "/store",
    "medicine": "/store",
    "symptoms": "/symptoms",
    "checker": "/symptoms",
    "sos": "/ambulance",
    "emergency": "/ambulance",
    "ambulance": "/ambulance",
    "blood": "/blood",
    "records": "/records",
    "history": "/records",
    "cart": "/cart",
    "profile": "/profile",
    "about": "/about"
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const speak = (text: string) => {
    if (!autoSpeak) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Auto-detect language (simple heuristic for Hindi and Telugu)
    const isHindi = /[\u0900-\u097F]/.test(text);
    const isTelugu = /[\u0C00-\u0C7F]/.test(text);
    
    // Default to the global language if no specific script is detected, else follow the detected scripts
    let targetLang = "en-US";
    if (isTelugu) targetLang = "te-IN";
    else if (isHindi) targetLang = "hi-IN";
    else if (globalLang === "hi") targetLang = "hi-IN";
    else if (globalLang === "te") targetLang = "te-IN";
    
    utterance.lang = targetLang;
    
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith(targetLang));
    if (voice) utterance.voice = voice;
    
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setIsOpen(true); // Auto-open chat to show progress

    // Simple voice command parsing
    const lowerText = text.toLowerCase();
    if (lowerText.includes("go to") || lowerText.includes("take me to") || lowerText.includes("open")) {
      for (const [key, path] of Object.entries(routes)) {
        if (lowerText.includes(key)) {
          const confirmationTemplate = t("global_ai_nav_msg") || "Sure! Taking you to the {0} page.";
          const confirmation = confirmationTemplate.replace("{0}", key);
          setMessages(prev => [...prev, { role: "assistant", content: confirmation }]);
          speak(confirmation);
          setTimeout(() => navigate(path), 1500);
          setIsLoading(false);
          return;
        }
      }
    }

    try {
      const response = await getAIResponse([...messages, userMessage], getBotLang(globalLang));
      const assistantMessage: Message = { role: "assistant", content: response };
      setMessages(prev => [...prev, assistantMessage]);
      speak(response);
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: t("global_ai_error") || "Sorry, I'm having trouble connecting to my neural network right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    const langMapRecognition: Record<string, string> = {
      "en": "en-IN",
      "hi": "hi-IN",
      "te": "te-IN"
    };
    recognition.lang = langMapRecognition[globalLang] || "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSend(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.8 }}
            className="mb-4 w-[380px] h-[550px] bg-[#1a1c1e] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">{t("bot_header_title") || "AI Health Assistant"}</h3>
                  <p className="text-white/70 text-[10px]">{t("global_ai_powered") || "Powered by OpenRouter AI"}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
                title="Close Assistant"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Chat Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide"
            >
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    m.role === "user" 
                      ? "bg-primary text-primary-foreground rounded-tr-none" 
                      : "bg-[#2d2f31] text-white border border-white/5 rounded-tl-none shadow-lg"
                  }`}>
                    {m.role === "assistant" && (
                      <p className="text-[10px] font-bold text-primary mb-1 uppercase tracking-widest">{t("bot_header_title") || "AI Assistant"}</p>
                    )}
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#2d2f31] p-3 rounded-2xl rounded-tl-none border border-white/5">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#1e2022] border-t border-white/5">
              <div className="relative flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={t("global_ai_placeholder") || "Ask me anything about health..."}
                  className="flex-1 bg-[#2d2f31] border-none rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:ring-2 focus:ring-primary outline-none"
                  title={t("global_ai_placeholder") || "Ask me anything about health..."}
                />
                <button
                  onClick={startListening}
                  className={`p-3 rounded-xl transition-all ${
                    isListening ? "bg-red-500 text-white animate-pulse" : "bg-[#2d2f31] text-gray-400 hover:text-white"
                  }`}
                  title="Voice input"
                >
                  <Mic className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="p-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 disabled:opacity-50 transition-all"
                  title={t("chat_send_btn")}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-[10px] text-gray-500">{t("global_ai_footer") || "Press Enter to send or click mic for voice"}</p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSpeak}
                    onChange={(e) => setAutoSpeak(e.target.checked)}
                    className="w-3 h-3 rounded bg-zinc-800 border-zinc-700 text-primary focus:ring-primary"
                  />
                  <span className="text-[10px] text-gray-400">{t("global_ai_autospeak") || "Auto-speak responses"}</span>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col items-center gap-3">
        <button
          onClick={startListening}
          className={`h-14 w-14 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${
            isListening ? "bg-red-500 text-white animate-pulse" : "bg-white text-primary hover:bg-white/90"
          }`}
          title="Voice Command"
        >
          <Mic className="w-7 h-7" />
        </button>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="h-16 w-16 rounded-full bg-gradient-to-tr from-[#6366f1] to-[#8b5cf6] text-white shadow-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 group"
        >
          {isOpen ? (
            <X className="w-8 h-8" />
          ) : (
            <Bot className="w-9 h-9 group-hover:rotate-12 transition-transform" />
          )}
        </button>
      </div>
    </div>
  );
};

export default GlobalAIAssistant;

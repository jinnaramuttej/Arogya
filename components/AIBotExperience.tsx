import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, User, Mic, Paperclip, Send, Languages, History, X, Loader2, Volume2, VolumeX } from "lucide-react";
import { getAIResponse, Message } from "@/lib/ai-service";
import { useLanguage } from "@/lib/context/LanguageContext";
import { toast } from "@/components/ui/sonner";

const AIBotExperience = () => {
  const { language: globalLang, t } = useLanguage();
  const [localLanguage, setLocalLanguage] = useState<string>(globalLang);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const searchParams = useSearchParams();
  const analysisTargetStr = searchParams.get("analyzeData");
  const analysisTarget = analysisTargetStr ? JSON.parse(decodeURIComponent(analysisTargetStr)) : null;
  
  // Mapping globalLang "en"|"hi"|"te" to Bot friendly "English"|"Hindi"|"Telugu"
  const getBotLang = (code: string) => {
    if (code === "hi") return "Hindi";
    if (code === "te") return "Telugu";
    return "English";
  };

  const langDisplay: Record<string, string> = {
    en: "English",
    hi: "Hindi",
    te: "Telugu"
  };

  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: t("bot_initial_msg") || "Hello! I am Arogya's AI assistant. Please describe your symptoms or upload a medical report for analysis." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const speak = (text: string, force: boolean = false) => {
    if (!autoSpeak && !force) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Auto-detect language (Hindi/Telugu scripts) or use local selection
    const isHindi = /[\u0900-\u097F]/.test(text);
    const isTelugu = /[\u0C00-\u0C7F]/.test(text);
    
    const langMap: Record<string, string> = {
      "English": "en-US",
      "Hindi": "hi-IN",
      "Telugu": "te-IN"
    };
    
    let targetLang = "en-US";
    if (isTelugu) targetLang = "te-IN";
    else if (isHindi) targetLang = "hi-IN";
    else targetLang = langMap[getBotLang(localLanguage)] || "en-US";
    
    utterance.lang = targetLang;
    
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith(targetLang));
    if (voice) utterance.voice = voice;
    
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (analysisTarget) {
      const targetName = analysisTarget.name || analysisTarget.medicine || "Medical Record";
      const analyzeMsg: Message = { 
        role: "user", 
        content: `Analyzing health data: ${targetName}. Please provide a clinical summary and recommendations based on this record.` 
      };
      setMessages(prev => [...prev, analyzeMsg]);
      handleAIResponse(analyzeMsg);
      toast.success(`Analyzing ${targetName}...`);
    }
  }, [analysisTarget]);

  const handleSend = async (overrideText?: string) => {
    const textToSend = typeof overrideText === "string" ? overrideText : input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    // Ensure the AI actually speaks the response
    const botResponse = await getAIResponse([...messages, userMessage], getBotLang(localLanguage));
    setMessages(prev => [...prev, { role: "assistant", content: botResponse }]);
    speak(botResponse);
    setIsLoading(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.success(`Analyzing ${file.name}...`);
      setTimeout(() => {
        const analyzeMsg: Message = { role: "user", content: `Please analyze this medical report: ${file.name}` };
        setMessages(prev => [...prev, analyzeMsg]);
        handleAIResponse(analyzeMsg);
      }, 1000);
    }
  };

  const handleAIResponse = async (userMsg: Message) => {
    setIsLoading(true);
    const botResponse = await getAIResponse([...messages, userMsg], getBotLang(localLanguage));
    setMessages(prev => [...prev, { role: "assistant", content: botResponse }]);
    speak(botResponse);
    setIsLoading(false);
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    // Default to a broad Indian locale if possible, or use the selected language
    const langMap: Record<string, string> = {
      "English": "en-IN",
      "Hindi": "hi-IN",
      "Bengali": "bn-IN",
      "Telugu": "te-IN"
    };
    recognition.lang = langMap[getBotLang(localLanguage)] || "en-IN";
    
    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSend(transcript);
    };
    recognition.start();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[600px] w-full max-w-7xl mx-auto">
      {/* 3D Bot View */}
      <div className="flex-1 rounded-[2.5rem] overflow-hidden border border-border/60 bg-black/5 min-h-[400px] relative group shadow-2xl">
        <iframe 
          src='https://my.spline.design/nancylookingaround-kgZLY8E1RpIQAbnTseZxSBNm/' 
          frameBorder='0' 
          width='100%' 
          height='100%'
          className="w-full h-full"
          title="Arogya AI 3D Model"
        />
        <div className="absolute bottom-6 left-6 right-6">
           <div className="glass p-4 rounded-2xl flex items-center gap-3 backdrop-blur-md bg-white/10 border-white/20">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <p className="text-xs font-bold text-white uppercase tracking-widest leading-none">{t("bot_unit_live") || "AI Neural Unit Live"}</p>
            </div>
         </div>
      </div>

      {/* Chat Interface */}
      <div className="lg:w-[500px] flex flex-col rounded-[2.5rem] border border-border/60 bg-card/80 shadow-2xl overflow-hidden glass">
        {/* Header */}
        <div className="px-8 py-6 border-b border-border/50 flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold">{t("bot_header_title") || "Arogya Bot"}</p>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                <p className="text-[10px] font-black uppercase text-secondary tracking-wider">{t("bot_header_status") || "Ready to Assist"}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setAutoSpeak(!autoSpeak)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                autoSpeak ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              }`}
              title={autoSpeak ? "Mute Bot" : "Unmute Bot"}
            >
              {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <div className="relative">
              <button 
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="h-9 px-3 rounded-xl border border-border/60 bg-muted/30 flex items-center gap-2 text-xs font-bold transition-all hover:bg-muted"
                title="Select AI Language"
                aria-haspopup="listbox"
                aria-expanded={langMenuOpen ? "true" : "false"}
              >
                <Languages className="w-4 h-4 text-primary" />
                <span>{langDisplay[localLanguage]}</span>
              </button>

              <AnimatePresence>
                {langMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-[100]" onClick={() => setLangMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full right-0 mt-2 w-36 bg-card border border-border/60 rounded-2xl shadow-2xl p-2 z-[110] glass"
                    >
                      {(["en", "hi", "te"] as const).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => {
                            setLocalLanguage(lang);
                            setLangMenuOpen(false);
                            toast.success(`AI Bot language updated to ${langDisplay[lang]}`);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl transition-all text-xs font-semibold ${
                            localLanguage === lang 
                              ? "bg-primary text-white" 
                              : "hover:bg-muted text-foreground"
                          }`}
                        >
                          {langDisplay[lang]}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <button 
              className="w-9 h-9 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
              title="View History"
            >
              <History className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar min-h-[400px] max-h-[500px] bg-gradient-to-b from-transparent to-muted/5">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-sm ${
                msg.role === "assistant" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
              }`}>
                {msg.role === "assistant" ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm relative group ${
                msg.role === "user" 
                  ? "bg-secondary text-white rounded-tr-none font-medium" 
                  : "bg-background border border-border/50 rounded-tl-none font-medium"
              }`}>
                {msg.content}
                {msg.role === "assistant" && (
                  <button
                    onClick={() => speak(msg.content, true)}
                    className="absolute -right-10 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Speak message"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 shadow-sm">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div className="bg-background border border-border/50 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2 shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground font-semibold">{t("bot_analyzing") || "Analyzing..."}</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Footer Input */}
        <div className="p-6 bg-muted/20 border-t border-border/50">
          <div className="relative group">
            <div className={`absolute inset-0 bg-primary/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-3xl`} />
            <div className="relative flex items-center gap-3 bg-background border border-border/60 rounded-3xl p-2 pl-4 shadow-sm focus-within:border-primary/50 transition-all">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder={t("symptoms_input_placeholder")}
                className="flex-1 bg-transparent border-none outline-none text-sm font-medium"
                disabled={isLoading}
                title={t("symptoms_input_placeholder")}
              />
              
              <div className="flex items-center gap-1 pr-1">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept=".pdf,.doc,.docx,image/*"
                  title="Upload medical report"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-10 h-10 rounded-2xl hover:bg-muted/50 flex items-center justify-center text-muted-foreground transition-colors"
                  title={t("bot_attach_report") || "Attach report"}
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <button 
                  onClick={startSpeechRecognition}
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                    isRecording ? "bg-red-500 text-white animate-pulse" : "hover:bg-muted/50 text-muted-foreground"
                  }`}
                  title={t("bot_voice_input") || "Voice input"}
                >
                  <Mic className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
                  title={t("chat_send_btn")}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIBotExperience;

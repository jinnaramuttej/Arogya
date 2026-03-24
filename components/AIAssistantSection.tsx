import { motion } from "framer-motion";
import { Bot, User, Sparkles, Activity } from "lucide-react";
import { useLanguage } from "@/lib/context/LanguageContext";
import { toast } from "sonner";
import { useState } from "react";

const messages = [
  { from: "user", text: "I've been feeling fatigued lately." },
  { from: "bot", text: "I understand. Let me check your recent vitals and suggest a personalized wellness plan." },
  { from: "bot", text: "Based on your data, I recommend increasing iron intake and scheduling a checkup." },
];

const TypingDots = () => (
  <div className="flex gap-1 items-center px-4 py-3">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="w-2 h-2 rounded-full bg-primary"
        style={{ animation: `typing 1.4s infinite ${i * 0.2}s` }}
        aria-hidden="true"
      />
    ))}
  </div>
);

const AIAssistantSection = () => {
  const { t } = useLanguage();
  const [isMatching, setIsMatching] = useState(false);

  const handleMatchDoctor = () => {
    setIsMatching(true);
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: t("home_ai_typing") || "Arogya is matching you with the best specialist...",
        success: () => {
          setIsMatching(false);
          return "Neural match found: Dr. Aris (Cardiologist) is available for a virtual consult.";
        },
        error: "Neural uplink failed. Please try again.",
      }
    );
  };

  const messages = [
    { from: "user", text: "I've been feeling fatigued lately." },
    { from: "bot", text: "I understand. Let me check your recent vitals and suggest a personalized wellness plan." },
    { from: "bot", text: "Based on your data, I recommend increasing iron intake and scheduling a checkup." },
  ];

  return (
    <section className="py-24 relative overflow-hidden" id="about">
      {/* Decorative Blobs */}
      <div className="absolute top-1/4 -right-24 w-96 h-96 bg-primary/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-1/4 -left-24 w-96 h-96 bg-secondary/10 blur-[120px] rounded-full" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold">
              <Bot className="w-4 h-4" />
              {t("home_ai_badge")}
            </div>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
              {t("home_ai_title")} <br />
              <span className="gradient-text">{t("home_ai_title_2")}</span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
              {t("home_ai_desc")}
            </p>
            
            <div className="grid sm:grid-cols-2 gap-6 py-4">
              {[
                { title: t("home_card_symptoms_title"), desc: t("home_card_symptoms_desc") },
                { title: "Personalized Plans", desc: "Wellness routines tailored to your lifestyle." },
              ].map((item, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all group">
                  <h4 className="font-bold mb-2 group-hover:text-primary transition-colors">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <button className="btn-primary flex items-center gap-2" title={t("home_ai_start_chat_btn")}>
                <Bot className="w-5 h-5" /> {t("home_ai_start_chat_btn")}
              </button>
              <button 
                onClick={handleMatchDoctor}
                disabled={isMatching}
                className="group flex items-center gap-2 px-8 py-4 rounded-full bg-card border border-border/50 font-bold hover:border-primary/50 transition-all disabled:opacity-50"
                title={t("home_ai_match_doctor_btn")}
              >
                {isMatching ? <Activity className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-secondary" />}
                {t("home_ai_match_doctor_btn")}
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Mockup Frame */}
            <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-secondary/20 blur-2xl opacity-50 rounded-[3rem]" />
            
            <div className="relative bento-item p-0 rounded-[2.5rem] overflow-hidden border-primary/20 shadow-2xl">
              {/* Chat Header */}
              <div className="p-6 bg-card border-b border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-secondary border-4 border-card rounded-full" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">Arogya Intelligence</p>
                    <p className="text-xs text-secondary font-bold uppercase tracking-wider">Active & Learning</p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mx-1" />
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                </div>
              </div>

              {/* Chat Body */}
              <div className="p-8 space-y-6 h-[450px] overflow-y-auto custom-scrollbar bg-gradient-to-b from-card to-muted/10">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className={`flex gap-4 ${msg.from === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-sm ${
                      msg.from === "bot" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
                    }`}>
                      {msg.from === "bot" ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                    </div>
                    <div
                      className={`rounded-2xl px-6 py-4 text-sm leading-relaxed shadow-sm ${
                        msg.from === "user"
                          ? "bg-secondary text-white font-medium rounded-tr-none"
                          : "bg-background border border-border/50 font-medium rounded-tl-none"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
                
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 }}
                  className="flex gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <div className="bg-background border border-border/50 rounded-2xl rounded-tl-none px-2 py-1 shadow-sm">
                    <TypingDots />
                  </div>
                </motion.div>
              </div>

              {/* Chat Footer */}
              <div className="p-6 bg-card border-t border-border/50">
                <div className="flex gap-3">
                  <div className="flex-1 bg-muted/50 rounded-2xl px-6 py-4 text-sm text-muted-foreground font-medium border border-border/30">
                    {t("symptoms_input_placeholder") || "Type your health concern..."}
                  </div>
                  <button className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform" title={t("chat_send_btn")}>
                    <User className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AIAssistantSection;

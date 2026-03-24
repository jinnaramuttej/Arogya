"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, CalendarDays } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/context";
import { t } from "@/lib/i18n/translations";
import { useChat } from "ai/react";

interface Message {
  id: string;
  role: "system" | "user" | "assistant" | "data" | "function" | "tool";
  content: string;
}

function ChatBubble({ msg }: { msg: Message }) {
  const isBot = msg.role === "assistant" || msg.role === "system";
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isBot ? "" : "flex-row-reverse"}`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isBot ? "bg-accent/20" : "bg-accent-lighter/20"
        }`}
      >
        {isBot ? (
          <Bot className="w-4 h-4 text-accent-lighter" />
        ) : (
          <User className="w-4 h-4 text-accent-lighter" />
        )}
      </div>
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isBot
            ? "bg-glass-white border border-glass-border text-white/90"
            : "bg-gradient-to-r from-accent-light to-accent text-white"
        }`}
      >
        {msg.content}
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-accent-lighter" />
      </div>
      <div className="bg-glass-white border border-glass-border rounded-2xl px-4 py-3 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-accent-lighter/50"
            style={{
              animation: `typing 1.2s infinite ease-in-out`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

const mockResponses = [
  "Based on what you described, I'd recommend monitoring your symptoms. If they persist for more than 48 hours, please consult a doctor. Stay hydrated and get plenty of rest.",
  "Those symptoms could indicate several conditions. I'd suggest booking an appointment with a general physician for a proper diagnosis. In the meantime, avoid strenuous physical activity.",
  "Thank you for sharing that information. While I can provide general guidance, please remember that this is not a substitute for professional medical advice. Consider visiting your nearest healthcare center.",
];

export default function SymptomPage() {
  const { lang } = useLanguage();
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    initialMessages: [
      {
        id: "initial-msg",
        role: "assistant",
        content: t("chatBot1", lang),
      },
    ],
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Show CTA if there are at least 3 messages (initial + user + ai response)
  const showCTA = messages.length >= 3;

  return (
    <div className="px-4 sm:px-6 py-8 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl sm:text-4xl font-semibold text-white">
          {t("symptomTitle", lang)}
        </h1>
        <p className="text-white/70 mt-2">{t("symptomSubtitle", lang)}</p>
      </motion.div>

      {/* Chat container */}
      <div className="glass overflow-hidden flex flex-col" style={{ height: "60vh" }}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <ChatBubble key={msg.id} msg={msg} />
          ))}
          {isLoading && <TypingIndicator />}
          
          {showCTA && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center mt-6 mb-2"
            >
              <Link
                href="/book"
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-accent-light to-accent text-white text-sm font-semibold shadow-accent hover:shadow-accent-hover hover:-translate-y-0.5 transition-all no-underline"
              >
                <CalendarDays className="w-4 h-4" />
                Book a Doctor
              </Link>
            </motion.div>
          )}
          
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-glass-border p-4 bg-black/20">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              name="prompt"
              value={input}
              onChange={handleInputChange}
              placeholder={t("chatPlaceholder", lang)}
              className="flex-1 px-4 py-3 bg-white/10 border border-glass-border rounded-xl text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent-lighter"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-accent-light to-accent text-white cursor-pointer border-none disabled:opacity-40 hover:shadow-accent transition-shadow"
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

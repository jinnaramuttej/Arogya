import Link from "next/link";
import { MessageCircle, Mic } from "lucide-react";
import { toast } from "@/components/ui/sonner";

const FloatingActions = () => (
  <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-3">
    <Link
      href="/assistant"
      className="h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center transition-transform hover:scale-105"
      aria-label="Open AI chatbot"
      title="AI Chatbot"
    >
      <MessageCircle className="w-5 h-5" />
    </Link>
    <button
      type="button"
      onClick={() => toast("Voice navigation coming soon")}
      className="h-12 w-12 rounded-full bg-card/80 text-foreground border border-border shadow-lg flex items-center justify-center backdrop-blur-md transition-transform hover:scale-105"
      aria-label="Voice navigation"
      title="Voice navigation"
    >
      <Mic className="w-5 h-5" />
    </button>
  </div>
);

export default FloatingActions;

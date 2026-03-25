import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIAssistantSection from "@/components/AIAssistantSection";
import { motion } from "framer-motion";

const AIAssistant = () => (
  <div className="min-h-screen bg-background relative overflow-hidden">
    {/* Background Blobs */}
    <div className="floating-blob w-[500px] h-[500px] bg-secondary/10 -top-24 -right-24" />
    <div className="floating-blob w-[600px] h-[600px] bg-primary/10 bottom-0 -left-24" />
    
    <Navbar />
    
    <main className="pt-32 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="container mx-auto px-6 text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold mb-8">
          THE FUTURE IS HERE
        </div>
        <h1 className="text-5xl md:text-8xl font-bold mb-8 tracking-tighter">
          Beyond <span className="gradient-text">Algorithms.</span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium">
          Arogya's AI is built on empathy. Experience a healthcare companion that learns your needs and anticipates your wellness journey.
        </p>
      </motion.div>
      
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none" />
        <AIAssistantSection />
      </div>

      {/* Feature Bento Detail */}
      <section className="py-24 container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bento-item p-12 bg-gradient-to-br from-card to-primary/5">
            <h3 className="text-3xl font-bold mb-6">Contextual Awareness</h3>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Our AI doesn't just see a symptom; it sees your history, your environment, and your lifestyle to provide truly holistic guidance.
            </p>
          </div>
          <div className="bento-item p-12 bg-gradient-to-br from-card to-secondary/5">
            <h3 className="text-3xl font-bold mb-6">Ethical Framework</h3>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Privacy by design. Your data never leaves your device without explicit permission, and our models are audited for clinical bias.
            </p>
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default AIAssistant;

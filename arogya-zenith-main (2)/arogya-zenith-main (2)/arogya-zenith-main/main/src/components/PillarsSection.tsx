import { motion } from "framer-motion";
import { Accessibility, Eye, Brain, Heart } from "lucide-react";

const pillars = [
  { icon: Accessibility, title: "Accessibility", desc: "Healthcare for everyone, everywhere — breaking barriers with technology." },
  { icon: Eye, title: "Transparency", desc: "Clear, honest health insights you can trust and understand." },
  { icon: Brain, title: "Intelligence", desc: "AI-driven diagnostics and recommendations tailored to you." },
  { icon: Heart, title: "Companionship", desc: "A caring companion on your health journey, always by your side." },
];

const PillarsSection = () => (
  <section className="py-24 relative overflow-hidden" id="features">
    <div className="container mx-auto px-6 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-20"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold mb-6">
          <Heart className="w-4 h-4" />
          OUR VALUES
        </div>
        <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
          The Core <span className="gradient-text">Pillars</span> of Arogya
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Built on a foundation of trust, intelligence, and accessibility to redefine the future of personalized care.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {pillars.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="bento-item p-10 text-center group bg-gradient-to-br from-card to-muted/10 border-border/50"
          >
            {/* Background Icon Pattern */}
            <p.icon className="absolute -right-4 -bottom-4 w-32 h-32 text-primary/5 group-hover:text-primary/10 group-hover:scale-110 transition-all duration-700 pointer-events-none" />
            
            <div className="relative z-10">
              <div className="mx-auto w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-8 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-500 shadow-sm">
                <p.icon className="w-10 h-10 text-primary group-hover:rotate-6 transition-transform duration-300" />
              </div>
              <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">{p.title}</h3>
              <p className="text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors">{p.desc}</p>
            </div>
            
            {/* Decorative line */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
          </motion.div>
        ))}
      </div>

      {/* Trust Quote */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="mt-24 p-12 rounded-[3rem] bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10 text-center relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="text-2xl md:text-3xl font-medium italic text-foreground/80 leading-relaxed mb-8">
            "Our mission is to bridge the gap between complex medical data and human-centric care using the power of ethical AI."
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20" />
            <div className="text-left">
              <p className="font-bold text-lg">Dr. Elena Vance</p>
              <p className="text-sm text-muted-foreground">Chief Medical Officer, Arogya Zenith</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default PillarsSection;

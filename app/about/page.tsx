"use client";

import PillarsSection from "@/components/PillarsSection";
import { motion } from "framer-motion";

const About = () => (
  <div className="min-h-screen bg-background relative overflow-hidden">
    {/* Background Blobs */}
    <div className="floating-blob w-[600px] h-[600px] bg-primary/10 -top-48 -left-48" />
    <div className="floating-blob w-[500px] h-[500px] bg-secondary/10 top-1/2 -right-24" />
<main className="pt-32 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="container mx-auto px-6 text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold mb-8">
          A GLOBAL MISSION
        </div>
        <h1 className="text-5xl md:text-8xl font-bold mb-8 tracking-tighter">
          Defining <span className="gradient-text">Care.</span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium">
          Arogya Zenith is more than a platform—it's a commitment to human-centric intelligence, transparency, and the democratization of healthcare.
        </p>
      </motion.div>
      
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none" />
        <PillarsSection />
      </div>

      {/* Stats/Legacy Section */}
      <section className="py-24 container mx-auto px-6">
        <div className="bento-item p-16 bg-card border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-primary" />
          <div className="grid md:grid-cols-3 gap-12 text-center relative z-10">
            {[
              { label: "Patients Served", value: "2.4M+", desc: "Across 14 countries" },
              { label: "Clinical Accuracy", value: "99.8%", desc: "Verified by experts" },
              { label: "Data Security", value: "AES-256", desc: "Military-grade encryption" },
            ].map((stat, i) => (
              <div key={i} className="space-y-4">
                <p className="text-sm font-black text-primary uppercase tracking-[0.2em]">{stat.label}</p>
                <h4 className="text-5xl font-bold tracking-tighter">{stat.value}</h4>
                <p className="text-muted-foreground font-medium">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
</div>
);

export default About;

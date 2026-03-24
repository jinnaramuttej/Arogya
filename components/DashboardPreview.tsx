import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { BarChart3, FileText, Activity, TrendingUp } from "lucide-react";

const DashboardPreview = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [15, 0, -10]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.85, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section className="py-32 relative overflow-hidden" ref={ref}>
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold mb-6">
            <Activity className="w-4 h-4" />
            REAL-TIME MONITORING
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Your Health <span className="gradient-text">Command Center</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Experience clinical-grade data visualization designed for clarity, speed, and actionable insights.
          </p>
        </motion.div>

        <motion.div
          style={{ rotateX, scale, opacity, perspective: 2000 }}
          className="bento-item p-0 rounded-[2.5rem] max-w-5xl mx-auto overflow-hidden border-primary/20 shadow-2xl bg-card/50 backdrop-blur-3xl"
        >
          {/* Top bar (Window Controls) */}
          <div className="flex items-center justify-between p-6 border-b border-border/50 bg-muted/20">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/40" />
              <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/40" />
            </div>
            <div className="px-4 py-1.5 rounded-lg bg-background/50 border border-border/50 text-[10px] font-bold text-muted-foreground tracking-widest uppercase">
              arogya.cloud/dashboard/live
            </div>
            <div className="w-8 h-8 rounded-lg bg-background/50 border border-border/50 flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary" />
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="p-10">
            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
              {[
                { icon: Activity, label: "Heart Rate", value: "72 bpm", color: "text-primary", trend: "+2%" },
                { icon: TrendingUp, label: "Sleep Quality", value: "94%", color: "text-secondary", trend: "+5%" },
                { icon: Activity, label: "Active Calories", value: "1,240", color: "text-primary", trend: "-12%" },
                { icon: FileText, label: "Medical Sync", value: "Complete", color: "text-secondary", trend: "Live" },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="p-6 rounded-2xl bg-background border border-border/50 hover:border-primary/30 transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <span className="text-[10px] font-black text-secondary">{item.trend}</span>
                  </div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{item.label}</p>
                  <p className="text-2xl font-bold tracking-tight">{item.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Visualization area */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 p-8 rounded-3xl bg-background border border-border/50 h-64 flex flex-col">
                <div className="flex justify-between items-center mb-8">
                  <h4 className="font-bold text-lg">Vital Trends</h4>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <div className="w-3 h-3 rounded-full bg-secondary" />
                  </div>
                </div>
                <div className="flex-1 flex items-end gap-3">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${20 + Math.random() * 80}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 + i * 0.02, duration: 0.8, ease: "easeOut" }}
                      className={`flex-1 rounded-full ${i % 2 === 0 ? 'bg-primary/40' : 'bg-secondary/40'} hover:opacity-100 transition-opacity`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="p-8 rounded-3xl bg-gradient-to-br from-primary to-secondary text-white flex flex-col justify-between overflow-hidden relative group">
                <Activity className="absolute -right-8 -bottom-8 w-48 h-48 text-white/10 group-hover:scale-110 transition-transform duration-700" />
                <div className="relative z-10">
                  <p className="text-xs font-black uppercase tracking-[0.2em] mb-2 opacity-80">Weekly Score</p>
                  <h4 className="text-5xl font-bold tracking-tighter">88.4</h4>
                </div>
                <div className="relative z-10">
                  <p className="text-sm font-medium leading-relaxed opacity-90">
                    Your health optimization is 12% higher than last week. Keep it up!
                  </p>
                  <button className="mt-6 w-full py-3 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 font-bold text-sm hover:bg-white/30 transition-all">
                    VIEW INSIGHTS
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DashboardPreview;

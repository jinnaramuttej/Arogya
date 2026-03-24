import { motion } from "framer-motion";
import { HeartPulse, Leaf, ShieldCheck, Stethoscope } from "lucide-react";

const focusAreas = [
  {
    icon: HeartPulse,
    title: "Preventive Care",
    desc: "Spot early signals with gentle check-ins and clear guidance before issues grow."
  },
  {
    icon: Stethoscope,
    title: "Everyday Clarity",
    desc: "Translate complex health data into simple, trustworthy steps you can act on."
  },
  {
    icon: Leaf,
    title: "Lifestyle Balance",
    desc: "Support sleep, stress, and nutrition with practical, sustainable routines."
  },
  {
    icon: ShieldCheck,
    title: "Safe and Private",
    desc: "Your data stays protected while you stay in control of who sees what."
  }
];

const HealthFocusSection = () => (
  <section className="py-24 relative overflow-hidden">
    <div className="absolute inset-0">
      <div className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-primary/10 blur-[110px]" />
      <div className="absolute -bottom-32 left-12 h-96 w-96 rounded-full bg-secondary/10 blur-[120px]" />
    </div>

    <div className="container mx-auto px-6 relative z-10">
      <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
            Whole Health Approach
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mt-6 leading-tight">
            A calmer, clearer path to everyday wellness.
          </h2>
          <p className="text-lg text-muted-foreground mt-5 max-w-xl leading-relaxed">
            Arogya is not only about features. It is about helping people stay
            well with consistent guidance, gentle monitoring, and support that fits
            real life.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4 max-w-xl">
            {[
              {
                src: "https://images.pexels.com/photos/7659873/pexels-photo-7659873.jpeg?auto=compress&cs=tinysrgb&w=1200",
                alt: "Doctor consulting with a patient",
                className: "col-span-2 h-48"
              },
              {
                src: "https://images.pexels.com/photos/17686818/pexels-photo-17686818.jpeg?auto=compress&cs=tinysrgb&w=900",
                alt: "Portrait of a doctor",
                className: "h-36"
              },
              {
                src: "https://images.pexels.com/photos/8460412/pexels-photo-8460412.jpeg?auto=compress&cs=tinysrgb&w=900",
                alt: "Nurse assisting a patient",
                className: "h-36"
              }
            ].map((img) => (
              <div
                key={img.src}
                className={`rounded-3xl border border-border/60 bg-card/70 p-3 shadow-lg shadow-primary/5 ${img.className?.includes("col-span-2") ? "col-span-2" : ""}`}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className={`w-full rounded-2xl object-cover ${img.className}`}
                  loading="lazy"
                />
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
            {[
              "Personal wellness routines",
              "Mindful monitoring",
              "Human centered guidance",
              "Long term health confidence"
            ].map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-border/60 bg-card/70 px-4 py-2 text-foreground/80 shadow-sm"
              >
                {chip}
              </span>
            ))}
          </div>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6">
          {focusAreas.map((area, index) => (
            <motion.div
              key={area.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="rounded-3xl border border-border/60 bg-card/70 p-6 shadow-lg shadow-primary/5"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <area.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{area.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{area.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default HealthFocusSection;

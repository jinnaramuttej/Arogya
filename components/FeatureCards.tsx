import { motion } from "framer-motion";
import { Activity, ArrowRight, Brain, Droplets, FileText, Siren, ShieldCheck, ShoppingBag, Zap } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/context/LanguageContext";

const BentoCard = ({ 
  title, 
  desc, 
  icon: Icon, 
  path, 
  className = "", 
  delay = 0,
  t
}: { 
  title: string; 
  desc: string; 
  icon: any; 
  path: string; 
  className?: string;
  delay?: number;
  t: (key: string) => string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className={`group bento-item bg-card p-8 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 ${className}`}
  >
    <div className="relative z-10 h-full flex flex-col">
      <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-500">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mb-3 text-xl font-bold">{title}</h3>
      <p className="mb-8 text-sm leading-relaxed text-muted-foreground flex-1">
        {desc}
      </p>
      <Link
        href={path}
        className="inline-flex items-center text-sm font-bold text-primary group/link"
      >
        {t("home_explore_btn") || "Explore Module"}
        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/link:translate-x-1" />
      </Link>
    </div>
    {/* Background Pattern */}
    <div className="absolute -bottom-6 -right-6 h-32 w-32 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none">
      <Icon className="h-full w-full" />
    </div>
  </motion.div>
);

const FeatureCards = () => {
  const { t } = useLanguage();
  return (
    <section className="py-24 bg-background" id="features">
      <div className="container mx-auto px-6">
        <div className="mb-16 max-w-2xl">
          <h2 className="mb-4 text-4xl font-bold md:text-5xl">
            {t("home_features_title")} <span className="gradient-text">{t("home_features_title_2")}</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("home_features_desc")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main Large Card */}
          <BentoCard
            title={t("home_card_symptoms_title")}
            desc={t("home_card_symptoms_desc")}
            icon={Brain}
            path="/symptoms"
            className="md:col-span-8 md:h-[400px]"
            delay={0.1}
            t={t}
          />
          
          {/* Secondary Medium Card */}
          <BentoCard
            title={t("home_card_sos_title")}
            desc={t("home_card_sos_desc")}
            icon={Siren}
            path="/ambulance"
            className="md:col-span-4 md:h-[400px]"
            delay={0.2}
            t={t}
          />

          {/* Features Grid */}
          <BentoCard
            title={t("nav_store") || "Pharmacy"}
            desc="Order genuine medicines, injectables, and health devices with neural prescription analysis."
            icon={ShoppingBag}
            path="/store"
            className="md:col-span-4"
            delay={0.3}
            t={t}
          />
          <BentoCard
            title={t("home_card_records_title")}
            desc={t("home_card_records_desc")}
            icon={FileText}
            path="/records"
            className="md:col-span-4"
            delay={0.4}
            t={t}
          />
          <BentoCard
            title={t("home_card_security_title")}
            desc={t("home_card_security_desc")}
            icon={ShieldCheck}
            path="/records"
            className="md:col-span-4"
            delay={0.5}
            t={t}
          />
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;

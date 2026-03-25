import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DashboardPreview from "@/components/DashboardPreview";
import { motion } from "framer-motion";

const DashboardDemo = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-32 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-6 text-center mb-16"
      >
        <h1 className="text-5xl font-bold mb-6">Interactive <span className="gradient-text">Dashboard Preview</span></h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Get a glimpse of our health dashboard designed to help you track your progress effectively.
        </p>
      </motion.div>
      <DashboardPreview />
    </main>
    <Footer />
  </div>
);

export default DashboardDemo;

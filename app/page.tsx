"use client";

import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import FeatureCards from "@/components/FeatureCards";
import HealthFocusSection from "@/components/HealthFocusSection";
import PillarsSection from "@/components/PillarsSection";
import AIAssistantSection from "@/components/AIAssistantSection";
import DashboardPreview from "@/components/DashboardPreview";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <div className="floating-blob w-[800px] h-[800px] bg-primary/5 -top-48 -right-48" />
      <div className="floating-blob w-[600px] h-[600px] bg-secondary/5 top-1/2 -left-24" />

      <main className="relative z-10">
        <HeroSection />
        <div className="relative z-20 -mt-20 md:-mt-32">
          <StatsSection />
        </div>
        <FeatureCards />
        <HealthFocusSection />
        <div className="bg-gradient-to-b from-transparent via-primary/5 to-transparent">
          <AIAssistantSection />
        </div>
        <DashboardPreview />
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background pointer-events-none" />
          <PillarsSection />
        </div>
      </main>
    </div>
  );
}

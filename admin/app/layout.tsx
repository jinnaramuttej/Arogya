import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ParticleCanvas from "@/components/features/ParticleCanvas";
import SOSButton from "@/components/ui/SOSButton";
import { LanguageProvider } from "@/lib/i18n/context";
import ConditionalLayout from "@/components/layout/ConditionalLayout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Arogya — Your Intelligent Health Companion",
  description:
    "Smart, compassionate, and accessible healthcare for everyone. AI symptom checking, appointment booking, and emergency services.",
  keywords: ["healthcare", "telemedicine", "AI symptom checker", "emergency services", "Arogya"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <LanguageProvider>
          {/* Background gradient overlay */}
          <div
            className="fixed inset-0 pointer-events-none"
            style={{
              zIndex: -2,
              background:
                "linear-gradient(135deg, hsla(240, 70%, 50%, 0.3), rgba(0, 0, 0, 0.6))",
            }}
            aria-hidden="true"
          />
          <ParticleCanvas />
          <ConditionalLayout>{children}</ConditionalLayout>
          <SOSButton />
        </LanguageProvider>
      </body>
    </html>
  );
}

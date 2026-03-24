import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/context/LanguageContext";
import { CartProvider } from "@/lib/cart";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import { Toaster as Sonner } from "@/components/ui/sonner";

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
      <body className="font-sans antialiased min-h-screen bg-background text-foreground">
        <LanguageProvider>
          <CartProvider>
            <ConditionalLayout>{children}</ConditionalLayout>
            <Sonner />
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

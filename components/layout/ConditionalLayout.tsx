"use client";

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import ParticleCanvas from "@/components/features/ParticleCanvas";
import SOSButton from "@/components/ui/SOSButton";

const ConditionalLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  // Define the paths where the main Navbar and Footer should NOT be shown
  const isDashboardRoute = pathname.startsWith('/admin') || pathname.startsWith('/doctor');

  if (isDashboardRoute) {
    // For admin and doctor routes, render only the children in a clean container
    return <div className="bg-gray-100 min-h-screen">{children}</div>;
  } else {
    // For all other routes, wrap with the full public site layout
    return (
      <>
        <div
          style={{
            position: "fixed",
            width: "100vw",
            height: "100vh",
            zIndex: -1,
          }}
        />
        <ParticleCanvas />
        <Navbar />
        <main className="pt-24 min-h-screen">{children}</main>
        <Footer />
        <SOSButton />
      </>
    );
  }
};

export default ConditionalLayout;

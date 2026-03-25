"use client";

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from '../Navbar';
import Footer from '../Footer';
import SOSButton from "@/components/ui/SOSButton";
import FloatingAIBot from "@/components/FloatingAIBot";

const ConditionalLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check if user is locked in 2FA mode
    const needs2FA = sessionStorage.getItem('needs_2fa');
    if (needs2FA === 'true' && !pathname.includes('/verify')) {
      router.push('/verify?mode=2fa');
    }
  }, [pathname, router]);

  // Define the paths where the main Navbar and Footer should NOT be shown
  const isDashboardRoute = pathname.startsWith('/admin') || pathname.startsWith('/doctor');
  const isAuthRoute = pathname.startsWith('/auth') || pathname.startsWith('/verify');

  if (isDashboardRoute) {
    // For admin and doctor routes, render only the children in a clean container
    return <div className="bg-gray-100 min-h-screen">{children}</div>;
  } else if (isAuthRoute) {
    // For login/signup/biometric routes, render bare (no Navbar or Footer)
    return <>{children}</>;
  } else {
    // For all other routes, wrap with the full public site layout
    return (
      <>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <FloatingAIBot />
        {/* <SOSButton /> Temporarily removed to prevent overlap with FloatingAIBot */}
      </>
    );
  }
};

export default ConditionalLayout;

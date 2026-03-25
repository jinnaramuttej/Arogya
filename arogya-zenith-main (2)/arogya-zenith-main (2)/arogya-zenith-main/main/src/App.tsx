import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import NotFound from "./pages/NotFound.tsx";
import SymptomChecker from "./pages/SymptomChecker.tsx";
import AmbulanceSOS from "./pages/AmbulanceSOS.tsx";
import BloodDonorNetwork from "./pages/BloodDonorNetwork.tsx";
import HealthRecords from "./pages/HealthRecords.tsx";
import About from "./pages/About.tsx";
import AIAssistant from "./pages/AIAssistant.tsx";
import DashboardDemo from "./pages/DashboardDemo.tsx";
import PatientDashboard from "./pages/PatientDashboard.tsx";
import Store from "./pages/Store.tsx";
import EPrescription from "./pages/EPrescription.tsx";
import Cart from "./pages/Cart.tsx";
import Profile from "./pages/Profile.tsx";
import { CartProvider } from "@/lib/cart";
import { LanguageProvider } from "@/context/LanguageContext";
import GlobalAIAssistant from "@/components/GlobalAIAssistant";

const queryClient = new QueryClient();

const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/symptoms" element={<PageTransition><SymptomChecker /></PageTransition>} />
        <Route path="/ambulance" element={<PageTransition><AmbulanceSOS /></PageTransition>} />
        <Route path="/blood" element={<PageTransition><BloodDonorNetwork /></PageTransition>} />
        <Route path="/records" element={<PageTransition><HealthRecords /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/assistant" element={<PageTransition><AIAssistant /></PageTransition>} />
        <Route path="/dashboard-demo" element={<PageTransition><DashboardDemo /></PageTransition>} />
        <Route path="/patient-dashboard" element={<PageTransition><PatientDashboard /></PageTransition>} />
        <Route path="/store" element={<PageTransition><Store /></PageTransition>} />
        <Route path="/cart" element={<PageTransition><Cart /></PageTransition>} />
        <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <CartProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AnimatedRoutes />
            <GlobalAIAssistant />
          </BrowserRouter>
        </CartProvider>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;

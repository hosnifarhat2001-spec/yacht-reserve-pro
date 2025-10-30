import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import YachtDetails from "./pages/YachtDetails";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import WaterSports from "./pages/WaterSports";
import Food from "./pages/Food";
import AdditionalServices from "./pages/AdditionalServices";
import ServiceCart from "./pages/ServiceCart";
import NotFound from "./pages/NotFound";
import Fleet from "./pages/Fleet";
import { Footer } from "@/components/Footer";

const queryClient = new QueryClient();

const FooterContainer = () => {
  const location = useLocation();
  return <Footer key={location.pathname} />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/yacht/:id" element={<YachtDetails />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/water-sports" element={<WaterSports />} />
              <Route path="/food" element={<Food />} />
              <Route path="/additional-services" element={<AdditionalServices />} />
              <Route path="/cart" element={<ServiceCart />} />
              <Route path="/fleet" element={<Fleet />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <FooterContainer />
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

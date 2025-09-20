import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/sections/HeroSection";
import ReviewCarousel from "@/components/sections/ReviewCarousel";
import TabsSection from "@/components/sections/TabsSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import CallToActionSection from "@/components/sections/CallToActionSection";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Capacitor } from '@capacitor/core';

const Index = () => {
  const navigate = useNavigate();
  const isNative = Capacitor.isNativePlatform();

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <HeroSection />
          <ReviewCarousel />
          <TabsSection />
          <FeaturesSection />
          <TestimonialsSection />
          <CallToActionSection />
          <ReviewCarousel />
          {isNative && (
            <div className="mt-4">
              <Button
                onClick={() => navigate('/mobile-test')}
                className="bg-green-600 hover:bg-green-700"
              >
                📱 Test Mobile Features
              </Button>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </TooltipProvider>
  );
};

export default Index;

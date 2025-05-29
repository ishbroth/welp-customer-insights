
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/sections/HeroSection";
import TabsSection from "@/components/sections/TabsSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import CallToActionSection from "@/components/sections/CallToActionSection";

const Index = () => {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <HeroSection />
          <TabsSection />
          <FeaturesSection />
          <TestimonialsSection />
          <CallToActionSection />
        </main>
        <Footer />
      </div>
    </TooltipProvider>
  );
};

export default Index;

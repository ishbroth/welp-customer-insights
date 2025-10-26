import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/sections/HeroSection";
import ReviewCarousel from "@/components/sections/ReviewCarousel";
import TabsSection from "@/components/sections/TabsSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import CallToActionSection from "@/components/sections/CallToActionSection";
import BackgroundImages from "@/components/sections/BackgroundImages";

const Index = () => {

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-grow">
          <HeroSection />
          <ReviewCarousel />

          {/* Section with background images - from first carousel to CallToAction */}
          <div className="relative">
            <BackgroundImages />
            <div className="relative z-10">
              <TabsSection />
              <FeaturesSection />
              <TestimonialsSection />
            </div>
          </div>

          <CallToActionSection />
          <ReviewCarousel />
        </main>
        <Footer />
      </div>
    </TooltipProvider>
  );
};

export default Index;


import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/how-it-works/HeroSection";
import AccountTypesSection from "@/components/how-it-works/AccountTypesSection";
import SignupSection from "@/components/how-it-works/SignupSection";
import SearchSection from "@/components/how-it-works/SearchSection";
import ReviewsSection from "@/components/how-it-works/ReviewsSection";
import PricingSection from "@/components/how-it-works/PricingSection";
import CTASection from "@/components/how-it-works/CTASection";

const HowItWorks = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <AccountTypesSection />
        <SignupSection />
        <SearchSection />
        <ReviewsSection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorks;

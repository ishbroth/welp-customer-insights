
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="bg-[#ea384c] text-white py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">How Welp. Works</h1>
          <p className="text-xl mb-8">
            Your comprehensive guide to using the Welp. platform for business owners and customers.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

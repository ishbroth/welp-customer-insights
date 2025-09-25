
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/auth";
import { toast } from "@/hooks/use-toast";

const HeroSection = () => {
  const { currentUser } = useAuth();

  const handleLoggedInClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toast({
      title: "Already logged in",
      description: "You are already signed in to your account.",
    });
  };

  return (
    <section className="bg-[#ea384c] text-white py-10 md:py-13 lg:py-19">
      <div className="container mx-auto px-3 md:px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold mb-3 md:mb-4">Welp.</h1>
          <div className="text-lg md:text-xl lg:text-2xl mb-6 md:mb-8">
            {/* Mobile: Two lines */}
            <div className="block md:hidden">
              <p>Review your customers.</p>
              <p>Because businesses are people too.</p>
            </div>
            {/* Desktop: One line */}
            <p className="hidden md:block">Review your customers. Because businesses are people too.</p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
            {currentUser ? (
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <div>
                    <Button 
                      className="bg-gray-400 text-gray-600 cursor-not-allowed font-bold py-3 px-6 rounded-full"
                      onClick={handleLoggedInClick}
                      disabled
                    >
                      Get Started
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-black text-white p-2 rounded shadow-lg">
                  <p>You are already signed in to your account</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Link to="/signup">
                <Button className="bg-white text-[#ea384c] hover:bg-gray-100 font-bold py-2 md:py-3 px-4 md:px-6 rounded-full text-sm md:text-base">
                  Get Started
                </Button>
              </Link>
            )}
            <Link to="/about">
              <Button variant="outline" className="border-white text-[#ea384c] hover:bg-white/10 hover:text-white font-bold py-2 md:py-3 px-4 md:px-6 rounded-full text-sm md:text-base">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

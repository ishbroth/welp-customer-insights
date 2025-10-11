
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/auth";
import { toast } from "@/hooks/use-toast";

const CallToActionSection = () => {
  const { currentUser } = useAuth();

  const handleLoggedInClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toast({
      title: "Already logged in",
      description: "You are already signed in to your account.",
    });
  };

  return (
    <section className="py-16 welp-gradient text-white bg-opacity-90 backdrop-blur-sm">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to take control?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Join thousands of business owners who use Welp. to make informed decisions about their customers.
        </p>
        {currentUser ? (
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <div>
                <Button 
                  className="bg-gray-400 text-gray-600 cursor-not-allowed font-bold py-3 px-8 rounded-full text-lg"
                  onClick={handleLoggedInClick}
                  disabled
                >
                  Get Started Today
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-black text-white p-2 rounded shadow-lg">
              <p>You are already signed in to your account</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <Link to="/signup">
            <Button className="bg-white text-welp-primary hover:bg-gray-100 font-bold py-3 px-8 rounded-full text-lg">
              Get Started Today
            </Button>
          </Link>
        )}
      </div>
    </section>
  );
};

export default CallToActionSection;

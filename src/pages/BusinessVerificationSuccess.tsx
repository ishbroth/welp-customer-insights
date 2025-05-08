
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Star, Shield } from 'lucide-react';

const BusinessVerificationSuccess = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [countdown, setCountdown] = useState(5);

  // Countdown effect for auto-redirect
  useEffect(() => {
    const timer = countdown > 0 && setInterval(() => setCountdown(countdown - 1), 1000);
    if (countdown === 0) {
      navigate('/review/new');
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown, navigate]);

  const handleRedirectNow = () => {
    navigate('/review/new');
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto p-8 text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle2 className="h-24 w-24 text-green-500" />
            </div>
            
            <h1 className="text-3xl font-bold mb-4">Business Verified Successfully!</h1>
            
            <p className="text-lg mb-6">
              Congratulations! Your business has been successfully verified on Welp.
              You're now ready to start using our platform.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-3 flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-500 mr-2" />
                Write Your First Review
              </h2>
              
              <p className="mb-4">
                As a business owner on Welp, you can now review customers you've interacted with.
                Share your experience to help other businesses make informed decisions.
              </p>
              
              <Button 
                onClick={handleRedirectNow} 
                className="welp-button w-full"
              >
                Start Writing Reviews Now
              </Button>
              
              <p className="text-sm mt-3">
                Redirecting to the review page in {countdown} seconds...
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-3 flex items-center justify-center">
                <Shield className="h-6 w-6 text-emerald-600 mr-2" />
                Why Business Verification?
              </h2>
              
              <p className="text-sm text-left mb-3">
                Welp is specifically designed for business owners to share experiences about their customers. 
                Our verification process ensures that:
              </p>
              
              <ul className="text-sm text-left list-disc pl-5 mb-3 space-y-2">
                <li><span className="font-medium">Only legitimate businesses</span> can submit reviews, maintaining the integrity and value of our platform.</li>
                <li><span className="font-medium">Reviews come from actual business interactions</span>, providing other business owners with reliable insights.</li>
                <li><span className="font-medium">The platform remains protected</span> from fraudulent accounts or those seeking to manipulate ratings.</li>
              </ul>
              
              <p className="text-sm text-left">
                This verification establishes a trusted community where business owners can share genuine 
                experiences and make informed decisions about potential clients or customers.
              </p>
            </div>
            
            <div className="text-sm text-gray-500">
              <p>Need help getting started? Check out our <a href="/how-it-works" className="text-welp-primary hover:underline">How It Works</a> guide.</p>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BusinessVerificationSuccess;


import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { SubscriptionPlans } from "@/components/subscription/SubscriptionPlans";
import SubscriptionFAQ from "@/components/subscription/SubscriptionFAQ";
import { handleSubscription, handleRedirectAfterSubscription } from "@/services/subscriptionService";

const Subscription = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const location = useLocation();
  const { currentUser, setIsSubscribed } = useAuth();
  const isCustomer = currentUser?.type === "customer";

  // Determine if we came from a specific review
  const [fromReviewId, setFromReviewId] = useState<string | null>(null);
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const reviewId = params.get("reviewId");
    if (reviewId) {
      setFromReviewId(reviewId);
    }
  }, [location]);

  const handleSubscribeClick = async () => {
    await handleSubscription(setIsProcessing, setIsSubscribed, toast, isCustomer);
    handleRedirectAfterSubscription(isCustomer);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-3">Welp. Subscription</h1>
            
            {isCustomer ? (
              <p className="text-center text-xl mb-10 text-gray-600">
                Access all reviews about you and respond to businesses
              </p>
            ) : (
              <p className="text-center text-xl mb-10 text-gray-600">
                Access the full customer database and make informed business decisions
              </p>
            )}
            
            <SubscriptionPlans 
              type={isCustomer ? "customer" : "business"}
              isProcessing={isProcessing}
              handleSubscribe={handleSubscribeClick}
            />
            
            <SubscriptionFAQ isCustomer={isCustomer} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Subscription;


import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { SubscriptionPlans } from "@/components/subscription/SubscriptionPlans";
import SubscriptionFAQ from "@/components/subscription/SubscriptionFAQ";
import { handleSubscription } from "@/services/subscriptionService";

const Subscription = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, setIsSubscribed, loading } = useAuth();
  const isCustomer = currentUser?.type === "customer";

  // Determine if we came from a specific review or billing page
  const [fromReviewId, setFromReviewId] = useState<string | null>(null);
  const [fromBilling, setFromBilling] = useState<boolean>(false);
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const reviewId = params.get("reviewId");
    const canceled = params.get("canceled");
    const fromBillingParam = params.get("from");
    
    if (reviewId) {
      setFromReviewId(reviewId);
    }
    
    if (fromBillingParam === "billing") {
      setFromBilling(true);
    }
    
    if (canceled) {
      toast({
        title: "Subscription Canceled",
        description: "Your subscription process was canceled. You can try again when you're ready.",
      });
      
      // If user came from billing and canceled, redirect back to profile
      if (fromBilling && currentUser) {
        setTimeout(() => {
          navigate("/profile");
        }, 2000);
      }
    }
  }, [location, toast, navigate, currentUser, fromBilling]);

  // Handle navigation away from subscription page without completing
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (fromBilling && !isProcessing) {
        // Only show warning if they're navigating away during an active subscription process
        return;
      }
    };

    const handlePopState = () => {
      if (fromBilling && currentUser) {
        // If user uses browser back button, redirect to profile
        navigate("/profile", { replace: true });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [fromBilling, currentUser, navigate, isProcessing]);

  const handleSubscribeClick = async () => {
    await handleSubscription(setIsProcessing, setIsSubscribed, toast, isCustomer);
  };

  // Show loading state while auth is being determined
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-welp-primary mx-auto mb-4"></div>
              <p>Loading...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {fromBilling && currentUser && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">
                  Complete your subscription to unlock premium features. 
                  <button 
                    onClick={() => navigate("/profile")}
                    className="ml-2 text-blue-600 hover:text-blue-800 underline"
                  >
                    Return to Profile
                  </button>
                </p>
              </div>
            )}
            
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

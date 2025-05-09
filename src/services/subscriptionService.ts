
import { supabase } from "@/integrations/supabase/client";

export const handleSubscription = async (
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>,
  setIsSubscribed: (value: boolean) => void,
  toast: (props: { 
    title: string;
    description: string;
    variant?: "default" | "destructive";
  }) => void,
  isCustomer: boolean
): Promise<void> => {
  return new Promise(async (resolve) => {
    setIsProcessing(true);
    
    try {
      // Get current user session from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session || !session.user) {
        toast({
          title: "Authentication Error",
          description: "Please log in to subscribe.",
          variant: "destructive"
        });
        setIsProcessing(false);
        resolve();
        return;
      }
      
      const userId = session.user.id;
      const subscriptionType = isCustomer ? "customer" : "business";
      
      // Create a new subscription record
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          type: subscriptionType, // Updated to match DB field
          status: 'active', // Status is required in DB
          started_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        });
        
      if (error) {
        throw error;
      }
      
      // Update subscription status
      setIsSubscribed(true);
      
      console.log("Subscription - Set subscription status to true");
      
      toast({
        title: "Subscription Active",
        description: "Thank you for subscribing! You now have full access to Welp.",
      });
      
      setIsProcessing(false);
      resolve();
    } catch (error) {
      console.error("Subscription error:", error);
      toast({
        title: "Subscription Error",
        description: "An error occurred while processing your subscription. Please try again.",
        variant: "destructive"
      });
      setIsProcessing(false);
      resolve();
    }
  });
};

export const handleRedirectAfterSubscription = (isCustomer: boolean): void => {
  setTimeout(() => {
    if (isCustomer) {
      // For customers, redirect to their reviews page
      window.location.href = "/profile/reviews?subscribed=true";
    } else {
      // For businesses, redirect to their profile page instead of business-dashboard
      window.location.href = "/profile/business-reviews?subscribed=true";
    }
  }, 2000);
};

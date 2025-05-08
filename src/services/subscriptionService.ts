
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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "Please log in to subscribe.",
          variant: "destructive"
        });
        setIsProcessing(false);
        resolve();
        return;
      }
      
      // Insert a new subscription record
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          active: true,
          subscription_type: 'premium',
          start_date: new Date().toISOString(),
          // For demo purposes, no end_date means it's ongoing
        });
        
      if (error) {
        console.error("Subscription error:", error);
        toast({
          title: "Subscription Error",
          description: "There was an error processing your subscription. Please try again.",
          variant: "destructive"
        });
        setIsProcessing(false);
        resolve();
        return;
      }
      
      // Update subscription status in AuthContext
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
        description: "An unexpected error occurred. Please try again.",
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

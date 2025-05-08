
import { useToast } from "@/hooks/use-toast";

export const handleSubscription = (
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>,
  setIsSubscribed: (value: boolean) => void,
  toast: ReturnType<typeof useToast>["toast"],
  isCustomer: boolean
): Promise<void> => {
  return new Promise((resolve) => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      // Update subscription status using AuthContext
      setIsSubscribed(true);
      
      console.log("Subscription - Set subscription status to true");
      
      toast({
        title: "Subscription Active",
        description: "Thank you for subscribing! You now have full access to Welp.",
      });
      
      setIsProcessing(false);
      resolve();
    }, 2000);
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

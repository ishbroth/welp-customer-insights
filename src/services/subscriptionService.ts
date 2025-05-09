
// Mock subscription service with localStorage persistence

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
      // Get mock user from localStorage
      const storedUser = localStorage.getItem('mockUser');
      
      if (!storedUser) {
        toast({
          title: "Authentication Error",
          description: "Please log in to subscribe.",
          variant: "destructive"
        });
        setIsProcessing(false);
        resolve();
        return;
      }
      
      // Mock subscription process
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      // Update subscription status
      setIsSubscribed(true);
      
      console.log("Subscription - Set subscription status to true");
      
      toast({
        title: "Subscription Active",
        description: "Thank you for subscribing! You now have full access to Welp.",
      });
      
      // Store subscription in localStorage
      localStorage.setItem('subscription_active', 'true');
      localStorage.setItem('subscription_date', new Date().toISOString());
      
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

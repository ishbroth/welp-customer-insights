
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/sonner";
import { openCustomerPortal } from "@/services/subscriptionService";

interface AccountTypeSectionProps {
  isSubscribed: boolean;
  currentUserType?: string;
  currentUserEmail?: string;
  setIsSubscribed: (value: boolean) => void;
}

const AccountTypeSection = ({ isSubscribed, currentUserType, currentUserEmail, setIsSubscribed }: AccountTypeSectionProps) => {
  // Function to get the subscription page URL based on account type
  const getSubscriptionUrl = () => {
    return currentUserType === "business" 
      ? "/subscription?type=business" 
      : "/subscription?type=customer";
  };

  // Function to get the account type display text with subscription status
  const getAccountTypeDisplay = () => {
    if (!currentUserType) return "Unknown";
    
    if (currentUserType === "business") {
      return isSubscribed ? "Business Premium" : "Business Account";
    } else {
      return isSubscribed ? "Premium Customer" : "Customer Account";
    }
  };

  // Handle unsubscribe
  const handleUnsubscribe = async () => {
    try {
      // For permanent accounts, just update local state
      const permanentAccountEmails = [
        'iw@thepaintedpainter.com',
        'isaac.wiley99@gmail.com'
      ];
      
      if (currentUserEmail && permanentAccountEmails.includes(currentUserEmail)) {
        setIsSubscribed(false);
        toast.success("Subscription cancelled successfully.");
        return;
      }

      // For regular users, redirect to customer portal for cancellation
      await openCustomerPortal();
    } catch (error: any) {
      console.error("Error cancelling subscription:", error);
      toast.error("Could not cancel subscription. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border rounded-md p-6 space-y-4">
        <h3 className="text-lg font-medium mb-3">Account Type</h3>
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-md">
          <div>
            <p className="font-semibold flex items-center">
              {getAccountTypeDisplay()}
              {isSubscribed && (
                <Badge variant="outline" className="ml-2 bg-yellow-50 text-yellow-700 border-yellow-200">
                  <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />
                  Premium
                </Badge>
              )}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {isSubscribed 
                ? "You have access to all premium features" 
                : "Upgrade to premium for additional features"}
            </p>
          </div>
          <div>
            {isSubscribed ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    Unsubscribe
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will cancel your subscription and you will lose access to premium features. 
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleUnsubscribe}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Yes, Unsubscribe
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button asChild>
                <Link to={getSubscriptionUrl()}>
                  <Star className="h-4 w-4 mr-2" />
                  Subscribe Now
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountTypeSection;

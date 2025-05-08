
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface AccountTypeSectionProps {
  isSubscribed: boolean;
  currentUserType?: string;
  setIsSubscribed: (value: boolean) => void;
}

const AccountTypeSection = ({ isSubscribed, currentUserType, setIsSubscribed }: AccountTypeSectionProps) => {
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
              <Button 
                variant="secondary" 
                className="bg-green-50 text-green-700 hover:bg-green-100"
                disabled
              >
                <Star className="h-4 w-4 mr-2 fill-green-500" />
                You are Subscribed!
              </Button>
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
        
        {/* For demo purposes - let's add a toggle to simulate subscription */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-2">Demo Controls:</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsSubscribed(!isSubscribed)}
          >
            {isSubscribed ? "Simulate Unsubscribe" : "Simulate Subscribe"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AccountTypeSection;

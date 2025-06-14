
import { AlertCircle, CheckCircle, Crown } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useVerifiedStatus } from "@/hooks/useVerifiedStatus";

interface BusinessReviewsSubscriptionBannerProps {
  hasSubscription: boolean;
}

const BusinessReviewsSubscriptionBanner = ({ hasSubscription }: BusinessReviewsSubscriptionBannerProps) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { isVerified } = useVerifiedStatus(currentUser?.id);

  if (hasSubscription) {
    return (
      <Alert className="mb-6 border-green-200 bg-green-50">
        <Crown className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <div className="flex items-center justify-between">
            <span>You have full access to write and manage customer reviews.</span>
            {isVerified && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Verified Business</span>
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="mb-6 border-blue-200 bg-blue-50">
      <AlertCircle className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium mb-1">You can write customer reviews</p>
            <p className="text-sm">
              {isVerified 
                ? "As a verified business, your reviews get priority in search results."
                : "Your reviews are permanent and searchable. Get verified for higher search ranking."
              }
            </p>
          </div>
          <div className="flex gap-2">
            {!isVerified && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/verify-license")}
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                Get Verified
              </Button>
            )}
            <Button 
              size="sm"
              onClick={() => navigate("/billing")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Upgrade to Premium
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default BusinessReviewsSubscriptionBanner;

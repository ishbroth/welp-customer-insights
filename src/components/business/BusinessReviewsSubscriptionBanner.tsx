
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface BusinessReviewsSubscriptionBannerProps {
  hasSubscription: boolean;
}

const BusinessReviewsSubscriptionBanner = ({ hasSubscription }: BusinessReviewsSubscriptionBannerProps) => {
  const navigate = useNavigate();

  const handleSubscribeClick = () => {
    navigate('/subscription');
  };

  if (hasSubscription) {
    return (
      <div className="mb-6 p-4 border border-green-300 bg-green-50 rounded-md">
        <div className="flex items-center">
          <div>
            <h3 className="font-semibold text-green-800">Premium Features Enabled</h3>
            <p className="text-sm text-green-700">
              You have full access to all review responses and premium features.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 p-4 border border-yellow-300 bg-yellow-50 rounded-md">
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <div className="mb-4 sm:mb-0">
          <h3 className="font-semibold text-yellow-800">Premium Features Disabled</h3>
          <p className="text-sm text-yellow-700">
            Your subscription has expired. Subscribe to enable review responses and premium features.
          </p>
        </div>
        <Button onClick={handleSubscribeClick} className="bg-yellow-600 hover:bg-yellow-700">
          Subscribe Now
        </Button>
      </div>
    </div>
  );
};

export default BusinessReviewsSubscriptionBanner;

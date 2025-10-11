
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { logger } from "@/utils/logger";

interface ProfileReviewsSubscriptionStatusProps {
  hasSubscription?: boolean;
}

const ProfileReviewsSubscriptionStatus = ({ hasSubscription = false }: ProfileReviewsSubscriptionStatusProps) => {
  const componentLogger = logger.withContext('ProfileReviewsSubscriptionStatus');
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleSubscribeClick = () => {
    componentLogger.debug("ProfileReviewsSubscriptionStatus clicked");
    componentLogger.debug("Current user object:", currentUser);
    componentLogger.debug("User type:", currentUser?.type);
    componentLogger.debug("User type string:", String(currentUser?.type));
    componentLogger.debug("User type typeof:", typeof currentUser?.type);
    componentLogger.debug("User type strict check:", currentUser?.type === "business");
    componentLogger.debug("User type loose check:", currentUser?.type == "business");

    // More explicit routing logic with additional checks
    const userType = String(currentUser?.type).toLowerCase().trim();
    componentLogger.debug("Normalized user type:", userType);

    if (userType === "business") {
      componentLogger.debug("BUSINESS DETECTED - Navigating to /subscription");
      navigate("/subscription");
      return;
    }

    componentLogger.debug("NON-BUSINESS USER - Navigating to /customer-benefits");
    navigate("/customer-benefits");
  };

  if (hasSubscription) {
    return (
      <div className="mb-6 p-4 border border-green-300 bg-green-50 rounded-md">
        <div className="flex items-center">
          <div>
            <h3 className="font-semibold text-green-800">Premium Subscription Active</h3>
            <p className="text-sm text-green-700">
              You have full access to all reviews, and you can respond to claimed reviews.
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
            Subscribe now to unlock full access to all reviews and responses.
          </p>
        </div>
        <Button onClick={handleSubscribeClick} className="bg-yellow-600 hover:bg-yellow-700">
          Subscribe Now
        </Button>
      </div>
    </div>
  );
};

export default ProfileReviewsSubscriptionStatus;

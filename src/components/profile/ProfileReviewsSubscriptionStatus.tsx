
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";

interface ProfileReviewsSubscriptionStatusProps {
  hasSubscription?: boolean;
}

const ProfileReviewsSubscriptionStatus = ({ hasSubscription = false }: ProfileReviewsSubscriptionStatusProps) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleSubscribeClick = () => {
    console.log("🔀 ProfileReviewsSubscriptionStatus clicked");
    console.log("📋 Current user object:", currentUser);
    console.log("📋 User type:", currentUser?.type);
    console.log("📋 User type strict check:", currentUser?.type === "business");
    
    // Route based on user type
    if (currentUser?.type === "business") {
      console.log("✅ Navigating to /subscription (business user)");
      navigate("/subscription");
    } else {
      console.log("✅ Navigating to /customer-benefits (customer user - fallback)");
      navigate("/customer-benefits");
    }
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

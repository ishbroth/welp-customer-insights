
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { logger } from "@/utils/logger";

interface SubscriptionButtonProps {
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
  className?: string;
}

const SubscriptionButton = ({ variant = "default", size = "default", className = "" }: SubscriptionButtonProps) => {
  const componentLogger = logger.withContext('SubscriptionButton');
  const navigate = useNavigate();
  const { isSubscribed, currentUser } = useAuth();

  const handleSubscriptionClick = () => {
    componentLogger.debug("SubscriptionButton clicked");
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

  return (
    <Button
      onClick={handleSubscriptionClick}
      variant={variant}
      size={size}
      className={className}
    >
      {isSubscribed ? "Manage Subscription" : "Subscribe Now"}
    </Button>
  );
};

export default SubscriptionButton;


import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";

interface SubscriptionButtonProps {
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
  className?: string;
}

const SubscriptionButton = ({ variant = "default", size = "default", className = "" }: SubscriptionButtonProps) => {
  const navigate = useNavigate();
  const { isSubscribed, currentUser } = useAuth();

  const handleSubscriptionClick = () => {
    console.log("🔀 SubscriptionButton clicked");
    console.log("📋 Current user object:", currentUser);
    console.log("📋 User type:", currentUser?.type);
    console.log("📋 User type string:", String(currentUser?.type));
    console.log("📋 User type typeof:", typeof currentUser?.type);
    console.log("📋 User type strict check:", currentUser?.type === "business");
    console.log("📋 User type loose check:", currentUser?.type == "business");
    
    // More explicit routing logic with additional checks
    const userType = String(currentUser?.type).toLowerCase().trim();
    console.log("📋 Normalized user type:", userType);
    
    if (userType === "business") {
      console.log("✅ BUSINESS DETECTED - Navigating to /subscription");
      navigate("/subscription");
      return;
    }
    
    console.log("✅ NON-BUSINESS USER - Navigating to /customer-benefits");
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

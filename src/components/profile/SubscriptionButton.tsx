
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
    console.log("🔀 SubscriptionButton clicked - User type:", currentUser?.type, "User object:", currentUser);
    
    // Route based on user type
    if (currentUser?.type === "business") {
      console.log("✅ Navigating to /subscription (business user)");
      navigate("/subscription");
    } else {
      console.log("✅ Navigating to /customer-benefits (customer user)");
      navigate("/customer-benefits");
    }
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

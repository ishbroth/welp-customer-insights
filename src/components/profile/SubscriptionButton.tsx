
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
  const { isSubscribed } = useAuth();

  const handleSubscriptionClick = () => {
    navigate("/subscription");
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

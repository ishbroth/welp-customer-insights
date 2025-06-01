
import { CheckCircle } from "lucide-react";

interface VerifiedBadgeProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const VerifiedBadge = ({ size = "md", className = "" }: VerifiedBadgeProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5", 
    lg: "h-6 w-6"
  };

  return (
    <CheckCircle 
      className={`text-blue-600 fill-blue-600 ${sizeClasses[size]} ${className}`}
      aria-label="Verified business"
    />
  );
};

export default VerifiedBadge;

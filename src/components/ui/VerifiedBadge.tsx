
import { Check, Ribbon } from "lucide-react";

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

  const checkSizeClasses = {
    sm: "h-2.5 w-2.5",
    md: "h-3 w-3",
    lg: "h-3.5 w-3.5"
  };

  return (
    <div className={`relative inline-flex ${className}`} aria-label="Verified business">
      <Ribbon 
        className={`text-blue-600 fill-blue-600 ${sizeClasses[size]}`}
      />
      <Check 
        className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white ${checkSizeClasses[size]}`}
      />
    </div>
  );
};

export default VerifiedBadge;

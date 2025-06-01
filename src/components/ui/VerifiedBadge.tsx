
import { Check } from "lucide-react";

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
    <div 
      className={`relative inline-flex items-center justify-center bg-blue-600 rounded-full ${sizeClasses[size]} ${className}`} 
      aria-label="Verified business"
    >
      <Check 
        className={`text-white ${checkSizeClasses[size]}`}
      />
    </div>
  );
};

export default VerifiedBadge;

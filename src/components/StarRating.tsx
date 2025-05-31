
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  grayedOut?: boolean;
}

const StarRating = ({ 
  rating, 
  max = 5, 
  size = "md", 
  className,
  grayedOut = false
}: StarRatingProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <div className={cn("flex", className)}>
      {[...Array(max)].map((_, i) => (
        <Star
          key={i}
          className={cn(
            sizeClasses[size],
            "transition-colors",
            grayedOut 
              ? "text-gray-300" 
              : i < rating 
                ? "text-yellow-400 fill-yellow-400" 
                : "text-gray-300"
          )}
        />
      ))}
    </div>
  );
};

export default StarRating;

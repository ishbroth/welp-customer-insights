
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
      {[...Array(max)].map((_, i) => {
        const starPosition = i + 1;
        const fillPercentage = Math.min(Math.max(rating - i, 0), 1);
        
        return (
          <div key={i} className="relative">
            {/* Background star (empty) */}
            <Star
              className={cn(
                sizeClasses[size],
                "transition-colors",
                grayedOut ? "text-gray-300" : "text-gray-300"
              )}
            />
            
            {/* Foreground star (filled) */}
            {fillPercentage > 0 && (
              <div 
                className="absolute top-0 left-0 overflow-hidden"
                style={{ width: `${fillPercentage * 100}%` }}
              >
                <Star
                  className={cn(
                    sizeClasses[size],
                    "transition-colors",
                    grayedOut ? "text-gray-300" : "text-yellow-400 fill-yellow-400"
                  )}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StarRating;

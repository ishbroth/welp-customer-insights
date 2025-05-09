
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import StarRating from "@/components/StarRating";
import { Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReviewItemProps {
  review: any;
  customerId: string;
  hasFullAccess: (customerId: string) => boolean;
  shouldShowLimitedReview: boolean;
}

const ReviewItem = ({ 
  review, 
  customerId, 
  hasFullAccess,
  shouldShowLimitedReview 
}: ReviewItemProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Function to get just the first 3 words of a review
  const getFirstThreeWords = (text: string) => {
    if (!text) return "";
    
    // Split the text into words and take the first 3
    const words = text.split(/\s+/);
    const firstThreeWords = words.slice(0, 3).join(" ");
    
    return `${firstThreeWords}...`;
  };
  
  const handleBuyFullReview = (customerId: string) => {
    toast({
      title: "Redirecting to payment",
      description: "You'll be redirected to the payment page to access all reviews for this customer.",
    });
    
    // Redirect directly to one-time payment page with customerId instead of reviewId
    navigate(`/one-time-review?customerId=${customerId}`);
  };

  return (
    <div className="border-t pt-3">
      <div className="flex justify-between">
        <div className="flex items-center">
          <StarRating rating={review.rating} size="sm" />
          <span className="text-xs text-gray-500 ml-2">
            {new Date(review.date).toLocaleDateString()}
          </span>
        </div>
        <div className="text-xs text-gray-500">
          by {review.reviewerName}
        </div>
      </div>
      <div className="mt-2">
        {shouldShowLimitedReview && !hasFullAccess(customerId) ? (
          <div>
            <p className="text-sm line-clamp-1">
              {getFirstThreeWords(review.content)}
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => handleBuyFullReview(customerId)}
            >
              <Lock className="h-3 w-3 mr-1" />
              Buy Full Review ($3.00)
            </Button>
          </div>
        ) : (
          <p className="text-sm whitespace-pre-line">{review.content}</p>
        )}
      </div>
    </div>
  );
};

export default ReviewItem;

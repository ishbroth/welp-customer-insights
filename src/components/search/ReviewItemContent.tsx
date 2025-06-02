
import { useAuth } from "@/contexts/auth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ReviewItemContentProps {
  review: {
    id: string;
    content: string;
  };
  fullReviewContent: string;
  hasFullAccess: boolean;
  customerData?: {
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
}

const ReviewItemContent = ({ 
  review, 
  fullReviewContent, 
  hasFullAccess, 
  customerData 
}: ReviewItemContentProps) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const getFirstThreeWords = (text: string): string => {
    const words = text.split(' ');
    const firstThree = words.slice(0, 3).join(' ');
    return `${firstThree}${words.length > 3 ? '...' : ''}`;
  };

  const handleUnlockReview = () => {
    // Store the review and customer data in sessionStorage for retrieval after signup/signin
    const reviewAccessData = {
      reviewId: review.id,
      customerData,
      searchParams: Object.fromEntries(searchParams.entries())
    };
    
    sessionStorage.setItem('pendingReviewAccess', JSON.stringify(reviewAccessData));
    
    // Navigate to signup page with unlock indicator
    navigate('/signup?unlock=review');
  };

  return (
    <div className="mt-2">
      {hasFullAccess ? (
        <div>
          <p className="text-gray-700">{fullReviewContent || review.content}</p>
          <Badge variant="outline" className="mt-2 text-xs">
            Full access
          </Badge>
        </div>
      ) : (
        <div>
          <p className="text-gray-700">{getFirstThreeWords(review.content)}</p>
          {currentUser ? (
            <Badge variant="secondary" className="mt-2 text-xs">
              Limited access
            </Badge>
          ) : (
            <div className="mt-3">
              <Button 
                onClick={handleUnlockReview}
                variant="outline" 
                size="sm"
                className="text-welp-primary border-welp-primary hover:bg-welp-primary hover:text-white"
              >
                Unlock Review
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewItemContent;

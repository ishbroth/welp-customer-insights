
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";
import StarRating from "@/components/StarRating";
import VerifiedBadge from "@/components/ui/VerifiedBadge";

interface ReviewItemHeaderProps {
  review: {
    id: string;
    reviewerId: string;
    reviewerName: string;
    rating: number;
    date: string;
    reviewerVerified?: boolean;
  };
  hasFullAccess: boolean;
}

const ReviewItemHeader = ({ review, hasFullAccess }: ReviewItemHeaderProps) => {
  const { isSubscribed } = useAuth();
  const navigate = useNavigate();

  const handleBusinessNameClick = () => {
    // Only allow navigation if user is subscribed or has access
    if (isSubscribed || hasFullAccess) {
      navigate(`/business/${review.reviewerId}`);
    }
  };

  return (
    <div className="flex justify-between items-start mb-2">
      <div>
        <div className="flex items-center gap-2">
          {(isSubscribed || hasFullAccess) ? (
            <h4 
              className="font-medium cursor-pointer text-blue-600 hover:text-blue-800 hover:underline"
              onClick={handleBusinessNameClick}
            >
              {review.reviewerName}
            </h4>
          ) : (
            <h4 className="font-medium">{review.reviewerName}</h4>
          )}
          {/* Show verified badge when reviewerVerified is true */}
          {review.reviewerVerified && (
            <VerifiedBadge size="sm" />
          )}
        </div>
        <div className="flex items-center mt-1">
          <StarRating 
            rating={review.rating} 
            grayedOut={!hasFullAccess}
          />
          <span className={`ml-2 text-sm ${!hasFullAccess ? 'text-gray-400' : 'text-gray-500'}`}>
            {review.rating}.0
          </span>
        </div>
      </div>
      <span className="text-sm text-gray-500">
        {new Date(review.date).toLocaleDateString()}
      </span>
    </div>
  );
};

export default ReviewItemHeader;


import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";
import VerifiedBadge from "@/components/ui/VerifiedBadge";

interface ReviewItemHeaderProps {
  review: {
    id: string;
    reviewerId: string;
    reviewerName: string;
    rating: number;
    content: string;
    date: string;
    reviewerVerified?: boolean;
  };
  hasFullAccess: boolean;
}

const ReviewItemHeader = ({ review, hasFullAccess }: ReviewItemHeaderProps) => {
  const { isSubscribed } = useAuth();
  const navigate = useNavigate();

  const handleBusinessClick = () => {
    if (isSubscribed || hasFullAccess) {
      navigate(`/business/${review.reviewerId}`);
    }
  };

  const getBusinessInitials = () => {
    if (review.reviewerName) {
      const names = review.reviewerName.split(' ');
      return names.map(name => name[0]).join('').toUpperCase().slice(0, 2);
    }
    return "B";
  };

  console.log(`ReviewItemHeader: Business ${review.reviewerName} verification status: ${review.reviewerVerified}`);

  return (
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center space-x-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src="" alt={review.reviewerName} />
          <AvatarFallback className="bg-blue-100 text-blue-800">
            {getBusinessInitials()}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            {(isSubscribed || hasFullAccess) ? (
              <h4 
                className="font-semibold cursor-pointer text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                onClick={handleBusinessClick}
              >
                {review.reviewerName}
              </h4>
            ) : (
              <h4 className="font-semibold">{review.reviewerName}</h4>
            )}
            {/* Show verified badge if business is verified */}
            {review.reviewerVerified && <VerifiedBadge size="sm" />}
          </div>
          <p className="text-sm text-gray-500">
            {new Date(review.date).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <Badge variant="secondary" className="ml-2">
          {review.rating}/5
        </Badge>
      </div>
    </div>
  );
};

export default ReviewItemHeader;

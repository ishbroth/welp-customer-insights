
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  console.log(`ReviewItemHeader: Rendering review from ${review.reviewerName}, verified: ${review.reviewerVerified}`);

  const getInitials = (name: string) => {
    if (name && name !== "Unknown Business") {
      const names = name.split(' ');
      return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return "UB"; // Unknown Business
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="flex items-start space-x-3 mb-3">
      <Avatar className="h-10 w-10">
        <AvatarImage src="" alt={review.reviewerName} />
        <AvatarFallback className="bg-blue-100 text-blue-800 text-sm">
          {getInitials(review.reviewerName)}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className={`font-medium text-sm ${!hasFullAccess ? 'text-gray-400' : 'text-gray-900'}`}>
            {hasFullAccess ? review.reviewerName : "Business Name"}
          </h4>
          {review.reviewerVerified && hasFullAccess && (
            <VerifiedBadge size="sm" />
          )}
        </div>
        
        <div className="flex items-center gap-2 mb-1">
          <div className="flex">
            {renderStars(review.rating)}
          </div>
          <span className={`text-xs ${!hasFullAccess ? 'text-gray-400' : 'text-gray-500'}`}>
            {formatDate(review.date)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReviewItemHeader;

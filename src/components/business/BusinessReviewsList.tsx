
import { useState } from "react";
import { Review } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Star, MoreVertical, Edit, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import { useVerifiedStatus } from "@/hooks/useVerifiedStatus";

interface BusinessReviewsListProps {
  reviews: Review[];
  setReviews: (reviews: Review[]) => void;
  hasSubscription: boolean;
  isLoading: boolean;
  onDeleteReview: (reviewId: string) => void;
}

const BusinessReviewsList = ({ 
  reviews, 
  hasSubscription, 
  isLoading,
  onDeleteReview 
}: BusinessReviewsListProps) => {
  const [showAllReviews, setShowAllReviews] = useState(false);

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long', 
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

  const getCustomerInitials = (name: string) => {
    if (name) {
      const names = name.split(' ');
      return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return "C";
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ea384c] mx-auto mb-4"></div>
        <p className="text-gray-500">Loading your reviews...</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card className="p-8 text-center">
        <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
        <p className="text-gray-500 mb-4">
          You haven't written any customer reviews yet.
        </p>
        <Link to="/new-review">
          <Button className="bg-[#ea384c] hover:bg-[#d63384] text-white">
            Write Your First Review
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {displayedReviews.map((review) => (
        <BusinessReviewCard 
          key={review.id} 
          review={review} 
          onDeleteReview={onDeleteReview}
        />
      ))}
      
      {reviews.length > 3 && !showAllReviews && (
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={() => setShowAllReviews(true)}
          >
            Show All {reviews.length} Reviews
          </Button>
        </div>
      )}
    </div>
  );
};

interface BusinessReviewCardProps {
  review: Review;
  onDeleteReview: (reviewId: string) => void;
}

const BusinessReviewCard = ({ review, onDeleteReview }: BusinessReviewCardProps) => {
  const { isVerified } = useVerifiedStatus(review.reviewerId);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long', 
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

  const getCustomerInitials = (name: string) => {
    if (name) {
      const names = name.split(' ');
      return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return "C";
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gray-100 text-gray-800">
                {getCustomerInitials(review.customerName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{review.customerName}</h3>
                {isVerified && <VerifiedBadge size="sm" />}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex">{renderStars(review.rating)}</div>
                <span className="text-sm text-gray-500">
                  {formatDate(review.date)}
                </span>
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white">
              <DropdownMenuItem asChild>
                <Link to={`/edit-review/${review.id}`} className="flex items-center">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Review
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDeleteReview(review.id)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Review
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mb-4">
          <p className="text-gray-700 whitespace-pre-line">{review.content}</p>
        </div>

        <div className="text-sm text-gray-500 space-y-1">
          {review.address && (
            <p><strong>Address:</strong> {review.address}</p>
          )}
          {review.city && (
            <p><strong>City:</strong> {review.city}</p>
          )}
          {review.zipCode && (
            <p><strong>ZIP Code:</strong> {review.zipCode}</p>
          )}
          {(review as any).phone && (
            <p><strong>Phone:</strong> {(review as any).phone}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessReviewsList;

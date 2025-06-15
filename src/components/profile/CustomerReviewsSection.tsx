
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import StarRating from "@/components/StarRating";
import ReviewReactions from "@/components/ReviewReactions";
import CustomerReviewResponse from "@/components/customer/CustomerReviewResponse";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import { useAuth } from "@/contexts/auth";
import { useVerifiedStatus } from "@/hooks/useVerifiedStatus";

interface CustomerReview {
  id: string;
  reviewerName: string;
  reviewerId: string;
  reviewerAvatar?: string;
  rating: number;
  content: string;
  date: string;
  reactions?: {
    like: string[];
    funny: string[];
    useful: string[];
    ohNo: string[];
  };
  responses?: any[];
}

interface CustomerReviewsSectionProps {
  customerReviews: CustomerReview[];
  isLoading: boolean;
}

const CustomerReviewsSection = ({ customerReviews, isLoading }: CustomerReviewsSectionProps) => {
  const { isSubscribed, hasOneTimeAccess } = useAuth();

  const getBusinessInitials = (name: string) => {
    if (name) {
      const names = name.split(' ');
      return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return "B";
  };

  const handleReactionToggle = (reviewId: string, reactionType: string) => {
    console.log(`Reaction ${reactionType} toggled for review ${reviewId}`);
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">What Businesses Say About You</h2>
        <Button variant="outline" size="sm" asChild>
          <Link to="/profile/reviews">
            See All Reviews
          </Link>
        </Button>
      </div>
      
      {isLoading ? (
        <div className="text-center p-4">
          <p className="text-gray-500">Loading your reviews...</p>
        </div>
      ) : customerReviews.length > 0 ? (
        <div className="space-y-4">
          {customerReviews.slice(0, 3).map((review) => {
            const BusinessReviewItem = ({ review }: { review: CustomerReview }) => {
              const { isVerified } = useVerifiedStatus(review.reviewerId);
              
              return (
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  {/* Review header with business info */}
                  <div className="flex items-start space-x-4 mb-4">
                    <Link to={`/business/${review.reviewerId}`} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={review.reviewerAvatar || ""} alt={review.reviewerName} />
                        <AvatarFallback className="bg-blue-100 text-blue-800">
                          {getBusinessInitials(review.reviewerName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg hover:text-blue-600 transition-colors">{review.reviewerName}</h3>
                          {/* Show verified badge next to business name */}
                          {isVerified && <VerifiedBadge size="sm" />}
                        </div>
                        <p className="text-sm text-gray-500">
                          Review written on {new Date(review.date).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                    <div className="ml-auto">
                      <StarRating rating={review.rating} />
                    </div>
                  </div>

                  {/* Review content */}
                  <div className="mb-4">
                    <p className="text-gray-700 whitespace-pre-line">{review.content}</p>
                  </div>

                  {/* Reactions section */}
                  <div className="border-t pt-4 mb-4">
                    <div className="text-sm text-gray-500 mb-2">React to this review:</div>
                    <ReviewReactions 
                      reviewId={review.id}
                      customerId={review.reviewerId}
                      businessId={review.reviewerId}
                      businessName={review.reviewerName}
                      businessAvatar={review.reviewerAvatar}
                      reactions={review.reactions || { like: [], funny: [], useful: [], ohNo: [] }}
                      onReactionToggle={handleReactionToggle}
                    />
                  </div>

                  {/* Customer review responses component */}
                  <CustomerReviewResponse 
                    reviewId={review.id}
                    responses={review.responses || []}
                    hasSubscription={isSubscribed}
                    isOneTimeUnlocked={hasOneTimeAccess(review.id)}
                    hideReplyOption={!isSubscribed}
                    reviewAuthorId={review.reviewerId}
                  />
                </div>
              );
            };

            return <BusinessReviewItem key={review.id} review={review} />;
          })}
        </div>
      ) : (
        <div className="text-center p-4">
          <p className="text-gray-500">
            No businesses have written reviews about you yet.
          </p>
        </div>
      )}
    </Card>
  );
};

export default CustomerReviewsSection;

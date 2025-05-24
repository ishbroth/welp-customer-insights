
import React from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Review } from "@/types";
import StarRating from "@/components/StarRating";
import ReviewReactions from "@/components/ReviewReactions";

interface BusinessReviewCardProps {
  review: Review;
  hasSubscription: boolean;
  onEdit: (review: Review) => void;
  onDelete: (reviewId: string) => void;
  onReactionToggle: (reviewId: string, reactionType: string) => void;
}

const BusinessReviewCard: React.FC<BusinessReviewCardProps> = ({
  review,
  hasSubscription,
  onEdit,
  onDelete,
  onReactionToggle,
}) => {
  const navigate = useNavigate();

  const handleCustomerClick = () => {
    if (review.customerId) {
      navigate(`/customer/${review.customerId}`);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return "Unknown date";
    }
  };

  const getCustomerInitials = () => {
    if (review.customerName) {
      const names = review.customerName.split(' ');
      return names.map(name => name[0]).join('').toUpperCase().slice(0, 2);
    }
    return "?";
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border relative">
      {/* Review header */}
      <div className="flex items-start space-x-4 mb-4">
        <div 
          className="cursor-pointer"
          onClick={handleCustomerClick}
        >
          <Avatar className="h-12 w-12">
            <AvatarImage src="" alt={review.customerName} />
            <AvatarFallback className="bg-gray-200 text-gray-800">
              {getCustomerInitials()}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 
                className="font-semibold text-lg cursor-pointer hover:text-blue-600"
                onClick={handleCustomerClick}
              >
                {review.customerName}
              </h3>
              <p className="text-sm text-gray-500">
                Review written on {formatDate(review.date)}
              </p>
            </div>
            <StarRating rating={review.rating} />
          </div>
          
          {/* Customer location info */}
          {(review.address || review.city || review.zipCode) && (
            <div className="mt-2 text-sm text-gray-600">
              {review.address && <span>{review.address}</span>}
              {review.city && (
                <span>
                  {review.address ? ', ' : ''}{review.city}
                </span>
              )}
              {review.zipCode && (
                <span> {review.zipCode}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Review content */}
      <div className="mb-4">
        <p className="text-gray-700 whitespace-pre-line">{review.content}</p>
      </div>

      {/* Reactions section */}
      <div className="border-t pt-4 mb-4">
        <div className="text-sm text-gray-500 mb-2">Your reactions:</div>
        <ReviewReactions 
          reviewId={review.id}
          customerId={review.customerId}
          businessId={review.reviewerId}
          businessName={review.reviewerName}
          businessAvatar={review.reviewerAvatar}
          reactions={review.reactions || { like: [], funny: [], useful: [], ohNo: [] }}
          onReactionToggle={onReactionToggle}
        />
      </div>

      {/* Action buttons moved to bottom */}
      <div className="flex justify-end space-x-2 pt-2 border-t">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onEdit(review)}
          className="bg-white hover:bg-gray-100 shadow-sm"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onDelete(review.id)}
          className="bg-white hover:bg-gray-100 text-red-500 hover:text-red-700 shadow-sm"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Responses section would go here if implemented */}
    </div>
  );
};

export default BusinessReviewCard;

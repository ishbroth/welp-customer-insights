
import React, { useState } from "react";
import StarRating from "@/components/StarRating";
import { formatDistance } from "date-fns";
import { Button } from "@/components/ui/button";
import { MessageSquare, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { Review } from "@/types";
import CustomerReviewResponse from "@/components/customer/CustomerReviewResponse";

interface ReviewCardProps {
  review: Review;
  hasSubscription: boolean;
  isOneTimeUnlocked: boolean;
  onResponseSubmitted?: (response: any) => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  hasSubscription,
  isOneTimeUnlocked,
  onResponseSubmitted,
}) => {
  const { currentUser } = useAuth();
  const [showResponses, setShowResponses] = useState(false);
  const [responses, setResponses] = useState<any[]>([]);

  const handleToggleResponses = () => {
    setShowResponses(!showResponses);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center mb-2">
            <StarRating rating={review.rating} />
            <span className="ml-2 text-sm text-gray-500">
              {formatDistance(new Date(review.date), new Date(), {
                addSuffix: true,
              })}
            </span>
          </div>
          <p className="text-gray-700">{review.content}</p>
        </div>
      </div>
      
      {showResponses && (
        <CustomerReviewResponse 
          reviewId={review.id}
          responses={responses}
          hasSubscription={hasSubscription}
          isOneTimeUnlocked={isOneTimeUnlocked}
          hideReplyOption={false}
          reviewAuthorId={review.reviewerId}
          onResponseSubmitted={(response) => {
            setResponses(prev => [...prev, response]);
            if (onResponseSubmitted) {
              onResponseSubmitted(response);
            }
          }}
        />
      )}
    </div>
  );
};

export default ReviewCard;

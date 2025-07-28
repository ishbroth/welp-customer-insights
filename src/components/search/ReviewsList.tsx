
import React from "react";
import { Customer } from "@/types/search";
import ReviewCard from "./ReviewCard";

interface ReviewsListProps {
  reviews: any[];
  hasFullAccess: (customerId: string) => boolean;
  customerData: Customer;
  onReviewUpdate?: () => void;
}

const ReviewsList = ({ reviews, hasFullAccess, customerData, onReviewUpdate }: ReviewsListProps) => {
  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {reviews.map((review, index) => (
        <ReviewCard
          key={`review-${review.id || index}`}
          review={{
            ...review,
            // Map customer_name to customerName for proper display
            customerName: review.customer_name || customerData.firstName + ' ' + customerData.lastName || 'Unknown Customer'
          }}
          hasSubscription={hasFullAccess(customerData.id)}
          isOneTimeUnlocked={false}
        />
      ))}
    </div>
  );
};

export default ReviewsList;


import React from "react";
import { Customer } from "@/types/search";
import ReviewCard from "./ReviewCard";
import { logger } from '@/utils/logger';

interface ReviewsListProps {
  reviews: any[];
  hasFullAccess: (customerId: string) => boolean;
  customerData: Customer;
  onReviewUpdate?: () => void;
}

const ReviewsList = ({ reviews, hasFullAccess, customerData, onReviewUpdate }: ReviewsListProps) => {
  const componentLogger = logger.withContext('ReviewsList');

  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {reviews.map((review, index) => {
        // Debug what we're getting from the search results
        componentLogger.debug("Processing review", {
          id: review.id,
          isAssociateMatch: review.isAssociateMatch,
          original_customer_name: review.original_customer_name,
          customer_name: review.customer_name,
          customerName: review.customerName,
          associateData: review.associateData
        });

        componentLogger.debug("Logic check", {
          isAssociateMatch: review.isAssociateMatch,
          hasOriginalName: !!review.original_customer_name,
          originalName: review.original_customer_name,
          willUseOriginal: review.isAssociateMatch && review.original_customer_name
        });

        // Always use the actual customer name (the person being reviewed), not the search target
        const finalCustomerName = review.customerName || review.customer_name || customerData.firstName + ' ' + customerData.lastName || 'Unknown Customer';

        componentLogger.debug("Final customer name set to:", finalCustomerName);
        componentLogger.debug("Passing to ReviewCard:", {
          associates: review.associates,
          customer_business_name: review.customer_business_name,
          customer_nickname: review.customer_nickname,
          isAssociateMatch: review.isAssociateMatch
        });

        return (
          <ReviewCard
            key={`review-${review.id || index}`}
            review={{
              ...review,
              customerName: finalCustomerName
            }}
            hasSubscription={hasFullAccess(customerData.id)}
            isOneTimeUnlocked={false}
          />
        );
      })}
    </div>
  );
};

export default ReviewsList;

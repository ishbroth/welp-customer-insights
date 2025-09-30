
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
      {reviews.map((review, index) => {
        // Debug what we're getting from the search results
        console.log("ReviewsList: Processing review", {
          id: review.id,
          isAssociateMatch: review.isAssociateMatch,
          original_customer_name: review.original_customer_name,
          customer_name: review.customer_name,
          customerName: review.customerName,
          associateData: review.associateData
        });

        console.log("ReviewsList: Logic check", {
          isAssociateMatch: review.isAssociateMatch,
          hasOriginalName: !!review.original_customer_name,
          originalName: review.original_customer_name,
          willUseOriginal: review.isAssociateMatch && review.original_customer_name
        });

        const finalCustomerName = review.isAssociateMatch && review.original_customer_name
          ? review.original_customer_name
          : (review.customerName || review.customer_name || customerData.firstName + ' ' + customerData.lastName || 'Unknown Customer');

        console.log("ReviewsList: Final customer name set to:", finalCustomerName);
        console.log("🔍 REVIEWS LIST - Passing to ReviewCard:", {
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

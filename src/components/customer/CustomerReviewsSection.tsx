
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ReviewsList from "@/components/search/ReviewsList";

interface CustomerReviewsSectionProps {
  customerId: string;
  customerReviews: any[];
  hasFullAccess: (id: string) => boolean;
  customerProfile: any;
}

const CustomerReviewsSection: React.FC<CustomerReviewsSectionProps> = ({
  customerId,
  customerReviews,
  hasFullAccess,
  customerProfile
}) => {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
      <ReviewsList 
        customerId={customerId || ''}
        reviews={customerReviews}
        hasFullAccess={hasFullAccess}
        isReviewCustomer={false}
        customerProfile={customerProfile}
      />
    </div>
  );
};

export default CustomerReviewsSection;

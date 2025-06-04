
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
        reviews={customerReviews}
        hasFullAccess={hasFullAccess}
        customerData={{
          id: customerId,
          firstName: customerProfile?.first_name || '',
          lastName: customerProfile?.last_name || '',
          phone: customerProfile?.phone,
          address: customerProfile?.address,
          city: customerProfile?.city,
          state: customerProfile?.state,
          zipCode: customerProfile?.zipcode
        }}
      />
    </div>
  );
};

export default CustomerReviewsSection;


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
      {customerReviews.length > 0 ? (
        <ReviewsList 
          customerId={customerId || ''}
          reviews={customerReviews}
          hasFullAccess={hasFullAccess}
        />
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No reviews available for this customer yet.</p>
          <Link 
            to={`/review/new?firstName=${encodeURIComponent(customerProfile.first_name || '')}&lastName=${encodeURIComponent(customerProfile.last_name || '')}&phone=${encodeURIComponent(customerProfile.phone || '')}&address=${encodeURIComponent(customerProfile.address || '')}&city=${encodeURIComponent(customerProfile.city || '')}&zipCode=${encodeURIComponent(customerProfile.zipcode || '')}`}
            className="mt-4 inline-block"
          >
            <Button>
              Write a Review
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default CustomerReviewsSection;

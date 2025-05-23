
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface NoReviewsProps {
  customerProfile: any;
}

const NoReviews: React.FC<NoReviewsProps> = ({ customerProfile }) => {
  return (
    <div className="text-center py-8 bg-gray-50 rounded-lg">
      <p className="text-gray-500">No reviews available for this customer yet.</p>
      <Link 
        to={`/review/new?firstName=${encodeURIComponent(customerProfile?.first_name || '')}&lastName=${encodeURIComponent(customerProfile?.last_name || '')}&phone=${encodeURIComponent(customerProfile?.phone || '')}&address=${encodeURIComponent(customerProfile?.address || '')}&city=${encodeURIComponent(customerProfile?.city || '')}&zipCode=${encodeURIComponent(customerProfile?.zipcode || '')}`}
        className="mt-4 inline-block"
      >
        <Button>
          Write a Review
        </Button>
      </Link>
    </div>
  );
};

export default NoReviews;

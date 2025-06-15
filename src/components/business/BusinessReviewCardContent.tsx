
import React from "react";
import { Review } from "@/types";

interface BusinessReviewCardContentProps {
  review: Review;
}

const BusinessReviewCardContent: React.FC<BusinessReviewCardContentProps> = ({
  review,
}) => {
  return (
    <div className="mb-4">
      <p className="text-gray-700 whitespace-pre-line">{review.content}</p>
    </div>
  );
};

export default BusinessReviewCardContent;

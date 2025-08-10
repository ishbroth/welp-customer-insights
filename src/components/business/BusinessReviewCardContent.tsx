
import React from "react";
import { Review } from "@/types";

interface BusinessReviewCardContentProps {
  review: Review;
}

const BusinessReviewCardContent: React.FC<BusinessReviewCardContentProps> = ({
  review,
}) => {
  return (
    <div className="mb-3">
      <p className="text-gray-700 whitespace-pre-line text-base md:text-base leading-relaxed break-words">{review.content}</p>
    </div>
  );
};

export default BusinessReviewCardContent;

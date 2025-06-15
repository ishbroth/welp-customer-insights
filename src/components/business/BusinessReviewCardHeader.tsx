
import React from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import StarRating from "@/components/StarRating";
import CustomerReactions from "./CustomerReactions";
import { Review } from "@/types";

interface BusinessReviewCardHeaderProps {
  review: Review;
  formatDate: (dateString: string) => string;
  getCustomerInitials: () => string;
  handleCustomerClick: () => void;
}

const BusinessReviewCardHeader: React.FC<BusinessReviewCardHeaderProps> = ({
  review,
  formatDate,
  getCustomerInitials,
  handleCustomerClick,
}) => {
  return (
    <div className="flex items-start space-x-4 mb-4">
      <div 
        className="cursor-pointer"
        onClick={handleCustomerClick}
      >
        <Avatar className="h-12 w-12">
          <AvatarImage src={review.customerAvatar || ""} alt={review.customerName} />
          <AvatarFallback className="bg-gray-200 text-gray-800">
            {getCustomerInitials()}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 
                className="font-semibold text-lg cursor-pointer hover:text-blue-600"
                onClick={handleCustomerClick}
              >
                {review.customerName}
              </h3>
              <CustomerReactions reactions={review.reactions || { like: [], funny: [], ohNo: [] }} />
            </div>
            <p className="text-sm text-gray-500">
              Review written on {formatDate(review.date)}
            </p>
          </div>
          <StarRating rating={review.rating} />
        </div>
        
        {/* Customer location info */}
        {(review.address || review.city || review.zipCode) && (
          <div className="mt-2 text-sm text-gray-600">
            {review.address && <span>{review.address}</span>}
            {review.city && (
              <span>
                {review.address ? ', ' : ''}{review.city}
              </span>
            )}
            {review.zipCode && (
              <span> {review.zipCode}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessReviewCardHeader;

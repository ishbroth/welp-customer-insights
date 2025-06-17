
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Review } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface BusinessReviewCardHeaderProps {
  review: Review;
  formatDate: (date: string) => string;
  getCustomerInitials: (name: string) => string;
  handleCustomerClick: () => void;
}

const BusinessReviewCardHeader: React.FC<BusinessReviewCardHeaderProps> = ({
  review,
  formatDate,
  getCustomerInitials,
  handleCustomerClick,
}) => {
  // Fetch business profile for avatar - this ensures we always try to get the business avatar
  const { data: businessProfile } = useQuery({
    queryKey: ['businessProfile', review.reviewerId],
    queryFn: async () => {
      if (!review.reviewerId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, avatar, name')
        .eq('id', review.reviewerId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching business profile:", error);
        return null;
      }
      return data;
    },
    enabled: !!review.reviewerId
  });

  // Fetch customer profile for avatar when review is claimed
  const { data: customerProfile } = useQuery({
    queryKey: ['customerProfile', review.customerId],
    queryFn: async () => {
      if (!review.customerId) return null;
      
      console.log('BusinessReviewCardHeader: Fetching customer profile for ID:', review.customerId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, avatar, first_name, last_name, name')
        .eq('id', review.customerId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching customer profile:", error);
        return null;
      }
      
      console.log('BusinessReviewCardHeader: Customer profile found:', data);
      return data;
    },
    enabled: !!review.customerId
  });

  const getBusinessInitials = () => {
    if (review.reviewerName) {
      const names = review.reviewerName.split(' ');
      return names.map(name => name[0]).join('').toUpperCase().slice(0, 2);
    }
    return "B";
  };

  // Use avatar from review data first, then from fetched profile, then fallback
  const businessAvatar = review.reviewerAvatar || businessProfile?.avatar || '';
  const businessName = review.reviewerName || businessProfile?.name || 'Business';

  // Get customer info - use profile data if available, fallback to review data
  let customerAvatar = '';
  let customerDisplayName = review.customerName || 'Customer';

  if (customerProfile) {
    customerAvatar = customerProfile.avatar || '';
    
    // Construct name from profile if available
    if (customerProfile.first_name && customerProfile.last_name) {
      customerDisplayName = `${customerProfile.first_name} ${customerProfile.last_name}`;
    } else if (customerProfile.first_name) {
      customerDisplayName = customerProfile.first_name;
    } else if (customerProfile.last_name) {
      customerDisplayName = customerProfile.last_name;
    } else if (customerProfile.name && customerProfile.name.trim()) {
      customerDisplayName = customerProfile.name;
    }
  }

  console.log('BusinessReviewCardHeader: Customer info:', {
    reviewId: review.id,
    customerId: review.customerId,
    customerAvatar,
    customerDisplayName,
    hasProfile: !!customerProfile
  });

  console.log('BusinessReviewCardHeader: Business avatar info:', {
    reviewId: review.id,
    reviewerAvatar: review.reviewerAvatar,
    profileAvatar: businessProfile?.avatar,
    finalAvatar: businessAvatar,
    businessName: businessName
  });

  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center space-x-3">
        {/* Business Avatar */}
        <Avatar className="h-10 w-10">
          {businessAvatar ? (
            <AvatarImage src={businessAvatar} alt={businessName} />
          ) : (
            <AvatarFallback className="bg-blue-100 text-blue-800">
              {getBusinessInitials()}
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <h3 className="font-semibold">{businessName}</h3>
          <p className="text-sm text-gray-500">
            Review written on {formatDate(review.date)}
          </p>
        </div>
      </div>
      
      {/* Customer Info */}
      <div 
        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
        onClick={handleCustomerClick}
      >
        <Avatar className="h-8 w-8">
          {customerAvatar ? (
            <AvatarImage src={customerAvatar} alt={customerDisplayName} />
          ) : (
            <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
              {getCustomerInitials(customerDisplayName)}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-700">{customerDisplayName}</p>
          <p className="text-xs text-gray-500">Customer</p>
        </div>
      </div>
    </div>
  );
};

export default BusinessReviewCardHeader;

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import { Review } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCustomerNameWithNickname } from "@/utils/nameFormatter";
import { Eye } from "lucide-react";

interface BusinessReviewCardHeaderProps {
  review: Review;
  formatDate: (date: string) => string;
  getCustomerInitials: (name: string) => string;
  handleCustomerClick: () => void;
  isReviewClaimed: boolean;
}

const BusinessReviewCardHeader: React.FC<BusinessReviewCardHeaderProps> = ({
  review,
  formatDate,
  getCustomerInitials,
  handleCustomerClick,
  isReviewClaimed,
}) => {
  // Fetch customer profile for avatar and contact info when review is claimed
  const { data: customerProfile } = useQuery({
    queryKey: ['customerProfile', review.customerId],
    queryFn: async () => {
      if (!review.customerId) return null;
      
      console.log('BusinessReviewCardHeader: Fetching customer profile for ID:', review.customerId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, avatar, first_name, last_name, name, phone, address, city, state, zipcode')
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

  // Get customer info - use profile data if available, fallback to review data
  let customerAvatar = '';
  let customerDisplayName = review.customerName || 'Customer';
  let customerPhone = review.customer_phone || '';
  let customerAddress = review.customer_address || '';
  let customerCity = review.customer_city || '';
  let customerZipcode = review.customer_zipcode || '';

  console.log("BusinessReviewCardHeader: Initial customer data:", {
    reviewCustomerName: review.customerName,
    customerDisplayName,
    customer_nickname: (review as any).customer_nickname,
    reviewObject: review
  });

  if (customerProfile) {
    customerAvatar = customerProfile.avatar || '';

    // Construct name from profile - prioritize first_name + last_name for customers
    if (customerProfile.first_name && customerProfile.last_name) {
      customerDisplayName = `${customerProfile.first_name} ${customerProfile.last_name}`;
    } else if (customerProfile.first_name) {
      customerDisplayName = customerProfile.first_name;
    } else if (customerProfile.last_name) {
      customerDisplayName = customerProfile.last_name;
    } else if (customerProfile.name && customerProfile.name.trim()) {
      customerDisplayName = customerProfile.name;
    }
    // If no profile name available, keep the review's customerName

    // Use profile contact info if available, otherwise fallback to review data
    customerPhone = customerProfile.phone || customerPhone;
    customerAddress = customerProfile.address || customerAddress;
    customerCity = customerProfile.city || customerCity;
    customerZipcode = customerProfile.zipcode || customerZipcode;
  }

  // Apply nickname formatting to the display name
  customerDisplayName = formatCustomerNameWithNickname(customerDisplayName, (review as any).customer_nickname);

  // Format the address display
  const formatAddress = () => {
    const parts = [];
    if (customerAddress) parts.push(customerAddress);
    if (customerCity) parts.push(customerCity);
    if (customerZipcode) parts.push(customerZipcode);
    return parts.join(', ');
  };

  console.log('BusinessReviewCardHeader: Customer info display:', {
    reviewId: review.id,
    customerId: review.customerId,
    customerDisplayName,
    customerAvatar,
    customerPhone,
    address: formatAddress(),
    hasProfile: !!customerProfile
  });
  
  console.log('BusinessReviewCardHeader: Review date debug:', {
    reviewId: review.id,
    reviewDate: review.date,
    reviewDateType: typeof review.date,
    reviewObject: review
  });

  console.log('🔍 BusinessReviewCardHeader: is_anonymous check:', {
    reviewId: review.id,
    customerName: review.customerName,
    is_anonymous: review.is_anonymous,
    is_anonymous_type: typeof review.is_anonymous
  });

  const getInitials = (name: string) => {
    if (name) {
      const names = name.split(' ');
      return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return "B";
  };

  const truncateBusinessName = (name: string, maxLength: number = 10) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  };

  // Business info
  const businessInfo = {
    name: review.reviewerName,
    avatar: review.reviewerAvatar,
    verified: review.reviewerVerified
  };

  return (
    <div className="mb-4 relative">
      {/* Anonymous badge - positioned at top right for both mobile and desktop */}
      {review.is_anonymous && (
        <div className="absolute top-0 right-0 inline-flex items-center gap-1.5 bg-purple-100 text-purple-700 px-2.5 py-1 rounded-md text-xs font-medium">
          <span className="text-base">🕵️</span>
          <span>Reviewed Anonymously</span>
        </div>
      )}

      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="flex items-start justify-between w-full pr-24">
          {/* Customer side (left) - takes most space */}
          <div className="flex items-center space-x-3 flex-1">
            <Avatar
              className={`h-10 w-10 ${isReviewClaimed ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
              onClick={isReviewClaimed ? handleCustomerClick : undefined}
            >
              {customerAvatar ? (
                <AvatarImage src={customerAvatar} alt={customerDisplayName} />
              ) : (
                <AvatarFallback className="bg-blue-100 text-blue-800">
                  {getCustomerInitials(customerDisplayName)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1">
              <h3
                className={`font-semibold ${
                  isReviewClaimed
                    ? 'cursor-pointer hover:text-blue-600 transition-colors text-blue-600'
                    : 'text-gray-600'
                }`}
                onClick={isReviewClaimed ? handleCustomerClick : undefined}
              >
                {customerDisplayName}
              </h3>
              <p className="text-sm text-gray-500">
                Review written on {formatDate(review.date)}
              </p>
              {customerPhone && (
                <p className="text-sm text-gray-600">
                  Phone: {customerPhone}
                </p>
              )}
              {formatAddress() && (
                <p className="text-sm text-gray-600">
                  Address: {formatAddress()}
                </p>
              )}
            </div>
          </div>

          {/* Business side (right) - smaller and compact */}
          <div className="flex items-center space-x-1 ml-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={businessInfo.avatar} alt={businessInfo.name} />
              <AvatarFallback className="bg-blue-100 text-blue-800 text-xs">
                {getInitials(businessInfo.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1">
                <h4
                  className="font-medium text-xs"
                  title={businessInfo.name}
                >
                  {truncateBusinessName(businessInfo.name)}
                </h4>
                {businessInfo.verified && <VerifiedBadge size="xs" />}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="flex items-start justify-between pr-28">
          <div className="flex items-center space-x-3 flex-1">
            {/* Customer Avatar - shows profile pic when claimed, initials when not */}
            <Avatar
              className={`h-10 w-10 ${isReviewClaimed ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
              onClick={isReviewClaimed ? handleCustomerClick : undefined}
            >
              {customerAvatar ? (
                <AvatarImage src={customerAvatar} alt={customerDisplayName} />
              ) : (
                <AvatarFallback className="bg-blue-100 text-blue-800">
                  {getCustomerInitials(customerDisplayName)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1">
              <h3
                className={`font-semibold ${
                  isReviewClaimed
                    ? 'cursor-pointer hover:text-blue-600 transition-colors text-blue-600'
                    : 'text-gray-600'
                }`}
                onClick={isReviewClaimed ? handleCustomerClick : undefined}
              >
                {customerDisplayName}
              </h3>
              <p className="text-sm text-gray-500">
                Review written on {formatDate(review.date)}
              </p>
              {customerPhone && (
                <p className="text-sm text-gray-600">
                  Phone: {customerPhone}
                </p>
              )}
              {formatAddress() && (
                <p className="text-sm text-gray-600">
                  Address: {formatAddress()}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessReviewCardHeader;

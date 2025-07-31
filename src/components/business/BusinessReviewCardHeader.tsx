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

  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center space-x-3">
        {/* Customer Avatar - shows profile pic when claimed, initials when not */}
        <Avatar 
          className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleCustomerClick}
        >
          {customerAvatar ? (
            <AvatarImage src={customerAvatar} alt={customerDisplayName} />
          ) : (
            <AvatarFallback className="bg-blue-100 text-blue-800">
              {getCustomerInitials(customerDisplayName)}
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <h3 
            className="font-semibold cursor-pointer hover:text-blue-600 transition-colors"
            onClick={handleCustomerClick}
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
  );
};

export default BusinessReviewCardHeader;

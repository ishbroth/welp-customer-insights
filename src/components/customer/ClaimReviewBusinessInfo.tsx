
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getBusinessInitials } from "./enhancedReviewCardUtils";

interface BusinessProfile {
  id?: string;
  name?: string;
  avatar?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  bio?: string;
  business_info?: {
    business_name?: string;
    website?: string;
    business_category?: string;
    business_subcategory?: string;
  };
}

interface ClaimReviewBusinessInfoProps {
  businessName: string;
  businessAvatar: string;
  displayData: BusinessProfile | null;
  fullBusinessProfile: BusinessProfile | null;
}

const ClaimReviewBusinessInfo: React.FC<ClaimReviewBusinessInfoProps> = ({
  businessName,
  businessAvatar,
  displayData,
  fullBusinessProfile,
}) => {
  // Check if we have comprehensive business information to display
  const hasBusinessInfo = displayData?.name || 
                         displayData?.phone || 
                         displayData?.address || 
                         displayData?.city || 
                         displayData?.state ||
                         displayData?.zipcode ||
                         (fullBusinessProfile?.business_info && fullBusinessProfile.business_info.website);

  if (!hasBusinessInfo) {
    return (
      <div className="bg-gray-50 p-4 rounded-md">
        <p className="text-sm text-gray-600 italic">
          Business information is not available for this review.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-4 rounded-md space-y-3">
      <div className="flex items-center space-x-3">
        <Avatar className="h-12 w-12">
          {businessAvatar ? (
            <AvatarImage src={businessAvatar} alt={businessName} />
          ) : (
            <AvatarFallback className="bg-blue-100 text-blue-800">
              {getBusinessInitials(businessName)}
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <h3 className="font-semibold text-lg">{businessName}</h3>
          {fullBusinessProfile?.business_info?.business_category && (
            <p className="text-sm text-gray-600">{fullBusinessProfile.business_info.business_category}</p>
          )}
        </div>
      </div>
      
      <div className="space-y-2 ml-15">
        {displayData?.phone && (
          <div>
            <span className="font-medium">Phone: </span>
            <span>{displayData.phone}</span>
          </div>
        )}
        {displayData?.address && (
          <div>
            <span className="font-medium">Address: </span>
            <span>{displayData.address}</span>
          </div>
        )}
        {(displayData?.city || displayData?.state || displayData?.zipcode) && (
          <div>
            <span className="font-medium">Location: </span>
            <span>
              {displayData.city}
              {displayData.city && displayData.state ? ", " : ""}
              {displayData.state} {displayData.zipcode}
            </span>
          </div>
        )}
        {fullBusinessProfile?.business_info?.website && (
          <div>
            <span className="font-medium">Website: </span>
            <span className="text-blue-600">{fullBusinessProfile.business_info.website}</span>
          </div>
        )}
        {fullBusinessProfile?.bio && (
          <div>
            <span className="font-medium">About: </span>
            <span>{fullBusinessProfile.bio}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaimReviewBusinessInfo;

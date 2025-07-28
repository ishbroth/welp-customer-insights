
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getBusinessInitials } from "./enhancedReviewCardUtils";
import VerifiedBadge from "@/components/ui/VerifiedBadge";

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
  verified?: boolean;
  business_info?: {
    business_name?: string;
    website?: string;
    business_category?: string;
    business_subcategory?: string;
    license_type?: string;
    license_number?: string;
    license_state?: string;
    verified?: boolean;
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
  // Use the most complete data source available
  const businessData = fullBusinessProfile || displayData;
  const finalBusinessName = businessData?.business_info?.business_name || businessData?.name || businessName;
  const finalBusinessAvatar = businessData?.avatar || businessAvatar;
  const isVerified = businessData?.verified || businessData?.business_info?.verified || false;

  console.log('ClaimReviewBusinessInfo: Rendering with data:', {
    businessName,
    finalBusinessName,
    businessData: businessData ? 'found' : 'not found',
    hasBusinessInfo: businessData?.business_info ? 'yes' : 'no',
    licenseType: businessData?.business_info?.license_type,
    website: businessData?.business_info?.website,
    category: businessData?.business_info?.business_category,
    isVerified
  });

  return (
    <div className="bg-gray-50 p-4 rounded-md space-y-4">
      <div className="flex items-center space-x-3">
        <Avatar className="h-12 w-12">
          {finalBusinessAvatar ? (
            <AvatarImage src={finalBusinessAvatar} alt={finalBusinessName} />
          ) : (
            <AvatarFallback className="bg-blue-100 text-blue-800">
              {getBusinessInitials(finalBusinessName)}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">{finalBusinessName}</h3>
            {isVerified && <VerifiedBadge size="sm" />}
          </div>
          {businessData?.business_info?.business_category && (
            <p className="text-sm text-gray-600">{businessData.business_info.business_category}</p>
          )}
          {businessData?.business_info?.business_subcategory && (
            <p className="text-sm text-gray-500">{businessData.business_info.business_subcategory}</p>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        {/* License Information */}
        {businessData?.business_info?.license_type && (
          <div>
            <span className="font-medium text-sm">License Type: </span>
            <span className="text-sm">{businessData.business_info.license_type}</span>
          </div>
        )}
        {businessData?.business_info?.license_number && (
          <div>
            <span className="font-medium text-sm">License #: </span>
            <span className="text-sm">{businessData.business_info.license_number}</span>
          </div>
        )}
        {businessData?.business_info?.license_state && (
          <div>
            <span className="font-medium text-sm">License State: </span>
            <span className="text-sm">{businessData.business_info.license_state}</span>
          </div>
        )}
        
        {/* Contact Information */}
        {businessData?.phone && (
          <div>
            <span className="font-medium text-sm">Phone: </span>
            <span className="text-sm">{businessData.phone}</span>
          </div>
        )}
        {businessData?.address && (
          <div>
            <span className="font-medium text-sm">Address: </span>
            <span className="text-sm">{businessData.address}</span>
          </div>
        )}
        {(businessData?.city || businessData?.state || businessData?.zipcode) && (
          <div>
            <span className="font-medium text-sm">Location: </span>
            <span className="text-sm">
              {businessData.city}
              {businessData.city && businessData.state ? ", " : ""}
              {businessData.state} {businessData.zipcode}
            </span>
          </div>
        )}
        {businessData?.business_info?.website && (
          <div>
            <span className="font-medium text-sm">Website: </span>
            <a 
              href={businessData.business_info.website.startsWith('http') ? businessData.business_info.website : `https://${businessData.business_info.website}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              {businessData.business_info.website}
            </a>
          </div>
        )}
        
        {/* Business Bio */}
        {businessData?.bio && (
          <div>
            <span className="font-medium text-sm">About: </span>
            <p className="text-sm text-gray-700 mt-1">{businessData.bio}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaimReviewBusinessInfo;

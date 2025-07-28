
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
    license_type?: string;
    license_number?: string;
    license_state?: string;
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
          {fullBusinessProfile?.business_info?.business_subcategory && (
            <p className="text-sm text-gray-500">{fullBusinessProfile.business_info.business_subcategory}</p>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        {/* License Information */}
        {fullBusinessProfile?.business_info?.license_type && (
          <div>
            <span className="font-medium text-sm">License Type: </span>
            <span className="text-sm">{fullBusinessProfile.business_info.license_type}</span>
          </div>
        )}
        {fullBusinessProfile?.business_info?.license_number && (
          <div>
            <span className="font-medium text-sm">License #: </span>
            <span className="text-sm">{fullBusinessProfile.business_info.license_number}</span>
          </div>
        )}
        {fullBusinessProfile?.business_info?.license_state && (
          <div>
            <span className="font-medium text-sm">License State: </span>
            <span className="text-sm">{fullBusinessProfile.business_info.license_state}</span>
          </div>
        )}
        
        {/* Contact Information */}
        {displayData?.phone && (
          <div>
            <span className="font-medium text-sm">Phone: </span>
            <span className="text-sm">{displayData.phone}</span>
          </div>
        )}
        {displayData?.address && (
          <div>
            <span className="font-medium text-sm">Address: </span>
            <span className="text-sm">{displayData.address}</span>
          </div>
        )}
        {(displayData?.city || displayData?.state || displayData?.zipcode) && (
          <div>
            <span className="font-medium text-sm">Location: </span>
            <span className="text-sm">
              {displayData.city}
              {displayData.city && displayData.state ? ", " : ""}
              {displayData.state} {displayData.zipcode}
            </span>
          </div>
        )}
        {fullBusinessProfile?.business_info?.website && (
          <div>
            <span className="font-medium text-sm">Website: </span>
            <a 
              href={fullBusinessProfile.business_info.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              {fullBusinessProfile.business_info.website}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaimReviewBusinessInfo;

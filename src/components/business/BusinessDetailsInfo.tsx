
import React from "react";
import { BusinessInfo } from "@/types/business";

interface BusinessDetailsInfoProps {
  businessInfo?: BusinessInfo;
}

const BusinessDetailsInfo: React.FC<BusinessDetailsInfoProps> = ({ businessInfo }) => {
  if (!businessInfo) return null;
  
  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <h3 className="font-semibold text-lg mb-2">Business Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {businessInfo.business_name && (
          <div>
            <p className="font-medium">Business Name</p>
            <p className="text-gray-500">{businessInfo.business_name}</p>
          </div>
        )}
        {businessInfo.website && (
          <div>
            <p className="font-medium">Website</p>
            <a 
              href={businessInfo.website} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:underline"
            >
              {businessInfo.website}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessDetailsInfo;

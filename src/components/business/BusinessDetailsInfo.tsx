
import { Building, Globe, FileText, Info } from "lucide-react";
import { BusinessInfo } from "@/types/business";

interface BusinessDetailsInfoProps {
  businessInfo?: BusinessInfo;
}

const BusinessDetailsInfo = ({ businessInfo }: BusinessDetailsInfoProps) => {
  if (!businessInfo) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Business Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Business Category */}
        {businessInfo.business_category && (
          <div className="flex items-start gap-3">
            <Building className="h-5 w-5 text-gray-500 mt-1" />
            <div>
              <p className="text-sm text-gray-500">Category</p>
              <p className="font-medium">{businessInfo.business_category}</p>
              {businessInfo.business_subcategory && (
                <p className="text-sm text-gray-600 mt-1">{businessInfo.business_subcategory}</p>
              )}
            </div>
          </div>
        )}

        {/* License Details */}
        {businessInfo.license_type && (
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-gray-500 mt-1" />
            <div>
              <p className="text-sm text-gray-500">License Type</p>
              <p className="font-medium">{businessInfo.license_type}</p>
              {businessInfo.license_state && (
                <p className="text-sm text-gray-600 mt-1">State: {businessInfo.license_state}</p>
              )}
            </div>
          </div>
        )}

        {/* Website */}
        {businessInfo.website && (
          <div className="flex items-start gap-3">
            <Globe className="h-5 w-5 text-gray-500 mt-1" />
            <div>
              <p className="text-sm text-gray-500">Website</p>
              <a 
                href={businessInfo.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
              >
                {businessInfo.website}
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Additional Licenses */}
      {businessInfo.additional_licenses && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-gray-500 mt-1" />
            <div>
              <p className="text-sm text-gray-500 mb-1">Additional Licenses & Certifications</p>
              <p className="text-sm">{businessInfo.additional_licenses}</p>
            </div>
          </div>
        </div>
      )}

      {/* Additional Information */}
      {businessInfo.additional_info && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-gray-500 mt-1" />
            <div>
              <p className="text-sm text-gray-500 mb-1">Additional Information</p>
              <p className="text-sm">{businessInfo.additional_info}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessDetailsInfo;

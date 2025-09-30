import React from "react";
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Review } from "@/types";

interface AssociatesDisplayProps {
  associates: Array<{ firstName: string; lastName: string }>;
  businessName?: string;
  showBusinessName?: boolean; // New prop to control business name display
  reviewData?: {
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
}

const AssociatesDisplay: React.FC<AssociatesDisplayProps> = ({
  associates,
  businessName,
  showBusinessName = true, // Default to true for backward compatibility
  reviewData
}) => {
  console.log("🔍 ASSOCIATES DISPLAY - businessName:", businessName);
  console.log("🔍 ASSOCIATES DISPLAY - associates:", associates);
  console.log("🔍 ASSOCIATES DISPLAY - reviewData:", reviewData);

  const navigate = useNavigate();
  const filteredAssociates = associates.filter(
    associate => associate.firstName.trim() !== '' || associate.lastName.trim() !== ''
  );

  const hasBusinessName = businessName && businessName.trim() !== '' && showBusinessName;

  // Show the component if there are associates OR if there's a business name (when showBusinessName is true)
  if (filteredAssociates.length === 0 && !hasBusinessName) {
    return null;
  }

  const handleAssociateClick = (associate: { firstName: string; lastName: string }) => {
    // Navigate to search page with pre-filled associate name and review data
    const params = new URLSearchParams({
      firstName: associate.firstName,
      lastName: associate.lastName,
      phone: reviewData?.phone || '',
      address: reviewData?.address || '',
      city: reviewData?.city || '',
      state: reviewData?.state || '',
      zipCode: reviewData?.zipCode || ''
    });

    navigate(`/search?${params.toString()}`);
  };

  const handleBusinessNameClick = () => {
    // Navigate to search page with pre-filled business name and review data
    const params = new URLSearchParams({
      businessName: businessName || '',
      phone: reviewData?.phone || '',
      address: reviewData?.address || '',
      city: reviewData?.city || '',
      state: reviewData?.state || '',
      zipCode: reviewData?.zipCode || ''
    });

    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="mt-3">
      <div className="flex items-start gap-2">
        <Users className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm text-gray-600 mb-2">
            {hasBusinessName && filteredAssociates.length > 0
              ? "Business & Associates:"
              : hasBusinessName
              ? "Business:"
              : "Friends, Partners, Associates:"
            }
          </p>
          <div className="flex flex-wrap gap-2">
            {hasBusinessName && (
              <button
                onClick={handleBusinessNameClick}
                className="text-sm text-purple-600 hover:text-purple-800 hover:underline bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded-md transition-colors duration-200 font-medium"
              >
                🏢 {businessName}
              </button>
            )}
            {filteredAssociates.map((associate, index) => (
              <button
                key={index}
                onClick={() => handleAssociateClick(associate)}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md transition-colors duration-200 font-medium"
              >
                {`${associate.firstName} ${associate.lastName}`.trim()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssociatesDisplay;
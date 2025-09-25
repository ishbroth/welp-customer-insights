import React from "react";
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Review } from "@/types";

interface AssociatesDisplayProps {
  associates: Array<{ firstName: string; lastName: string }>;
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
  reviewData
}) => {
  const navigate = useNavigate();
  const filteredAssociates = associates.filter(
    associate => associate.firstName.trim() !== '' || associate.lastName.trim() !== ''
  );

  if (filteredAssociates.length === 0) {
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

  return (
    <div className="mt-3">
      <div className="flex items-start gap-2">
        <Users className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm text-gray-600 mb-2">Friends, Partners, Associates:</p>
          <div className="flex flex-wrap gap-2">
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
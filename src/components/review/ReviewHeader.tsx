
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import StarRating from "@/components/StarRating";

interface ReviewHeaderProps {
  businessName: string;
  businessId?: string;
  rating: number;
  location: string;
  hasAccess?: boolean;
}

const ReviewHeader: React.FC<ReviewHeaderProps> = ({
  businessName,
  businessId,
  rating,
  location,
  hasAccess = false
}) => {
  const navigate = useNavigate();
  const { isSubscribed } = useAuth();

  const handleBusinessNameClick = () => {
    // Only allow navigation if user is subscribed or has access and we have a business ID
    if ((isSubscribed || hasAccess) && businessId) {
      navigate(`/business/${businessId}`);
    }
  };

  return (
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center gap-2">
        {(isSubscribed || hasAccess) && businessId ? (
          <div 
            className="font-bold text-lg cursor-pointer text-blue-600 hover:text-blue-800 hover:underline"
            onClick={handleBusinessNameClick}
          >
            {businessName}
          </div>
        ) : (
          <div className="font-bold text-lg">{businessName}</div>
        )}
        <StarRating rating={rating} size="md" />
      </div>
      <div className="text-sm text-gray-500">{location}</div>
    </div>
  );
};

export default ReviewHeader;

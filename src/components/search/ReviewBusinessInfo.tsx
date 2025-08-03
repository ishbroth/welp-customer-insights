
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";

interface ReviewBusinessInfoProps {
  reviewerName: string;
  reviewerId: string;
  date: string;
  hasFullAccess: boolean;
}

const ReviewBusinessInfo = ({ 
  reviewerName, 
  reviewerId, 
  date, 
  hasFullAccess 
}: ReviewBusinessInfoProps) => {
  const { isSubscribed } = useAuth();
  const navigate = useNavigate();

  const handleBusinessClick = () => {
    if (isSubscribed || hasFullAccess) {
      navigate(`/business-profile/${reviewerId}`, { state: { readOnly: true } });
    }
  };

  return (
    <div>
      {(isSubscribed || hasFullAccess) ? (
        <h4 
          className="font-semibold text-base cursor-pointer text-blue-600 hover:text-blue-800 hover:underline transition-colors"
          onClick={handleBusinessClick}
        >
          {reviewerName}
        </h4>
      ) : (
        <h4 className="font-semibold text-base">{reviewerName}</h4>
      )}
      
      <p className="text-sm text-gray-500 mt-2">
        {new Date(date).toLocaleDateString()}
      </p>
    </div>
  );
};

export default ReviewBusinessInfo;

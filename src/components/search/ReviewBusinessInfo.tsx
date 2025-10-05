
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";
import { getReviewerDisplayName } from "@/utils/anonymousReviewUtils";

interface ReviewBusinessInfoProps {
  reviewerName: string;
  reviewerId: string;
  date: string;
  hasFullAccess: boolean;
  isAnonymous?: boolean;
  reviewerBusinessCategory?: string;
}

const ReviewBusinessInfo = ({
  reviewerName,
  reviewerId,
  date,
  hasFullAccess,
  isAnonymous = false,
  reviewerBusinessCategory
}: ReviewBusinessInfoProps) => {
  const { isSubscribed } = useAuth();
  const navigate = useNavigate();

  const displayName = getReviewerDisplayName(isAnonymous, reviewerName, reviewerBusinessCategory);

  const handleBusinessClick = () => {
    // Don't navigate if anonymous
    if (isAnonymous) {
      return;
    }

    if (isSubscribed || hasFullAccess) {
      navigate(`/business-profile/${reviewerId}`, { state: { readOnly: true } });
    }
  };

  return (
    <div>
      {(isSubscribed || hasFullAccess) && !isAnonymous ? (
        <h4
          className="font-semibold text-base cursor-pointer text-blue-600 hover:text-blue-800 hover:underline transition-colors"
          onClick={handleBusinessClick}
        >
          {displayName}
        </h4>
      ) : (
        <h4 className="font-semibold text-base text-gray-700">{displayName}</h4>
      )}

      <p className="text-sm text-gray-500 mt-2">
        {new Date(date).toLocaleDateString()}
      </p>
    </div>
  );
};

export default ReviewBusinessInfo;

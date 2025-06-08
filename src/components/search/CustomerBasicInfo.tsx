
import { Badge } from "@/components/ui/badge";
import StarRating from "@/components/StarRating";

interface CustomerBasicInfoProps {
  customerName: string;
  hasReviews: boolean;
  averageRating: number;
  currentUser: any;
  hasAccess: boolean;
}

const CustomerBasicInfo = ({ 
  customerName, 
  hasReviews, 
  averageRating, 
  currentUser, 
  hasAccess 
}: CustomerBasicInfoProps) => {
  return (
    <div className="flex items-center gap-3 mb-3">
      <h3 className="font-semibold text-lg">
        {customerName || 'Unknown Customer'}
      </h3>
      {hasReviews && (
        <div className="flex items-center gap-2">
          <StarRating 
            rating={averageRating} 
            size="sm" 
            grayedOut={!currentUser || !hasAccess}
          />
          <span className={`text-sm font-medium ${!currentUser || !hasAccess ? 'text-gray-400' : 'text-gray-600'}`}>
            {averageRating.toFixed(1)}
          </span>
        </div>
      )}
    </div>
  );
};

export default CustomerBasicInfo;

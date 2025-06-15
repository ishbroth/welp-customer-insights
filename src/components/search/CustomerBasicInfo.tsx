
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import VerifiedBadge from "@/components/ui/VerifiedBadge";

interface CustomerBasicInfoProps {
  customerName: string;
  hasReviews: boolean;
  averageRating: number;
  currentUser: any;
  hasAccess: boolean;
  isVerified?: boolean;
}

const CustomerBasicInfo = ({ 
  customerName, 
  hasReviews, 
  averageRating, 
  currentUser, 
  hasAccess,
  isVerified = false
}: CustomerBasicInfoProps) => {
  return (
    <div className="flex items-center gap-2 mb-2">
      <h3 className="text-lg font-semibold text-gray-900 truncate">
        {customerName}
      </h3>
      
      {/* Show verified badge for verified customers */}
      {isVerified && (
        <VerifiedBadge size="sm" />
      )}
      
      {hasReviews && (
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 text-yellow-400 fill-current" />
          <span className="text-sm text-gray-600">
            {averageRating.toFixed(1)}
          </span>
        </div>
      )}
      
      {currentUser && hasAccess && (
        <Badge variant="secondary" className="text-xs">
          Full Access
        </Badge>
      )}
    </div>
  );
};

export default CustomerBasicInfo;

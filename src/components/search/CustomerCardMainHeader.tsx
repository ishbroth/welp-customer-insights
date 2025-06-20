
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import StarRating from "@/components/StarRating";
import CustomerCardAvatar from "./CustomerCardAvatar";

interface CustomerCardMainHeaderProps {
  customerName: string;
  customerAvatar?: string;
  isVerified: boolean;
  hasReviews: boolean;
  averageRating: number;
  reviewCount: number;
  customerInfoText: string;
  hasAccess: boolean;
  getInitials: (name: string) => string;
  onClick: () => void;
}

const CustomerCardMainHeader = ({
  customerName,
  customerAvatar,
  isVerified,
  hasReviews,
  averageRating,
  reviewCount,
  customerInfoText,
  hasAccess,
  getInitials,
  onClick
}: CustomerCardMainHeaderProps) => {
  return (
    <div className="flex items-start justify-between">
      {/* Customer info - left side (larger) */}
      <div className="flex items-center space-x-4 cursor-pointer" onClick={onClick}>
        <CustomerCardAvatar
          src={customerAvatar}
          alt={customerName}
          fallbackText={getInitials(customerName)}
          size="lg"
        />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg">{customerName}</h3>
            {isVerified && <VerifiedBadge size="sm" />}
          </div>
          <p className="text-sm text-gray-500">Customer</p>
          {hasAccess && customerInfoText && (
            <p className="text-sm text-gray-600">{customerInfoText}</p>
          )}
        </div>
      </div>

      {/* Review summary - right side (smaller) */}
      {hasReviews && (
        <div className="flex items-center space-x-2">
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end mb-1">
              <StarRating rating={averageRating} size="sm" />
              <span className="text-sm font-medium">{averageRating.toFixed(1)}</span>
            </div>
            <p className="text-xs text-gray-500">
              {reviewCount} review{reviewCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerCardMainHeader;

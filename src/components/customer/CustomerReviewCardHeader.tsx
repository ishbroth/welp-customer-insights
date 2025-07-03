
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import CustomerInfoDisplay from "@/components/review/CustomerInfoDisplay";

interface CustomerReviewCardHeaderProps {
  businessInfo: {
    name: string;
    avatar: string;
    initials: string;
    verified: boolean;
  };
  customerInfo: any;
  reviewDate: string;
  shouldBusinessNameBeClickable: boolean;
  onBusinessNameClick: () => void;
  onCustomerClick?: () => void;
}

const CustomerReviewCardHeader = ({
  businessInfo,
  customerInfo,
  reviewDate,
  shouldBusinessNameBeClickable,
  onBusinessNameClick,
  onCustomerClick
}: CustomerReviewCardHeaderProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flex items-start justify-between mb-4">
      {/* Business info - left side (larger) */}
      <div className="flex items-center space-x-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={businessInfo.avatar} alt={businessInfo.name} />
          <AvatarFallback className="bg-blue-100 text-blue-800">
            {businessInfo.initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2 mb-1">
            {shouldBusinessNameBeClickable ? (
              <h3 
                className="font-semibold text-lg cursor-pointer hover:text-blue-600 transition-colors text-blue-600 hover:underline"
                onClick={onBusinessNameClick}
              >
                {businessInfo.name}
              </h3>
            ) : (
              <h3 className="font-semibold text-lg text-gray-900">
                {businessInfo.name}
              </h3>
            )}
            {businessInfo.verified && <VerifiedBadge size="sm" />}
          </div>
          <p className="text-sm text-gray-500">
            Review written on {formatDate(reviewDate)}
          </p>
          <p className="text-sm text-gray-500">Business</p>
        </div>
      </div>

      {/* Customer info - right side (smaller) using enhanced component */}
      <CustomerInfoDisplay
        customerInfo={customerInfo}
        onCustomerClick={customerInfo.isClaimed ? onCustomerClick : undefined}
        size="small"
        showContactInfo={true}
      />
    </div>
  );
};

export default CustomerReviewCardHeader;

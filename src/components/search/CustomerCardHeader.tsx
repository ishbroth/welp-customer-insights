
import CustomerBasicInfo from "./CustomerBasicInfo";
import CustomerContactInfo from "./CustomerContactInfo";
import CustomerReviewBadge from "./CustomerReviewBadge";

interface CustomerInfo {
  label: string;
  value: string;
}

interface CustomerCardHeaderProps {
  customerName: string;
  customerInfo: CustomerInfo[];
  hasReviews: boolean;
  averageRating: number;
  reviewCount: number;
  currentUser: any;
  hasAccess: boolean;
  isVerified: boolean;
  onClick: () => void;
}

const CustomerCardHeader = ({
  customerName,
  customerInfo,
  hasReviews,
  averageRating,
  reviewCount,
  currentUser,
  hasAccess,
  isVerified,
  onClick
}: CustomerCardHeaderProps) => {
  return (
    <div className={`flex-grow min-w-0 ${currentUser ? 'cursor-pointer' : ''}`} onClick={onClick}>
      {/* Customer name with average rating and verification badge */}
      <CustomerBasicInfo 
        customerName={customerName}
        hasReviews={hasReviews}
        averageRating={averageRating}
        currentUser={currentUser}
        hasAccess={hasAccess}
        isVerified={isVerified}
      />

      {/* Customer information - show all identifying info for everyone */}
      <CustomerContactInfo 
        customerInfo={customerInfo}
        currentUser={currentUser}
      />
      
      {/* Review count */}
      <CustomerReviewBadge 
        hasReviews={hasReviews}
        reviewCount={reviewCount}
      />
    </div>
  );
};

export default CustomerCardHeader;

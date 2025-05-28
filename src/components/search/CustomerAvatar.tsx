
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CustomerAvatarProps {
  customer: {
    firstName: string;
    lastName: string;
    avatar?: string;
    id: string;
  };
  isReviewCustomer: boolean;
  isBusinessUser: boolean;
  onViewProfile: (e: React.MouseEvent) => void;
}

const CustomerAvatar = ({ 
  customer, 
  isReviewCustomer, 
  isBusinessUser, 
  onViewProfile 
}: CustomerAvatarProps) => {
  const getInitials = () => {
    const firstInitial = customer.firstName ? customer.firstName[0] : "";
    const lastInitial = customer.lastName ? customer.lastName[0] : "";
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  const getCustomerAvatar = () => {
    if (isReviewCustomer) {
      return null;
    }
    return customer.avatar || null;
  };

  if (!isBusinessUser) {
    return (
      <Avatar className="h-10 w-10 border border-gray-200 flex-shrink-0">
        {getCustomerAvatar() ? (
          <AvatarImage src={getCustomerAvatar()!} alt={`${customer.firstName} ${customer.lastName}`} />
        ) : (
          <AvatarFallback className="bg-gray-200 text-gray-800">
            {getInitials()}
          </AvatarFallback>
        )}
      </Avatar>
    );
  }

  return (
    <div onClick={onViewProfile} className="cursor-pointer flex-shrink-0">
      <Avatar className="h-10 w-10 border border-gray-200">
        {getCustomerAvatar() ? (
          <AvatarImage src={getCustomerAvatar()!} alt={`${customer.firstName} ${customer.lastName}`} />
        ) : (
          <AvatarFallback className="bg-gray-200 text-gray-800">
            {getInitials()}
          </AvatarFallback>
        )}
      </Avatar>
    </div>
  );
};

export default CustomerAvatar;

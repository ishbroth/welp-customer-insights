
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CustomerAvatarProps {
  customer: {
    firstName: string;
    lastName: string;
    avatar?: string;
    id?: string;
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

  // Fetch customer profile to get avatar if not already provided and we have an ID
  const { data: customerProfile } = useQuery({
    queryKey: ['customerProfile', customer.id],
    queryFn: async () => {
      if (!customer.id) return null;
      
      console.log(`Fetching customer profile for ID: ${customer.id}`);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, avatar')
        .eq('id', customer.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching customer profile:", error);
        return null;
      }

      console.log(`Customer profile found:`, data);
      return data;
    },
    enabled: !!customer.id && !customer.avatar // Only fetch if we have an ID and don't already have avatar
  });

  const getInitials = () => {
    const firstInitial = customer.firstName ? customer.firstName[0] : "";
    const lastInitial = customer.lastName ? customer.lastName[0] : "";
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  const getCustomerAvatar = () => {
    // Use avatar from props first, then from fetched profile
    return customer.avatar || customerProfile?.avatar || null;
  };

  const avatarSrc = getCustomerAvatar();
  console.log(`CustomerAvatar: Customer ${customer.firstName} ${customer.lastName} avatar:`, avatarSrc);

  if (!isBusinessUser) {
    return (
      <Avatar className="h-10 w-10 border border-gray-200 flex-shrink-0">
        {avatarSrc ? (
          <AvatarImage src={avatarSrc} alt={`${customer.firstName} ${customer.lastName}`} />
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
        {avatarSrc ? (
          <AvatarImage src={avatarSrc} alt={`${customer.firstName} ${customer.lastName}`} />
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

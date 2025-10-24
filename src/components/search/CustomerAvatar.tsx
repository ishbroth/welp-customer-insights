
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/utils/logger';
import { getInitials } from "@/utils/stringUtils";

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
  const componentLogger = logger.withContext('CustomerAvatar');

  // Fetch customer profile to get avatar if not already provided and we have an ID
  const { data: customerProfile } = useQuery({
    queryKey: ['customerProfile', customer.id],
    queryFn: async () => {
      if (!customer.id) return null;

      componentLogger.debug(`Fetching profile for ID: ${customer.id}`);

      const { data, error } = await supabase
        .from('profiles')
        .select('id, avatar, first_name, last_name')
        .eq('id', customer.id)
        .maybeSingle();

      if (error) {
        componentLogger.error("Error fetching profile:", error);
        return null;
      }

      componentLogger.debug(`Profile found:`, data);
      return data;
    },
    enabled: !!customer.id && !customer.avatar // Only fetch if we have an ID and don't already have avatar
  });

  const customerInitials = getInitials(`${customer.firstName} ${customer.lastName}`);

  const getCustomerAvatar = () => {
    // Use avatar from props first, then from fetched profile
    const avatarUrl = customer.avatar || customerProfile?.avatar || null;
    componentLogger.debug(`Final avatar URL for ${customer.firstName} ${customer.lastName}:`, avatarUrl);
    return avatarUrl;
  };

  const avatarSrc = getCustomerAvatar();

  if (!isBusinessUser) {
    return (
      <Avatar className="h-10 w-10 border border-gray-200 flex-shrink-0">
        {avatarSrc ? (
          <AvatarImage src={avatarSrc} alt={`${customer.firstName} ${customer.lastName}`} />
        ) : (
          <AvatarFallback className="bg-gray-200 text-gray-800">
            {customerInitials}
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
            {customerInitials}
          </AvatarFallback>
        )}
      </Avatar>
    </div>
  );
};

export default CustomerAvatar;

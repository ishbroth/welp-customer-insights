
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/utils/logger';

interface ReviewBusinessAvatarProps {
  reviewerId: string;
  reviewerName: string;
  reviewerVerified?: boolean;
}

const ReviewBusinessAvatar = ({
  reviewerId,
  reviewerName,
  reviewerVerified
}: ReviewBusinessAvatarProps) => {
  const componentLogger = logger.withContext('ReviewBusinessAvatar');

  // Fetch business profile
  const { data: businessProfile } = useQuery({
    queryKey: ['businessProfile', reviewerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, avatar')
        .eq('id', reviewerId)
        .maybeSingle();

      if (error) {
        componentLogger.error("Error fetching business profile:", error);
        return null;
      }
      return data;
    },
    enabled: !!reviewerId
  });

  const getBusinessInitials = () => {
    if (reviewerName) {
      const names = reviewerName.split(' ');
      return names.map(name => name[0]).join('').toUpperCase().slice(0, 2);
    }
    return "B";
  };

  return (
    <div className="flex items-center space-x-3">
      {/* Verified badge - positioned before the avatar */}
      {reviewerVerified && (
        <VerifiedBadge size="md" />
      )}
      
      {/* Business avatar */}
      <Avatar className="h-12 w-12">
        <AvatarImage 
          src={businessProfile?.avatar || ""} 
          alt={reviewerName} 
        />
        <AvatarFallback className="bg-blue-100 text-blue-800">
          {getBusinessInitials()}
        </AvatarFallback>
      </Avatar>
    </div>
  );
};

export default ReviewBusinessAvatar;


import { useAuth } from "@/contexts/auth";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import { useVerifiedStatus } from "@/hooks/useVerifiedStatus";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const WelcomeSection = () => {
  const { currentUser } = useAuth();
  const { isVerified: isBusinessVerified } = useVerifiedStatus(currentUser?.id);

  // Fetch customer verification status from profiles table
  const { data: customerProfile } = useQuery({
    queryKey: ['customerVerification', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id || currentUser.type !== 'customer') return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('verified')
        .eq('id', currentUser.id)
        .single();

      if (error) {
        console.error("Error fetching customer verification:", error);
        return null;
      }

      return data;
    },
    enabled: !!currentUser?.id && currentUser.type === 'customer'
  });

  if (!currentUser) return null;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // For customers, show verified badge if they have a verified profile
  // For businesses, show verified badge if they are verified in business_info
  const shouldShowVerifiedBadge = () => {
    if (currentUser.type === 'business') {
      return isBusinessVerified;
    } else if (currentUser.type === 'customer') {
      return customerProfile?.verified || false;
    }
    return false;
  };

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-3xl font-bold text-gray-900">
          {getGreeting()}, {currentUser.name || "User"}!
        </h1>
        {shouldShowVerifiedBadge() && (
          <VerifiedBadge size="lg" />
        )}
      </div>
      <p className="text-gray-600">
        {currentUser.type === 'business' 
          ? `Welcome to your business dashboard${isBusinessVerified ? ' - Your business is verified!' : ''}.`
          : `Welcome to your customer dashboard${customerProfile?.verified ? ' - Your account is verified!' : ''}.`
        }
      </p>
    </div>
  );
};

export default WelcomeSection;

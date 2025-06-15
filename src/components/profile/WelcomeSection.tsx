
import { useAuth } from "@/contexts/auth";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import { useVerifiedStatus } from "@/hooks/useVerifiedStatus";

const WelcomeSection = () => {
  const { currentUser } = useAuth();
  const { isVerified } = useVerifiedStatus(currentUser?.id);

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
      return isVerified;
    } else if (currentUser.type === 'customer') {
      // For customers, show verified if their profile is verified
      return currentUser.verified || false;
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
          ? `Welcome to your business dashboard${isVerified ? ' - Your business is verified!' : ''}.`
          : `Welcome to your customer dashboard${currentUser.verified ? ' - Your account is verified!' : ''}.`
        }
      </p>
    </div>
  );
};

export default WelcomeSection;

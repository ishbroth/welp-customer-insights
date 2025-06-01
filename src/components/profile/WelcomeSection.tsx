
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

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-3xl font-bold text-gray-900">
          {getGreeting()}, {currentUser.name || "User"}!
        </h1>
        {currentUser.type === 'business' && isVerified && (
          <VerifiedBadge size="lg" />
        )}
      </div>
      <p className="text-gray-600">
        {currentUser.type === 'business' 
          ? `Welcome to your business dashboard${isVerified ? ' - Your business is verified!' : ''}.`
          : "Welcome to your customer dashboard."
        }
      </p>
    </div>
  );
};

export default WelcomeSection;

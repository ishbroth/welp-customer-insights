
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import { useVerifiedStatus } from "@/hooks/useVerifiedStatus";

interface BusinessBasicInfoProps {
  profile: {
    id: string;
    name?: string;
    avatar?: string;
    bio?: string;
  };
}

const BusinessBasicInfo = ({ profile }: BusinessBasicInfoProps) => {
  const { isVerified } = useVerifiedStatus(profile.id);

  const getBusinessInitials = (name: string | undefined) => {
    if (name) {
      const names = name.split(' ');
      return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return "B";
  };

  return (
    <div className="flex items-start space-x-4">
      <Avatar className="h-20 w-20">
        <AvatarImage src={profile.avatar || ""} alt={profile.name} />
        <AvatarFallback className="bg-blue-100 text-blue-800 text-lg">
          {getBusinessInitials(profile.name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-2xl font-bold">{profile.name || "Business Profile"}</h1>
          {isVerified && <VerifiedBadge size="lg" />}
        </div>
        {profile.bio && (
          <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
        )}
        {isVerified && (
          <div className="mt-2 text-sm text-green-600 font-medium">
            ✓ Verified Business
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessBasicInfo;

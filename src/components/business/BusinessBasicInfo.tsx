
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Shield } from "lucide-react";
import { CardTitle } from "@/components/ui/card";
import { BusinessProfile } from "@/types/business";

interface BusinessBasicInfoProps {
  profile: BusinessProfile;
}

const BusinessBasicInfo: React.FC<BusinessBasicInfoProps> = ({ profile }) => {
  // Get initials from name for avatar fallback
  const getInitials = (name?: string) => {
    if (!name) return "B";
    return name.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
      <Avatar className="h-24 w-24 border-2 border-white shadow-lg">
        {profile.avatar ? (
          <AvatarImage src={profile.avatar} alt={profile.name} />
        ) : (
          <AvatarFallback className="text-xl bg-primary/10 text-primary">
            {getInitials(profile.name)}
          </AvatarFallback>
        )}
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <CardTitle className="text-2xl font-bold text-center md:text-left">
            {profile.name || "Business"}
          </CardTitle>
          <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs flex items-center">
            <Shield className="h-3 w-3 mr-1" />
            Business
          </div>
        </div>
        {profile.bio && (
          <p className="mt-2 text-gray-600">{profile.bio}</p>
        )}
      </div>
    </div>
  );
};

export default BusinessBasicInfo;

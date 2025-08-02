
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import WelpLoadingIcon from "@/components/ui/WelpLoadingIcon";

interface ProfileLoadingStateProps {
  isLoading: boolean;
  onGoBack: () => void;
}

const ProfileLoadingState: React.FC<ProfileLoadingStateProps> = ({ isLoading, onGoBack }) => {
  if (!isLoading) return null;
  
  return (
    <div className="flex justify-center items-center h-64">
      <WelpLoadingIcon size={32} showText={true} text="Loading customer profile..." />
    </div>
  );
};

export default ProfileLoadingState;

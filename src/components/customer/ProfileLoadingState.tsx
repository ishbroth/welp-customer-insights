
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ProfileLoadingStateProps {
  isLoading: boolean;
  onGoBack: () => void;
}

const ProfileLoadingState: React.FC<ProfileLoadingStateProps> = ({ isLoading, onGoBack }) => {
  if (!isLoading) return null;
  
  return (
    <div className="flex justify-center items-center h-64">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 text-gray-500">Loading customer profile...</p>
      </div>
    </div>
  );
};

export default ProfileLoadingState;

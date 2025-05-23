
import React from "react";

interface ProfileLoadingStateProps {
  isLoading: boolean;
}

const ProfileLoadingState: React.FC<ProfileLoadingStateProps> = ({ isLoading }) => {
  if (!isLoading) return null;
  
  return (
    <div className="text-center py-10">
      <p className="text-gray-500 mb-2">Loading business profile...</p>
    </div>
  );
};

export default ProfileLoadingState;

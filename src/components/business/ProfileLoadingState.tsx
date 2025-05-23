
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ProfileLoadingStateProps {
  isLoading: boolean;
}

const ProfileLoadingState: React.FC<ProfileLoadingStateProps> = ({ isLoading }) => {
  if (!isLoading) return null;
  
  return (
    <div className="space-y-4 py-6">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-8 w-40" />
        </div>
        <div>
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-8 w-40" />
        </div>
      </div>
    </div>
  );
};

export default ProfileLoadingState;

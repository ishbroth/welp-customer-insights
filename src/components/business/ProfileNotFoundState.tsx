
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ProfileNotFoundStateProps {
  profile: any | null;
}

const ProfileNotFoundState: React.FC<ProfileNotFoundStateProps> = ({ profile }) => {
  const navigate = useNavigate();
  
  if (profile) return null;
  
  return (
    <div className="text-center py-10">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-red-700 mb-2">Profile Not Found</h3>
        <p className="text-red-600">
          This business profile does not exist or you don't have permission to view it.
        </p>
        <Button 
          variant="outline" 
          className="mt-4" 
          onClick={() => navigate("/")}
        >
          Return to Homepage
        </Button>
      </div>
    </div>
  );
};

export default ProfileNotFoundState;

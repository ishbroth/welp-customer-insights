
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, ShieldOff, FileX } from "lucide-react";

interface ProfileNotFoundStateProps {
  profile: any | null;
  error: Error | null;
  hasAccess: boolean;
}

const ProfileNotFoundState: React.FC<ProfileNotFoundStateProps> = ({ profile, error, hasAccess }) => {
  const navigate = useNavigate();
  
  // Don't show if we have a profile
  if (profile) return null;
  
  // Don't show for loading errors that aren't related to profile not found
  if (error && !error.message.includes("No rows returned") && !error.message.includes("Subscription required")) return null;
  
  const isAccessError = !hasAccess || (error && error.message.includes("Subscription required"));
  const isNotFoundError = error && error.message.includes("No rows returned");
  
  return (
    <div className="text-center py-10">
      <div className={`${isAccessError ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200"} border rounded-lg p-6`}>
        {isAccessError ? (
          <>
            <div className="flex items-center justify-center mb-4">
              <ShieldOff className="h-8 w-8 text-amber-500" />
            </div>
            <h3 className="text-xl font-semibold text-amber-700 mb-2">Subscription Required</h3>
            <p className="text-amber-600 mb-4">
              You need a subscription to view business profiles.
            </p>
            <Button 
              variant="default" 
              className="mt-2" 
              onClick={() => navigate("/subscription")}
            >
              View Subscription Plans
            </Button>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center mb-4">
              <FileX className="h-8 w-8 text-red-500" />
            </div>
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
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileNotFoundState;

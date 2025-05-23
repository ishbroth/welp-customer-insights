
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ProfileErrorStateProps {
  error: Error | null;
  onRetry: () => void;
}

const ProfileErrorState: React.FC<ProfileErrorStateProps> = ({ error, onRetry }) => {
  if (!error) return null;
  
  return (
    <div className="py-6">
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4 mr-2" />
        <AlertTitle>Error Loading Profile</AlertTitle>
        <AlertDescription>
          {error.message || "There was an issue loading the business profile. Please try again."}
        </AlertDescription>
      </Alert>
      
      <Button 
        variant="outline" 
        onClick={onRetry}
        className="mt-2"
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Try Again
      </Button>
    </div>
  );
};

export default ProfileErrorState;

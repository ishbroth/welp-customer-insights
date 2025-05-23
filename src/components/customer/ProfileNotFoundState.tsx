
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ProfileNotFoundStateProps {
  onGoBack: () => void;
}

const ProfileNotFoundState: React.FC<ProfileNotFoundStateProps> = ({ onGoBack }) => {
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold mb-2">Customer Not Found</h2>
      <p className="text-gray-600 mb-6">The customer profile you're looking for does not exist or you don't have permission to view it.</p>
      <Button onClick={onGoBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Go Back
      </Button>
    </div>
  );
};

export default ProfileNotFoundState;

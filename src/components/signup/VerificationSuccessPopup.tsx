
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, Shield } from "lucide-react";
import VerifiedBadge from "@/components/ui/VerifiedBadge";

interface VerificationSuccessPopupProps {
  isOpen: boolean;
  businessName: string;
  verificationDetails: {
    type: string;
    status: string;
    issuingAuthority?: string;
    licenseState?: string;
  };
}

const VerificationSuccessPopup = ({ 
  isOpen, 
  businessName, 
  verificationDetails 
}: VerificationSuccessPopupProps) => {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate("/profile");
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <div className="absolute -top-1 -right-1">
                <VerifiedBadge size="md" />
              </div>
            </div>
          </div>
          <DialogTitle className="text-xl font-bold text-green-700">
            Congratulations! Your Business is Verified
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center space-y-4">
          <p className="text-gray-600">
            <strong>{businessName}</strong> has been successfully verified through real-time license verification.
          </p>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Shield className="h-5 w-5 text-green-600 mr-2" />
              <span className="font-semibold text-green-800">Verification Details</span>
            </div>
            <div className="text-sm text-gray-700 space-y-1">
              <p><strong>License Type:</strong> {verificationDetails.type}</p>
              <p><strong>Status:</strong> {verificationDetails.status}</p>
              {verificationDetails.licenseState && (
                <p><strong>State:</strong> {verificationDetails.licenseState}</p>
              )}
              {verificationDetails.issuingAuthority && (
                <p><strong>Authority:</strong> {verificationDetails.issuingAuthority}</p>
              )}
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            <p>Your profile now displays the verified business badge, giving customers confidence in your legitimacy.</p>
          </div>
          
          <Button 
            onClick={handleContinue}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            Go to My Profile
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VerificationSuccessPopup;

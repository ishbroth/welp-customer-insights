
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Award, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BusinessVerificationSuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  businessName: string;
  licenseVerificationResult?: {
    verified: boolean;
    isRealVerification: boolean;
    details?: any;
  };
}

const BusinessVerificationSuccessPopup = ({
  isOpen,
  onClose,
  businessName,
  licenseVerificationResult
}: BusinessVerificationSuccessPopupProps) => {
  const navigate = useNavigate();

  console.log("🎉 BusinessVerificationSuccessPopup rendered with:", {
    isOpen,
    businessName,
    licenseVerificationResult
  });

  const isLicenseVerified = licenseVerificationResult?.verified && licenseVerificationResult?.isRealVerification;

  const handleVerifyLicense = () => {
    console.log("🔄 Redirecting to license verification page");
    onClose();
    navigate('/verify-license');
  };

  const handleContinue = () => {
    console.log("🚀 Continuing to profile");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <DialogTitle className="text-center text-xl font-bold">
            Welcome to Welp, {businessName}!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 text-center">
          <p className="text-gray-600">
            Your business account has been successfully created and verified!
          </p>
          
          {isLicenseVerified ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Award className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">License Verified!</span>
              </div>
              <p className="text-sm text-green-700">
                Great news! Your business license has been automatically verified. You now have a verified badge on your profile.
              </p>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Award className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">Ready to Verify Your License?</span>
              </div>
              <p className="text-sm text-blue-700 mb-3">
                {licenseVerificationResult?.message || "Complete your profile by verifying your business license. It's free and only takes a few minutes!"}
              </p>
              <Button 
                onClick={handleVerifyLicense}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Verify My License - It's Free!
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
          
          <div className="pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={handleContinue}
              className="w-full"
            >
              {isLicenseVerified ? "Continue to Profile" : "I'll Do This Later"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BusinessVerificationSuccessPopup;

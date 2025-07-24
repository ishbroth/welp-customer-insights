
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { LicenseVerificationPopup } from "@/components/signup/LicenseVerificationPopup";

const EmailVerificationSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showLicensePopup, setShowLicensePopup] = useState(false);
  const [businessData, setBusinessData] = useState<any>(null);

  const accountType = searchParams.get('type') || 'customer';
  const userEmail = searchParams.get('email') || '';

  useEffect(() => {
    // Check if this is a business account and get verification data
    if (accountType === 'business') {
      const pendingData = localStorage.getItem("pendingVerification");
      if (pendingData) {
        try {
          const data = JSON.parse(pendingData);
          setBusinessData(data);
          
          // Show license verification popup after a brief delay
          setTimeout(() => {
            setShowLicensePopup(true);
          }, 1500);
          
          // Clean up the stored data
          localStorage.removeItem("pendingVerification");
        } catch (error) {
          console.error("Error parsing pending verification data:", error);
        }
      }
    }

    // For customer accounts, redirect to profile after delay
    if (accountType === 'customer') {
      setTimeout(() => {
        navigate('/profile');
      }, 3000);
    }
  }, [accountType, navigate]);

  const handleLicensePopupClose = () => {
    setShowLicensePopup(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="container mx-auto flex-grow flex items-center justify-center px-4">
        <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Email Verified Successfully!
          </h1>
          
          <p className="text-gray-600 mb-6">
            {accountType === 'business' 
              ? 'Your business account has been created successfully.' 
              : 'Your account has been created successfully.'}
          </p>

          {accountType === 'customer' && (
            <p className="text-sm text-gray-500">
              Redirecting to your profile...
            </p>
          )}
        </div>
      </div>

      {/* License Verification Popup for Business Accounts */}
      {showLicensePopup && businessData && (
        <LicenseVerificationPopup
          isOpen={showLicensePopup}
          onClose={handleLicensePopupClose}
          businessName={businessData.businessName}
          isVerified={businessData.licenseVerificationResult?.verified && businessData.licenseVerificationResult?.isRealVerification}
          verificationDetails={businessData.licenseVerificationResult?.details}
        />
      )}
    </div>
  );
};

export default EmailVerificationSuccess;


import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import VerificationHeader from "./VerificationHeader";
import BasicLicenseFields from "./BasicLicenseFields";
import InstantVerificationSection from "./InstantVerificationSection";
import ManualVerificationForm from "./ManualVerificationForm";
import VerificationSuccessPopup from "@/components/signup/VerificationSuccessPopup";
import { logger } from "@/utils/logger";

interface FormData {
  businessName: string;
  primaryLicense: string;
  licenseState: string;
  licenseType: string;
  businessSubcategory: string;
  businessType: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  website: string;
  additionalLicenses: string;
  additionalInfo: string;
}

interface VerificationFormWrapperProps {
  currentUser: any;
  onNavigate: (path: string) => void;
}

const VerificationFormWrapper = ({ currentUser, onNavigate }: VerificationFormWrapperProps) => {
  const componentLogger = logger.withContext('VerificationFormWrapper');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [instantVerified, setInstantVerified] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [verificationDetails, setVerificationDetails] = useState<any>(null);
  
  const [formData, setFormData] = useState<FormData>({
    businessName: "",
    primaryLicense: "",
    licenseState: "",
    licenseType: "",
    businessSubcategory: "",
    businessType: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    website: "",
    additionalLicenses: "",
    additionalInfo: ""
  });

  // Pre-fill form with user data
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        businessName: currentUser.name || "",
        primaryLicense: currentUser.businessId || "",
        licenseState: currentUser.state || "",
        businessType: currentUser.businessType || "",
        address: currentUser.address || "",
        city: currentUser.city || "",
        state: currentUser.state || "",
        zipCode: currentUser.zipCode || "",
        phone: currentUser.phone || ""
      }));
    }
  }, [currentUser]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleVerificationSuccess = (details: any) => {
    setInstantVerified(true);
    setVerificationDetails(details);
    setShowSuccessPopup(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error("You must be logged in to submit verification");
      return;
    }

    // Validate required fields
    if (!formData.businessName || !formData.primaryLicense) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      componentLogger.debug("Submitting verification request...");

      // Get the session token for authentication
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        componentLogger.error("Error getting session:", sessionError);
        toast.error("Authentication error. Please try logging in again.");
        return;
      }
      
      if (!session) {
        toast.error("You must be logged in to submit verification");
        return;
      }

      const { data, error } = await supabase.functions.invoke('send-verification-request', {
        body: {
          userInfo: {
            id: currentUser.id,
            email: currentUser.email,
            name: currentUser.name
          },
          formData
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        componentLogger.error("Error sending verification request:", error);
        toast.error(`Failed to submit verification request: ${error.message}`);
        return;
      }

      componentLogger.debug("Verification request response:", data);
      toast.success("Verification request submitted successfully! You will be notified once reviewed.");
      onNavigate("/profile");

    } catch (error) {
      componentLogger.error("Error in handleSubmit:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card>
        <VerificationHeader />
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BasicLicenseFields 
                formData={formData}
                onInputChange={handleInputChange}
              />

              {/* Instant Verification Section - Now with all required props */}
              <InstantVerificationSection
                primaryLicense={formData.primaryLicense}
                licenseState={formData.licenseState}
                licenseType={formData.licenseType}
                businessSubcategory={formData.businessSubcategory}
                businessName={formData.businessName}
                currentUserId={currentUser?.id}
                state={formData.state}
                onVerificationSuccess={handleVerificationSuccess}
              />

              {/* Continue with rest of form if not instantly verified */}
              {!instantVerified && (
                <ManualVerificationForm
                  formData={formData}
                  onInputChange={handleInputChange}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                />
              )}
            </div>
          </form>
        </CardContent>
      </Card>
      
      {showSuccessPopup && verificationDetails && (
        <VerificationSuccessPopup
          isOpen={showSuccessPopup}
          businessName={verificationDetails.businessName}
          verificationDetails={verificationDetails.verificationDetails}
        />
      )}
    </>
  );
};

export default VerificationFormWrapper;

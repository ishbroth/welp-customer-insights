
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { BUSINESS_TYPE_OPTIONS, US_STATES } from "@/components/signup/businessFormData";
import VerificationSuccessPopup from "@/components/signup/VerificationSuccessPopup";
import VerificationHeader from "@/components/verification/VerificationHeader";
import InstantVerificationSection from "@/components/verification/InstantVerificationSection";
import ManualVerificationForm from "@/components/verification/ManualVerificationForm";

const VerifyLicense = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [instantVerified, setInstantVerified] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [verificationDetails, setVerificationDetails] = useState<any>(null);
  
  // Form state - pre-filled from user profile
  const [formData, setFormData] = useState({
    businessName: "",
    primaryLicense: "",
    licenseState: "",
    licenseType: "",
    businessType: "",
    businessSubcategory: "",
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
    if (!formData.businessName || !formData.primaryLicense || !formData.businessType) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Submitting verification request...");
      
      // Get the session token for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
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
        console.error("Error sending verification request:", error);
        toast.error(`Failed to submit verification request: ${error.message}`);
        return;
      }

      console.log("Verification request response:", data);
      toast.success("Verification request submitted successfully! You will be notified once reviewed.");
      navigate("/profile");
      
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ea384c] mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!currentUser) {
    navigate("/login");
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button 
            variant="outline"
            className="mb-6" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Card>
            <VerificationHeader />
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      value={formData.businessName}
                      onChange={(e) => handleInputChange("businessName", e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="primaryLicense">Primary License Number *</Label>
                    <Input
                      id="primaryLicense"
                      value={formData.primaryLicense}
                      onChange={(e) => handleInputChange("primaryLicense", e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="businessType">Business Type *</Label>
                    <Select value={formData.businessType} onValueChange={(value) => handleInputChange("businessType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {BUSINESS_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="licenseState">License State *</Label>
                    <Select value={formData.licenseState} onValueChange={(value) => handleInputChange("licenseState", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {US_STATES.map((state) => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Instant Verification Section */}
                  <InstantVerificationSection
                    primaryLicense={formData.primaryLicense}
                    businessType={formData.businessType}
                    licenseState={formData.licenseState}
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
        </div>
      </main>
      <Footer />
      
      {showSuccessPopup && verificationDetails && (
        <VerificationSuccessPopup
          isOpen={showSuccessPopup}
          businessName={verificationDetails.businessName}
          verificationDetails={verificationDetails.verificationDetails}
        />
      )}
    </div>
  );
};

export default VerifyLicense;

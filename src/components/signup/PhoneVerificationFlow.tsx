
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PhoneVerificationFlowProps {
  businessPhone: string;
  setBusinessPhone: (value: string) => void;
  verificationError: string;
  setVerificationError: (value: string) => void;
  onVerificationSuccess: (data: any) => void;
  onBack: () => void;
  businessName: string;
  businessStreet: string;
  businessCity: string;
  businessState: string;
  businessZipCode: string;
  businessEmail: string;
  businessType: string;
}

export const PhoneVerificationFlow = ({
  businessPhone,
  setBusinessPhone,
  verificationError,
  setVerificationError,
  onVerificationSuccess,
  onBack,
  businessName,
  businessStreet,
  businessCity,
  businessState,
  businessZipCode,
  businessEmail,
  businessType
}: PhoneVerificationFlowProps) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isTextVerificationSent, setIsTextVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [sentVerificationCode, setSentVerificationCode] = useState("");
  const { toast } = useToast();

  const sendTextVerification = async () => {
    if (!businessPhone) {
      setVerificationError("Please provide a valid phone number for verification.");
      return;
    }
    
    setIsVerifying(true);
    
    try {
      // Generate a random 6-digit code for demo purposes
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setSentVerificationCode(code);

      // In a real app, this would send an SMS via a service
      // For demo purposes, we'll just show the code in a toast
      toast({
        title: "Verification Code Sent",
        description: `A verification code has been sent to ${businessPhone}. For demo purposes, the code is: ${code}`,
      });
      
      setIsTextVerificationSent(true);
    } catch (error) {
      console.error("Error sending verification code:", error);
      setVerificationError("Failed to send verification code. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };
  
  const verifyTextCode = () => {
    if (verificationCode === sentVerificationCode) {
      // Store business data with partial verification flag
      const businessData = {
        name: businessName,
        email: businessEmail,
        phone: businessPhone,
        address: `${businessStreet}, ${businessCity}, ${businessState} ${businessZipCode}`,
        businessType: businessType,
        state: businessState,
        city: businessCity,
        verificationMethod: "phone",
        isFullyVerified: false
      };
      
      // Store the verification data in session storage
      sessionStorage.setItem("businessVerificationData", JSON.stringify(businessData));
      
      const verificationData = {
        name: businessName,
        address: `${businessStreet}, ${businessCity}, ${businessState} ${businessZipCode}`,
        phone: businessPhone,
        email: businessEmail,
        verificationMethod: "phone",
        isFullyVerified: false
      };
      
      setVerificationError("");
      onVerificationSuccess(verificationData);
      
      toast({
        title: "Phone Verification Successful",
        description: "Your phone has been verified. You can continue with limited access until your business is fully verified.",
      });
    } else {
      setVerificationError("Invalid verification code. Please try again.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 border border-amber-300 bg-amber-50 rounded-md">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
          <div>
            <h3 className="font-medium text-amber-800">Business Verification Alternative</h3>
            <p className="text-sm text-amber-700 mt-1">
              We couldn't verify your business license or EIN. You can continue with phone verification 
              instead, but you'll have limited access until your business is fully verified.
            </p>
            <div className="mt-2 text-sm text-amber-700">
              <strong>With limited access, you can:</strong>
              <ul className="list-disc pl-5 mt-1">
                <li>Search the customer database</li>
                <li>Purchase one-time access to view specific reviews</li>
                <li>Subscribe to view all customer reviews</li>
              </ul>
            </div>
            <div className="mt-2 text-sm text-amber-700">
              <strong>You will not be able to:</strong>
              <ul className="list-disc pl-5 mt-1">
                <li>Write or add customer reviews</li>
              </ul>
            </div>
            <p className="text-sm text-amber-700 mt-2">
              You can complete full verification later through your profile page.
            </p>
          </div>
        </div>
      </div>

      {!isTextVerificationSent ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="businessPhone" className="block text-sm font-medium mb-1">Confirm Phone Number for Verification</label>
            <Input
              id="businessPhone"
              placeholder="(555) 123-4567"
              value={businessPhone}
              onChange={(e) => setBusinessPhone(e.target.value)}
              className="welp-input"
              required
            />
          </div>
          
          <div className="flex space-x-3">
            <Button 
              onClick={sendTextVerification}
              className="welp-button"
              disabled={isVerifying || !businessPhone}
            >
              {isVerifying ? "Sending..." : "Send Verification Code"}
            </Button>
            
            <Button onClick={onBack} variant="outline">
              Back
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label htmlFor="verificationCode" className="block text-sm font-medium mb-1">Enter Verification Code</label>
            <Input
              id="verificationCode"
              placeholder="6-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="welp-input"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Enter the 6-digit code sent to {businessPhone}</p>
          </div>
          
          {verificationError && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {verificationError}
            </div>
          )}
          
          <div className="flex space-x-3">
            <Button 
              onClick={verifyTextCode}
              className="welp-button"
              disabled={!verificationCode || verificationCode.length !== 6}
            >
              Verify Code
            </Button>
            
            <Button onClick={sendTextVerification} variant="outline">
              Resend Code
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

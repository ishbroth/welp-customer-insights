
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, Phone, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { resendVerificationCode } from "@/lib/utils";
import { useVerificationTimer } from "@/hooks/useVerificationTimer";
import { logger } from "@/utils/logger";

interface AccountCreatedPopupProps {
  isOpen: boolean;
  onClose?: () => void;
  businessName: string;
  businessPhone: string;
  setBusinessPhone: (value: string) => void;
  businessData: any;
}

const AccountCreatedPopup = ({ 
  isOpen, 
  onClose,
  businessName, 
  businessPhone, 
  setBusinessPhone, 
  businessData
}: AccountCreatedPopupProps) => {
  const componentLogger = logger.withContext('AccountCreatedPopup');
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  
  const { 
    isDisabled: isResendDisabled, 
    timer, 
    startTimer 
  } = useVerificationTimer();

  const handleSendVerification = async () => {
    if (!businessPhone) {
      toast({
        title: "Error",
        description: "Please enter a valid phone number.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { success, error } = await resendVerificationCode({ phoneNumber: businessPhone });
      
      if (success) {
        startTimer();
        setVerificationSent(true);
        
        // Update the business data with the phone number
        const updatedBusinessData = { ...businessData, phone: businessPhone };
        sessionStorage.setItem("businessVerificationData", JSON.stringify(updatedBusinessData));
        
        toast({
          title: "Verification Code Sent",
          description: `A verification code has been sent to ${businessPhone}.`,
        });
        
        // Close the popup if onClose is provided
        if (onClose) {
          onClose();
        }
        
        // Redirect to the verification page with necessary parameters
        const params = new URLSearchParams({
          email: businessData.email,
          password: businessData.password || "",
          name: businessData.name,
          phone: businessPhone,
          accountType: "business",
          businessName: businessData.businessName || businessData.name,
          address: businessData.address || "",
          city: businessData.city || "",
          state: businessData.state || "",
          zipCode: businessData.zipCode || ""
        });
        
        navigate(`/verify-phone?${params.toString()}`);
      } else {
        toast({
          title: "Error",
          description: error || "Failed to send verification code. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      componentLogger.error("Error sending verification code:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose || (() => {})}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <DialogTitle className="text-xl font-bold text-green-700">
            Account Created!
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center space-y-4">
          <p className="text-gray-600">
            Your business account for <strong>{businessName}</strong> has been created successfully.
          </p>
          
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-left">
                <h3 className="font-medium text-amber-800">Business ID Verification</h3>
                <p className="text-sm text-amber-700 mt-1">
                  Your business ID could not be instantly verified. Complete phone verification now to activate your account with limited access.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Phone className="h-5 w-5 text-gray-500" />
              <h3 className="font-medium">Phone Verification Required</h3>
            </div>
            
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium mb-1 text-left">
                Phone Number
              </label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="(555) 123-4567"
                value={businessPhone}
                onChange={(e) => setBusinessPhone(e.target.value)}
                className="welp-input"
                disabled={isLoading || verificationSent}
                required
              />
            </div>
            
            <Button
              onClick={handleSendVerification}
              className="welp-button w-full"
              disabled={isLoading || isResendDisabled || !businessPhone}
            >
              {isLoading ? "Sending..." : isResendDisabled ? `Resend Code (${timer}s)` : "Send Verification Code"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccountCreatedPopup;

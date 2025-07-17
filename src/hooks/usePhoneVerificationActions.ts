
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { verifyPhoneNumber, resendVerificationCode } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface UsePhoneVerificationActionsProps {
  email: string | null;
  password: string | null;
  name: string | null;
  phoneNumber: string | null;
  accountType: string | null;
  businessName?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  setIsCodeValid: (valid: boolean) => void;
  setIsVerifying: (verifying: boolean) => void;
  setIsResending: (resending: boolean) => void;
  startTimer: () => void;
}

export const usePhoneVerificationActions = ({
  email,
  password,
  name,
  phoneNumber,
  accountType,
  businessName,
  address,
  city,
  state,
  zipCode,
  setIsCodeValid,
  setIsVerifying,
  setIsResending,
  startTimer
}: UsePhoneVerificationActionsProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleVerifyCode = async (verificationCode: string) => {
    if (!phoneNumber || !verificationCode || !email || !password) {
      toast({
        title: "Error",
        description: "Missing required information for verification.",
        variant: "destructive",
      });
      return;
    }
    
    setIsVerifying(true);
    
    try {
      // Verify the code
      const { isValid, error } = await verifyPhoneNumber({
        phoneNumber,
        code: verificationCode
      });
      
      if (isValid) {
        // Now create the actual user account
        console.log("Phone verified, creating user account...");
        
        // Split name into first and last name
        const nameParts = (name || '').trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        // Create the user account in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            data: { 
              name, 
              type: accountType,
              address,
              city,
              state,
              zipCode: zipCode,
              phone: phoneNumber,
              first_name: firstName,
              last_name: lastName
            },
            emailRedirectTo: `${window.location.origin}/login`,
          }
        });

        if (authError) {
          console.error("Auth signup error:", authError);
          throw new Error(authError.message);
        }

        if (authData.user) {
          console.log("User created in auth, creating profile...");
          
          // Create profile using the edge function
          const { error: profileError } = await supabase.functions.invoke('create-profile', {
            body: {
              userId: authData.user.id,
              name: name,
              phone: phoneNumber,
              address: address,
              city: city,
              state: state,
              zipCode: zipCode,
              type: accountType,
              businessName: businessName,
              email: email,
              // CRITICAL: For customer accounts, set verified to true since phone verification is complete
              verified: accountType === 'customer' ? true : false
            }
          });

          if (profileError) {
            console.error("Profile creation error:", profileError);
            throw new Error(profileError.message);
          }

          console.log("Profile created successfully");
          console.log(`Customer account verification status set to: ${accountType === 'customer'}`);

          // Show success toast
          toast({
            title: "Account Created Successfully!",
            description: accountType === 'customer' 
              ? "Your account has been created and verified. You can now log in." 
              : "Your phone number has been verified. Now let's set up your password.",
          });
          
          // Redirect based on account type
          if (accountType === 'business') {
            navigate('/business-password-setup', {
              state: {
                businessEmail: email,
                phone: phoneNumber,
                businessName,
                address,
                city,
                state,
                zipCode
              }
            });
          } else {
            // For customer accounts, redirect to login with success message
            navigate("/login", {
              state: {
                message: "Account created successfully! Please log in with your credentials.",
                email: email
              }
            });
          }
        }
      } else {
        setIsCodeValid(false);
        toast({
          title: "Verification Failed",
          description: error || "Invalid verification code. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during verification.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!phoneNumber) return;
    
    setIsResending(true);
    
    try {
      const { success, error } = await resendVerificationCode({ 
        phoneNumber
      });
      
      if (success) {
        startTimer();
        toast({
          title: "Code Resent",
          description: `A new verification code has been sent to ${phoneNumber}.`,
        });
      } else {
        toast({
          title: "Error",
          description: error || "Failed to resend verification code. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error resending code:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return {
    handleVerifyCode,
    handleResendCode
  };
};

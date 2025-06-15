
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { checkDuplicatesViaEdgeFunction } from "@/services/duplicateAccount/edgeFunctionChecker";

interface CustomerSignupData {
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  customerStreet: string;
  customerApartmentSuite?: string;
  customerCity: string;
  customerState: string;
  customerZipCode: string;
  customerPassword: string;
  customerConfirmPassword: string;
}

export const useCustomerSignupActions = (
  setIsSubmitting: (value: boolean) => void,
  checkEmailExists: (email: string) => Promise<boolean>
) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCreateCustomerAccount = async (data: CustomerSignupData) => {
    const {
      customerFirstName,
      customerLastName,
      customerEmail,
      customerPhone,
      customerStreet,
      customerApartmentSuite,
      customerCity,
      customerState,
      customerZipCode,
      customerPassword,
      customerConfirmPassword
    } = data;

    // Validate customer information
    if (
      !customerFirstName || 
      !customerLastName || 
      !customerPhone || 
      !customerEmail || 
      !customerPassword ||
      customerPassword !== customerConfirmPassword
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill out all required fields and ensure passwords match.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create full address string including apartment/suite if provided
      const fullAddress = customerApartmentSuite 
        ? `${customerStreet}, ${customerApartmentSuite}`
        : customerStreet;

      // Final duplicate check before proceeding using edge function
      console.log("=== FINAL CUSTOMER DUPLICATE CHECK VIA EDGE FUNCTION ===");
      const finalDuplicateCheck = await checkDuplicatesViaEdgeFunction(
        customerEmail, 
        customerPhone, 
        undefined,
        undefined,
        'customer'
      );
      
      console.log("Final customer duplicate check result:", finalDuplicateCheck);
      
      if (finalDuplicateCheck.isDuplicate && !finalDuplicateCheck.allowContinue) {
        toast({
          title: "Duplicate Account Found",
          description: "An account with this information already exists. Please check your details or sign in instead.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      // Send verification code via Edge Function
      const { data, error } = await supabase.functions.invoke('verify-phone', {
        body: {
          phoneNumber: customerPhone,
          actionType: "send"
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Store user data in URL parameters to pass to the verification page
      const params = new URLSearchParams({
        email: customerEmail,
        password: customerPassword,
        name: `${customerFirstName} ${customerLastName}`,
        phone: customerPhone,
        accountType: "customer",
        address: fullAddress,
        city: customerCity,
        state: customerState,
        zipCode: customerZipCode
      });
      
      // Show a success toast and redirect to verification page
      toast({
        title: "Verification Code Sent",
        description: `A verification code has been sent to ${customerPhone}. Please verify your phone number to complete registration.`,
      });
      
      // Redirect to verification page
      navigate(`/verify-phone?${params.toString()}`);
      
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Signup Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleCreateCustomerAccount };
};

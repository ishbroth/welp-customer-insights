
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CustomerPersonalInfoSection } from "./CustomerPersonalInfoSection";
import { CustomerAddressSection } from "./CustomerAddressSection";
import { CustomerPasswordSection } from "./CustomerPasswordSection";

const CustomerSignupForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Customer form state
  const [customerFirstName, setCustomerFirstName] = useState("");
  const [customerLastName, setCustomerLastName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerStreet, setCustomerStreet] = useState("");
  const [customerCity, setCustomerCity] = useState("");
  const [customerState, setCustomerState] = useState("");
  const [customerZipCode, setCustomerZipCode] = useState("");
  const [customerPassword, setCustomerPassword] = useState("");
  const [customerConfirmPassword, setCustomerConfirmPassword] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingEmailError, setExistingEmailError] = useState(false);
  
  // Email validation to check if it's already registered
  const checkEmailExists = async (email: string) => {
    try {
      // Check if the email already exists in auth
      const { error, data } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false
        }
      });
      
      // If there's no error when trying to send a one-time password to the email,
      // it means the email exists
      if (!error) {
        setExistingEmailError(true);
        return true;
      }
      
      // If error contains "Email not confirmed" or "Invalid login credentials", 
      // it means the email exists but password is wrong
      if (error.message.includes("Email not confirmed") || 
          error.message.includes("Invalid login credentials")) {
        setExistingEmailError(true);
        return true;
      }
      
      setExistingEmailError(false);
      return false;
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    }
  };
  
  const handleCreateCustomerAccount = async () => {
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
      // First, check if email is already registered
      const emailExists = await checkEmailExists(customerEmail);
      
      if (emailExists) {
        setIsSubmitting(false);
        // No need for toast here as we'll show an inline error message
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
        address: customerStreet,
        city: customerCity,
        state: customerState,
        zipCode: customerZipCode
      });
      
      // Show a success toast and redirect to verification page
      toast({
        title: "Verification Code Sent",
        description: `A verification code has been sent to ${customerPhone}. Please verify your phone number.`,
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
  
  // Email blur handler to check if email exists
  const handleEmailBlur = async () => {
    if (customerEmail) {
      await checkEmailExists(customerEmail);
    }
  };

  const handleEmailChange = (value: string) => {
    setCustomerEmail(value);
    if (existingEmailError) setExistingEmailError(false);
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Create Customer Account</h2>
      
      <CustomerPersonalInfoSection
        firstName={customerFirstName}
        setFirstName={setCustomerFirstName}
        lastName={customerLastName}
        setLastName={setCustomerLastName}
        email={customerEmail}
        setEmail={setCustomerEmail}
        phone={customerPhone}
        setPhone={setCustomerPhone}
        existingEmailError={existingEmailError}
        onEmailBlur={handleEmailBlur}
        onEmailChange={handleEmailChange}
      />
      
      <CustomerAddressSection
        street={customerStreet}
        setStreet={setCustomerStreet}
        city={customerCity}
        setCity={setCustomerCity}
        state={customerState}
        setState={setCustomerState}
        zipCode={customerZipCode}
        setZipCode={setCustomerZipCode}
      />
      
      <CustomerPasswordSection
        password={customerPassword}
        setPassword={setCustomerPassword}
        confirmPassword={customerConfirmPassword}
        setConfirmPassword={setCustomerConfirmPassword}
      />
      
      <div className="pt-4">
        <Button
          onClick={handleCreateCustomerAccount}
          className="welp-button w-full"
          disabled={
            !customerFirstName || 
            !customerLastName || 
            !customerPhone || 
            !customerEmail || 
            !customerPassword || 
            customerPassword !== customerConfirmPassword ||
            isSubmitting ||
            existingEmailError
          }
        >
          {isSubmitting ? "Sending Verification..." : "Continue to Verification"}
        </Button>
      </div>
    </div>
  );
};

export default CustomerSignupForm;

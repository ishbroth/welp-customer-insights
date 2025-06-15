
import { Button } from "@/components/ui/button";
import { CustomerPersonalInfoSection } from "./CustomerPersonalInfoSection";
import { CustomerAddressSection } from "./CustomerAddressSection";
import { CustomerPasswordSection } from "./CustomerPasswordSection";
import { useCustomerSignupState } from "@/hooks/useCustomerSignupState";
import { useCustomerEmailValidation } from "@/hooks/useCustomerEmailValidation";
import { useCustomerSignupActions } from "@/hooks/useCustomerSignupActions";

export const CustomerSignupFormContainer = () => {
  const {
    customerFirstName,
    setCustomerFirstName,
    customerLastName,
    setCustomerLastName,
    customerEmail,
    setCustomerEmail,
    customerPhone,
    setCustomerPhone,
    customerStreet,
    setCustomerStreet,
    customerCity,
    setCustomerCity,
    customerState,
    setCustomerState,
    customerZipCode,
    setCustomerZipCode,
    customerPassword,
    setCustomerPassword,
    customerConfirmPassword,
    setCustomerConfirmPassword,
    isSubmitting,
    setIsSubmitting,
    existingEmailError,
    setExistingEmailError
  } = useCustomerSignupState();

  const { checkEmailExists } = useCustomerEmailValidation(setExistingEmailError);
  const { handleCreateCustomerAccount } = useCustomerSignupActions(setIsSubmitting, checkEmailExists);

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

  const onSubmit = () => {
    handleCreateCustomerAccount({
      customerFirstName,
      customerLastName,
      customerEmail,
      customerPhone,
      customerStreet,
      customerCity,
      customerState,
      customerZipCode,
      customerPassword,
      customerConfirmPassword
    });
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
          onClick={onSubmit}
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

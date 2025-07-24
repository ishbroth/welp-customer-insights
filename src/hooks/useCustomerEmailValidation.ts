
import { checkEmailExistsInCustomerAccounts } from "@/services/duplicateAccount/emailChecker";

export const useCustomerEmailValidation = (setExistingEmailError: (value: boolean) => void) => {
  // Email validation to check if it's already registered within customer accounts only
  const checkEmailExists = async (email: string) => {
    try {
      console.log("=== CUSTOMER EMAIL VALIDATION START ===");
      console.log("Checking customer email exists for:", email);
      
      const exists = await checkEmailExistsInCustomerAccounts(email);
      
      console.log("Customer email exists result:", exists);
      setExistingEmailError(exists);
      
      console.log("=== CUSTOMER EMAIL VALIDATION END ===");
      return exists;
    } catch (error) {
      console.error("Error checking customer email:", error);
      setExistingEmailError(false);
      return false;
    }
  };

  return { checkEmailExists };
};

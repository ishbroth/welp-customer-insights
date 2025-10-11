
import { checkEmailExistsInCustomerAccounts } from "@/services/duplicateAccount/emailChecker";
import { logger } from '@/utils/logger';

const hookLogger = logger.withContext('useCustomerEmailValidation');

export const useCustomerEmailValidation = (setExistingEmailError: (value: boolean) => void) => {
  // Email validation to check if it's already registered within customer accounts only
  const checkEmailExists = async (email: string) => {
    try {
      hookLogger.debug("=== CUSTOMER EMAIL VALIDATION START ===");
      hookLogger.debug("Checking customer email exists for:", email);

      const exists = await checkEmailExistsInCustomerAccounts(email);

      hookLogger.debug("Customer email exists result:", exists);
      setExistingEmailError(exists);

      hookLogger.debug("=== CUSTOMER EMAIL VALIDATION END ===");
      return exists;
    } catch (error) {
      hookLogger.error("Error checking customer email:", error);
      setExistingEmailError(false);
      return false;
    }
  };

  return { checkEmailExists };
};


import { checkEmailExists } from "./duplicateAccount/emailChecker";
import { checkBusinessNameAndPhoneExists } from "./duplicateAccount/businessChecker";
import { checkCustomerNameAndPhoneExists } from "./duplicateAccount/customerChecker";
import { DuplicateCheckResult } from "./duplicateAccount/types";

// Re-export types for backward compatibility
export type { DuplicateCheckResult } from "./duplicateAccount/types";

// Re-export individual checkers for direct use if needed
export { checkEmailExists } from "./duplicateAccount/emailChecker";
export { checkPhoneExists } from "./duplicateAccount/phoneChecker";
export { checkBusinessNameAndPhoneExists } from "./duplicateAccount/businessChecker";
export { checkCustomerNameAndPhoneExists } from "./duplicateAccount/customerChecker";

/**
 * Comprehensive duplicate account check for business accounts
 * Only shows popup if name AND phone both match existing accounts
 */
export const checkForDuplicateAccount = async (
  email: string, 
  phone: string,
  businessName?: string
): Promise<DuplicateCheckResult> => {
  // First check for email duplicates (always block these)
  const emailExists = await checkEmailExists(email);
  if (emailExists) {
    return {
      isDuplicate: true,
      duplicateType: 'email',
      existingEmail: email,
      allowContinue: false
    };
  }
  
  // If business name is provided, check for business name + phone combination
  if (businessName) {
    const businessNameAndPhoneResult = await checkBusinessNameAndPhoneExists(businessName, phone);
    if (businessNameAndPhoneResult.exists) {
      return {
        isDuplicate: true,
        duplicateType: 'business_name',
        existingPhone: phone,
        existingEmail: businessNameAndPhoneResult.email,
        allowContinue: true // Allow continue for business name matches
      };
    }
  }
  
  return {
    isDuplicate: false,
    duplicateType: null,
    allowContinue: false
  };
};

/**
 * Comprehensive duplicate account check for customer accounts
 * Only shows popup if name AND phone both match existing accounts
 */
export const checkForDuplicateCustomerAccount = async (
  email: string, 
  phone: string,
  firstName?: string,
  lastName?: string
): Promise<DuplicateCheckResult> => {
  // First check for email duplicates (always block these)
  const emailExists = await checkEmailExists(email);
  if (emailExists) {
    return {
      isDuplicate: true,
      duplicateType: 'email',
      existingEmail: email,
      allowContinue: false
    };
  }
  
  // If customer name is provided, check for customer name + phone combination
  if (firstName && lastName) {
    const customerNameAndPhoneResult = await checkCustomerNameAndPhoneExists(firstName, lastName, phone);
    if (customerNameAndPhoneResult.exists) {
      return {
        isDuplicate: true,
        duplicateType: 'customer_name',
        existingPhone: phone,
        existingEmail: customerNameAndPhoneResult.email,
        allowContinue: true // Allow continue for customer name matches
      };
    }
  }
  
  return {
    isDuplicate: false,
    duplicateType: null,
    allowContinue: false
  };
};

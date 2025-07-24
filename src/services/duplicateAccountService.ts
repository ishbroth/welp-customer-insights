
import { checkEmailExistsInBusinessAccounts, checkEmailExistsInCustomerAccounts } from "./duplicateAccount/emailChecker";
import { checkPhoneExists } from "./duplicateAccount/phoneChecker";
import { checkAddressExists } from "./duplicateAccount/addressChecker";
import { checkBusinessNameAndPhoneExists } from "./duplicateAccount/businessChecker";
import { checkBusinessNameAndAddressExists } from "./duplicateAccount/businessAddressChecker";
import { checkCustomerNameAndPhoneExists, checkCustomerPhoneExists } from "./duplicateAccount/customerChecker";
import { DuplicateCheckResult } from "./duplicateAccount/types";

// Re-export types for backward compatibility
export type { DuplicateCheckResult } from "./duplicateAccount/types";

// Re-export individual checkers for direct use if needed
export { checkEmailExistsInBusinessAccounts, checkEmailExistsInCustomerAccounts } from "./duplicateAccount/emailChecker";
export { checkPhoneExists } from "./duplicateAccount/phoneChecker";
export { checkAddressExists } from "./duplicateAccount/addressChecker";
export { checkBusinessNameAndPhoneExists } from "./duplicateAccount/businessChecker";
export { checkBusinessNameAndAddressExists } from "./duplicateAccount/businessAddressChecker";
export { checkCustomerNameAndPhoneExists, checkCustomerPhoneExists } from "./duplicateAccount/customerChecker";

/**
 * Comprehensive duplicate account check for business accounts
 * Only checks for duplicates within business account type
 */
export const checkForDuplicateAccount = async (
  email: string, 
  phone: string,
  businessName?: string,
  address?: string
): Promise<DuplicateCheckResult> => {
  // Check for email duplicates only within business accounts
  const emailExists = await checkEmailExistsInBusinessAccounts(email);
  if (emailExists) {
    return {
      isDuplicate: true,
      duplicateType: 'email',
      existingEmail: email,
      allowContinue: false
    };
  }
  
  // Check for phone duplicates (should also block/warn)
  const phoneExists = await checkPhoneExists(phone);
  if (phoneExists) {
    return {
      isDuplicate: true,
      duplicateType: 'phone',
      existingPhone: phone,
      allowContinue: true // Allow continue for phone matches
    };
  }
  
  // Check for address duplicates if address is provided
  if (address) {
    const addressExists = await checkAddressExists(address);
    if (addressExists) {
      return {
        isDuplicate: true,
        duplicateType: 'address',
        existingAddress: address,
        allowContinue: true // Allow continue for address matches
      };
    }
  }
  
  // If business name is provided, check for business name + phone combination as additional check
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
  
  // If business name and address are provided, check for business name + address combination
  if (businessName && address) {
    const businessNameAndAddressResult = await checkBusinessNameAndAddressExists(businessName, address);
    if (businessNameAndAddressResult.exists) {
      return {
        isDuplicate: true,
        duplicateType: 'business_address',
        existingAddress: address,
        existingEmail: businessNameAndAddressResult.email,
        allowContinue: true // Allow continue for business name + address matches
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
 * Only checks for duplicates within customer account type
 */
export const checkForDuplicateCustomerAccount = async (
  email: string, 
  phone: string,
  firstName?: string,
  lastName?: string,
  address?: string
): Promise<DuplicateCheckResult> => {
  // Check for email duplicates only within customer accounts
  const emailExists = await checkEmailExistsInCustomerAccounts(email);
  if (emailExists) {
    return {
      isDuplicate: true,
      duplicateType: 'email',
      existingEmail: email,
      allowContinue: false
    };
  }
  
  // Check for phone duplicates only within customer accounts
  const phoneExists = await checkCustomerPhoneExists(phone);
  if (phoneExists) {
    return {
      isDuplicate: true,
      duplicateType: 'phone',
      existingPhone: phone,
      allowContinue: true // Allow continue for phone matches
    };
  }
  
  // Check for address duplicates if address is provided
  if (address) {
    const addressExists = await checkAddressExists(address);
    if (addressExists) {
      return {
        isDuplicate: true,
        duplicateType: 'address',
        existingAddress: address,
        allowContinue: true // Allow continue for address matches
      };
    }
  }
  
  // If customer name is provided, check for customer name + phone combination within customer accounts only
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

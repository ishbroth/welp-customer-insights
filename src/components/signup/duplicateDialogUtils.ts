
import { DuplicateCheckResult } from "@/services/duplicateAccountService";

export const getDuplicateMessage = (duplicateResult: DuplicateCheckResult): string => {
  switch (duplicateResult.duplicateType) {
    case 'email':
      return `An account with the email ${duplicateResult.existingEmail} already exists for this account type.`;
    case 'business_name':
      return `A business with this name and phone number already exists. You can continue if this is a different location.`;
    case 'customer_name':
      return `A customer with this name and phone number already exists. You can continue if this is a different person with the same name.`;
    default:
      return "An account with this information already exists for this account type.";
  }
};

export const getDialogTitle = (duplicateResult: DuplicateCheckResult): string => {
  switch (duplicateResult.duplicateType) {
    case 'business_name':
      return 'Business Already Exists';
    case 'customer_name':
      return 'Customer Already Exists';
    default:
      return 'Account Already Exists';
  }
};

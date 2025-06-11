
export interface DuplicateCheckResult {
  isDuplicate: boolean;
  duplicateType: 'email' | 'phone' | 'address' | 'business_name' | 'business_address' | 'customer_name' | 'business_combination' | null;
  existingEmail?: string;
  existingPhone?: string;
  existingAddress?: string;
  existingName?: string;
  matchedFields?: string[];
  allowContinue: boolean;
}

export interface DuplicateDialogData {
  isOpen: boolean;
  duplicateType: DuplicateCheckResult['duplicateType'];
  existingEmail?: string;
  existingPhone?: string;
  existingAddress?: string;
  existingName?: string;
  matchedFields?: string[];
  allowContinue: boolean;
}


export interface DuplicateCheckResult {
  isDuplicate: boolean;
  duplicateType: 'email' | 'phone' | 'address' | 'business_name' | 'business_address' | 'customer_name' | null;
  existingEmail?: string;
  existingPhone?: string;
  existingAddress?: string;
  allowContinue: boolean;
}


export interface DuplicateCheckResult {
  isDuplicate: boolean;
  duplicateType: 'email' | 'phone' | 'both' | 'business_name' | 'customer_name' | null;
  existingEmail?: string;
  existingPhone?: string;
  allowContinue?: boolean; // New field to control continue option
}

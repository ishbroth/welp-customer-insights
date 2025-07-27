
export interface DuplicateCheckRequest {
  email?: string;
  phone?: string;
  businessName?: string;
  address?: string;
  accountType: 'business' | 'customer';
}

export interface DuplicateCheckResponse {
  isDuplicate: boolean;
  duplicateType: 'email' | 'phone' | 'address' | 'business_name' | 'business_combination' | null;
  existingEmail?: string;
  existingPhone?: string;
  existingAddress?: string;
  matchedFields?: string[];
  allowContinue: boolean;
  debug_info?: any;
}

export interface Profile {
  id: string;
  email?: string;
  name?: string;
  type: string;
  phone?: string;
  address?: string;
}


import type { Database } from '@/integrations/supabase/types';

// Re-export the Database type from the generated types
export type { Database };

// Define our own types for working with the Supabase data
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
export type BusinessInfo = Database['public']['Tables']['business_info']['Row'];
export type Response = Database['public']['Tables']['responses']['Row'];
export type Subscription = Database['public']['Tables']['subscriptions']['Row'];
export type CustomerAccess = Database['public']['Tables']['customer_access']['Row'];

// Input types for inserting data
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ReviewInsert = Database['public']['Tables']['reviews']['Insert'];
export type BusinessInfoInsert = Database['public']['Tables']['business_info']['Insert'];
export type ResponseInsert = Database['public']['Tables']['responses']['Insert'];
export type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert'];
export type CustomerAccessInsert = Database['public']['Tables']['customer_access']['Insert'];

// Define any additional custom types we need
export interface UserWithProfile {
  id: string;
  email?: string;
  type: 'business' | 'customer';
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
}

export interface BusinessWithInfo extends UserWithProfile {
  business_name: string;
  license_number?: string;
  verified: boolean;
}

// Define search input parameters
export interface SearchParams {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  fuzzyMatch?: boolean;
  similarityThreshold?: number;
}

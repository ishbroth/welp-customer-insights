
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

export interface ProfileCustomer {
  id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  searchScore: number;
  matchCount: number;
}

export interface ReviewData {
  id: string;
  customer_name: string | null;
  customer_address: string | null;
  customer_city: string | null;
  customer_zipcode: string | null;
  customer_phone: string | null;
  rating: number;
  content: string;
  created_at: string;
  business_id: string | null;
  reviewerName?: string;
  reviewerAvatar?: string;
  reviewerVerified?: boolean;
  business_profile?: {
    id: string;
    name: string;
    avatar?: string;
    state?: string;
    [key: string]: any;
  } | null;
}

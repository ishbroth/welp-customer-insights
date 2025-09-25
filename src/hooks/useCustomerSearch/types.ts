
export interface SearchParams {
  lastName: string;
  firstName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  fuzzyMatch: boolean;
  similarityThreshold: number;
}

export interface ProfileCustomer {
  id: string;
  first_name: string;
  last_name: string;
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
  customer_name?: string;
  customer_address?: string;
  customer_city?: string;
  customer_zipcode?: string;
  customer_phone?: string;
  rating: number;
  content: string;
  created_at?: string;
  business_id?: string;
  business_profile?: any;
  reviewerName?: string;
  reviewerAvatar?: string;
  reviewerVerified?: boolean;
  associates?: Array<{ firstName: string; lastName: string }>;
  // Associate match metadata
  isAssociateMatch?: boolean;
  associateData?: { firstName: string; lastName: string };
  original_customer_name?: string;
  original_customer_address?: string;
  original_customer_city?: string;
  original_customer_zipcode?: string;
  original_customer_phone?: string;
}

export interface GroupedReviewData extends ReviewData {
  matchingReviews: ReviewData[];
  averageRating: number;
  totalReviews: number;
}

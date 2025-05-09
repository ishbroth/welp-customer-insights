
// Database types for Supabase tables
export type SearchableCustomer = {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  is_business: boolean;
  business_name?: string;
  verification_status: string;
  created_at: string;
  updated_at: string;
};

export type Review = {
  id: string;
  reviewer_id: string;
  customer_id: string;
  rating: number;
  content: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  created_at: string;
  updated_at: string;
};

export type ReviewWithCustomer = Review & {
  customer: SearchableCustomer;
  reviewer_name: string;
  customerName?: string;
  responses?: ReviewResponse[];
  reactions?: {
    like: string[];
    funny: string[];
    useful: string[];
    ohNo: string[];
  };
};

export type ReviewReaction = {
  id: string;
  review_id: string;
  user_id: string;
  reaction_type: string;
  created_at: string;
};

export type ReviewResponse = {
  id: string;
  review_id: string;
  author_id: string; // Using the database column name
  content: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  author_name?: string;
  replies?: ReviewResponse[];
};

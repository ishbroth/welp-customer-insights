export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  type: "business" | "customer" | "admin";
  avatar?: string;
  bio?: string;
  businessId?: string;
  licenseType?: string;
  businessInfo?: {
    business_name: string;
    business_category?: string;
    business_subcategory?: string;
    license_number?: string;
    license_type?: string;
    license_state?: string;
    license_status?: string;
    license_expiration?: string;
    website?: string;
    additional_info?: string;
    additional_licenses?: string;
    verified: boolean;
  };
}

export interface Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  reviewerVerified?: boolean;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  rating: number;
  content: string;
  date: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  customer_address?: string;
  customer_city?: string;
  customer_zipcode?: string;
  customer_phone?: string;
  customer_business_name?: string;
  associates?: Array<{ firstName: string; lastName: string }>;
  reactions?: {
    like: string[];
    funny: string[];
    ohNo: string[];
  };
  responses?: ReviewResponse[];
  location?: string;
  // Anonymous review functionality
  is_anonymous?: boolean;
  reviewerBusinessCategory?: string;
  reviewerBusinessSubcategory?: string;
  // Extended properties for business profile reviews
  isClaimed?: boolean;
  isUnlocked?: boolean;
  canReact?: boolean;
  canRespond?: boolean;
}

export interface ReviewResponse {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  replies?: ReviewResponse[];
}

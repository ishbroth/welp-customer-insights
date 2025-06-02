export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  avatar?: string;
  averageRating?: number;
  totalReviews?: number;
  isSubscriptionNeeded?: boolean;
  businessProfile?: {
    name: string;
    avatar?: string;
  } | null;
  reviews?: Array<{
    id: string;
    reviewerId: string;
    reviewerName: string;
    rating: number;
    content: string;
    date: string;
    reviewerVerified?: boolean;
  }>;
}

export interface SearchFilters {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface SearchResults {
  customers: Customer[];
  totalResults: number;
}

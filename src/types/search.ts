
export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  averageRating?: number;
  totalReviews?: number;
  isSubscriptionNeeded?: boolean;
  businessProfile?: {
    name: string;
    avatar?: string;
  } | null;
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

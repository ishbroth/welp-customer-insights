
export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  totalReviews: number;
  averageRating: number;
  isSubscriptionNeeded?: boolean;
  avatar?: string; // Add avatar field
}

export interface SearchFilters {
  state?: string;
  city?: string;
  rating?: number;
  sortBy?: 'name' | 'rating' | 'reviews';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResults {
  customers: Customer[];
  totalCount: number;
  hasMore: boolean;
}

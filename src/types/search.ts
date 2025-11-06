
export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  avatar?: string;
  verified?: boolean; // Add verification status
  relevancyScore?: number; // Relevancy score for search result sorting
  // Associate match metadata
  isAssociateMatch?: boolean;
  associateData?: { firstName: string; lastName: string };
  originalCustomerInfo?: {
    name?: string;
    phone?: string;
    address?: string;
    city?: string;
    zipCode?: string;
  };
  reviews?: Array<{
    id: string;
    reviewerId: string;
    reviewerName: string;
    rating: number;
    content: string;
    date: string;
    reviewerVerified?: boolean;
    reviewerCity?: string;
    reviewerState?: string;
    customerId?: string;
  }>;
}

export interface SearchFilters {
  minRating: number;
  maxRating: number;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  onlyVerified: boolean;
  sortBy: 'date' | 'rating' | 'relevance';
}

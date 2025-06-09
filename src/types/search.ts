
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
  totalReviews?: number;
  averageRating?: number;
  reviews?: Array<{
    id: string;
    reviewerId: string;
    reviewerName: string;
    rating: number;
    content: string;
    date: string;
    reviewerVerified?: boolean;
    customer_name?: string;
    customer_phone?: string;
    customer_address?: string;
    customer_city?: string;
    customer_zipcode?: string;
    customerId?: string;
    responses?: Array<{
      id: string;
      authorId: string;
      authorName: string;
      content: string;
      createdAt: string;
    }>;
  }>;
}

export interface SearchResult {
  customers: Customer[];
  total: number;
}

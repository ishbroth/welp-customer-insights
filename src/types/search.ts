
export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  averageRating: number;
  totalReviews: number;
  isSubscriptionNeeded: boolean;
}

export interface CustomerReview {
  id: string;
  rating: number;
  content: string;
  reviewerId: string;
  reviewerName: string;
  date: string;
}

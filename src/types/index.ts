
export interface User {
  id: string;
  name: string;
  email: string;
  type: "business" | "customer" | "admin";
  avatar?: string;
  businessId?: string;
  bio?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  createdAt: string;
  averageRating?: number;
  totalReviews?: number;
}

export interface ReviewResponse {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  reviewId: string;
}

export interface Review {
  id: string;
  title: string;
  content: string;
  rating: number;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  date: string;
  customerId: string;
  customerName?: string;
  zipCode?: string;
  responses?: ReviewResponse[];
  reactions?: {
    like: string[];
    funny: string[];
    useful: string[];
    ohNo: string[];
  };
}

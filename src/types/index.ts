export interface User {
  id: string;
  email: string;
  name: string;
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
  reactions?: {
    like: string[];
    funny: string[];
    ohNo: string[];
  };
  responses?: ReviewResponse[];
}

export interface ReviewResponse {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  replies?: ReviewResponse[];
}

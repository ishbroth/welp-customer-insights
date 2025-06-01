export interface User {
  id: string;
  name: string;
  email: string;
  type: "customer" | "business" | "admin";
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  businessId?: string;
  avatar?: string;
  bio?: string;
  verified?: boolean;
}

export interface ReviewResponse {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
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
  zipCode?: string;
  reactions?: {
    like: string[];
    funny: string[];
    useful: string[];
    ohNo: string[];
  };
  responses?: ReviewResponse[];
}

// Empty mock users array - no mock data
export const mockUsers: User[] = [];

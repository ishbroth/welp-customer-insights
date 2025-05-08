
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  type: "business" | "customer";
}

export interface Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  customerId: string;
  customerName: string;
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
    useful: string[];
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

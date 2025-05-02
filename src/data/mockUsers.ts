
export interface User {
  id: string;
  email: string;
  name: string;
  type: 'business' | 'customer';
  avatar?: string;
}

export interface Review {
  id: string;
  businessName: string;
  rating: number;
  content: string;
  date: string;
  userId: string;
}

export const mockUsers: User[] = [
  {
    id: "1",
    email: "business@example.com",
    name: "John Smith",
    type: "business",
    avatar: "https://images.unsplash.com/photo-1501286353178-1ec881214838"
  },
  {
    id: "2",
    email: "customer@example.com",
    name: "Jane Doe",
    type: "customer"
  }
];

export const mockReviews: Review[] = [
  {
    id: "1",
    businessName: "Cafe Delight",
    rating: 4,
    content: "Great coffee and atmosphere. Highly recommended for meetings.",
    date: "2025-04-20",
    userId: "1"
  },
  {
    id: "2",
    businessName: "Tech Solutions Inc",
    rating: 5,
    content: "Excellent customer service and technical support. They helped me solve my IT issues quickly.",
    date: "2025-04-15",
    userId: "1"
  },
  {
    id: "3",
    businessName: "Downtown Fitness",
    rating: 3,
    content: "Good equipment but gets crowded during peak hours. Could use more space.",
    date: "2025-03-25",
    userId: "1"
  }
];

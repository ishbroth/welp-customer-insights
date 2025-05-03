
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
  reviews?: Review[];
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
}

// Mock users for testing
export const mockUsers: User[] = [
  {
    id: "1",
    name: "Business Owner",
    email: "business@example.com",
    type: "business",
    avatar: "/placeholder.svg",
    businessId: "LIC123456",
    phone: "(555) 123-4567",
    address: "123 Business Ave",
    city: "San Francisco",
    state: "CA",
    zipCode: "94105",
  },
  {
    id: "2",
    name: "Bob's Bistro",
    email: "bob@example.com",
    type: "business",
    avatar: "/placeholder.svg",
    businessId: "12-3456789",
    phone: "(555) 987-6543",
    address: "456 Restaurant Rd",
    city: "Los Angeles",
    state: "CA",
    zipCode: "90001",
  },
  {
    id: "3",
    name: "Emma Johnson",
    email: "customer@example.com",
    type: "customer",
    avatar: "/placeholder.svg",
    bio: "Frequent shopper and food enthusiast",
    phone: "(555) 555-1234",
    address: "789 Customer St",
    city: "Portland",
    state: "OR",
    zipCode: "97201",
    reviews: [
      {
        id: "101",
        title: "Great customer",
        content: "Emma was very polite and respectful to our staff. Always welcome!",
        rating: 5,
        reviewerId: "1",
        reviewerName: "Business Owner",
        reviewerAvatar: "/placeholder.svg",
        date: "2023-04-15"
      },
      {
        id: "102",
        title: "Decent experience",
        content: "Customer was a bit demanding but overall reasonable.",
        rating: 4,
        reviewerId: "2",
        reviewerName: "Bob's Bistro",
        reviewerAvatar: "/placeholder.svg",
        date: "2023-05-20"
      }
    ]
  },
  {
    id: "4",
    name: "John Smith",
    email: "john@example.com",
    type: "customer",
    avatar: "/placeholder.svg",
    bio: "Tech professional and casual diner",
    phone: "(555) 444-3333",
    address: "101 Main St",
    city: "Seattle",
    state: "WA",
    zipCode: "98101",
    reviews: [
      {
        id: "103",
        title: "Difficult customer",
        content: "Was rude to staff and made unreasonable demands.",
        rating: 2,
        reviewerId: "1", 
        reviewerName: "Business Owner",
        reviewerAvatar: "/placeholder.svg",
        date: "2023-03-10"
      }
    ]
  },
  {
    id: "5",
    name: "Admin User",
    email: "admin@welp.com",
    type: "admin",
    avatar: "/placeholder.svg",
    phone: "(555) 999-8888",
    address: "42 Admin Plaza",
    city: "Austin",
    state: "TX",
    zipCode: "78701",
  }
];

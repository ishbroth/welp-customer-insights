
export interface User {
  id: string;
  name: string;
  email: string;
  type: "business" | "customer";
  avatar?: string;
  businessId?: string;
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
    name: "Alex's Restaurant",
    email: "alex@example.com",
    type: "business",
    avatar: "/placeholder.svg",
    businessId: "LIC123456",
  },
  {
    id: "2",
    name: "Bob's Bistro",
    email: "bob@example.com",
    type: "business",
    avatar: "/placeholder.svg",
    businessId: "12-3456789",
  },
  {
    id: "3",
    name: "Emma Johnson",
    email: "emma@example.com",
    type: "customer",
    avatar: "/placeholder.svg",
    reviews: [
      {
        id: "101",
        title: "Great customer",
        content: "Emma was very polite and respectful to our staff. Always welcome!",
        rating: 5,
        reviewerId: "1",
        reviewerName: "Alex's Restaurant",
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
    reviews: [
      {
        id: "103",
        title: "Difficult customer",
        content: "Was rude to staff and made unreasonable demands.",
        rating: 2,
        reviewerId: "1", 
        reviewerName: "Alex's Restaurant",
        reviewerAvatar: "/placeholder.svg",
        date: "2023-03-10"
      }
    ]
  }
];

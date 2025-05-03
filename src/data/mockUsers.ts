
export interface User {
  id: string;
  email: string;
  name: string;
  type: 'business' | 'customer';
  avatar?: string;
}

export interface Review {
  id: string;
  businessId: string;
  customerId: string;
  customerName: string;
  rating: number;
  content: string;
  date: string;
  businessName: string;
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
    businessId: "1",
    customerId: "c1",
    customerName: "Sarah Johnson",
    rating: 2,
    content: "This customer was constantly late for appointments and had unreasonable demands. Changed requirements multiple times after work had begun and complained about pricing despite agreeing beforehand.",
    date: "2025-04-20",
    businessName: "Cafe Delight"
  },
  {
    id: "2",
    businessId: "1",
    customerId: "c2",
    customerName: "Mike Peterson",
    rating: 5,
    content: "Excellent customer! Always prompt with payments, clear with requirements, and respectful of our staff. A pleasure to work with and highly recommended to other businesses.",
    date: "2025-04-15",
    businessName: "Tech Solutions Inc"
  },
  {
    id: "3",
    businessId: "1",
    customerId: "c3",
    customerName: "Emma Wilson",
    rating: 3,
    content: "Average customer experience. Communication was sometimes unclear and payment was delayed once. However, they were polite and eventually resolved all issues.",
    date: "2025-03-25",
    businessName: "Downtown Fitness"
  }
];

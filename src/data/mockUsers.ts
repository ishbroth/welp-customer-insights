
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
  reactions?: {
    like: string[];
    funny: string[];
    useful: string[];
    ohNo: string[];
  };
  responses?: ReviewResponse[];
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
        content: "Emma was very polite and respectful to our staff. Always welcome! She was pleasant to interact with and communicated her needs clearly. We appreciate customers like Emma who understand the challenges of running a small business and treat staff with respect. She also left the store tidy and followed all of our policies.",
        rating: 5,
        reviewerId: "1",
        reviewerName: "Business Owner",
        reviewerAvatar: "/placeholder.svg",
        date: "2023-04-15",
        reactions: {
          like: ["2", "4"],
          funny: [],
          useful: ["2"],
          ohNo: []
        },
        responses: [
          {
            id: "resp-101-1",
            authorId: "3",
            authorName: "Emma Johnson",
            content: "Thank you for your kind words! I really enjoyed shopping at your store and appreciate the excellent service your team provided.",
            createdAt: "2023-04-18T14:22:00Z"
          },
          {
            id: "resp-101-2",
            authorId: "1",
            authorName: "Business Owner",
            content: "You're welcome anytime, Emma! We look forward to seeing you again soon.",
            createdAt: "2023-04-19T09:15:00Z"
          }
        ]
      },
      {
        id: "102",
        title: "Problematic customer",
        content: "Customer was extremely difficult and created numerous problems during their visit. They arrived 30 minutes late for their reservation and still expected immediate seating despite our restaurant being fully booked. When asked to wait, they became hostile and started loudly complaining in front of other customers. During their meal, they sent back dishes multiple times claiming they were 'inedible' despite other customers enjoying the same items. They demanded free replacements and additional complimentary items, creating a scene when we explained our policies. They were rude to our waitstaff, making personal remarks about their appearance and service quality. At the end of their meal, they disputed charges on perfectly prepared items and threatened to leave negative reviews if we didn't provide a significant discount. We had to comp several items just to defuse the situation. Other customers were visibly uncomfortable due to their behavior. We would strongly advise other establishments to be cautious with this customer.",
        rating: 1,
        reviewerId: "2",
        reviewerName: "Bob's Bistro",
        reviewerAvatar: "/placeholder.svg",
        date: "2023-05-20",
        reactions: {
          like: ["1"],
          funny: [],
          useful: ["1", "5"],
          ohNo: []
        }
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
        content: "Was rude to staff and made unreasonable demands. This customer repeatedly ignored our policies despite clear explanations. He raised his voice when told that certain requests could not be accommodated, causing discomfort to other customers. He also complained about pricing that was clearly listed in our menu and demanded discounts without justification. He would prefer not to serve this customer again based on this experience.",
        rating: 2,
        reviewerId: "1", 
        reviewerName: "Business Owner",
        reviewerAvatar: "/placeholder.svg",
        date: "2023-03-10",
        reactions: {
          like: [],
          funny: [],
          useful: ["2"],
          ohNo: ["4"]
        },
        responses: [
          {
            id: "resp-103-1",
            authorId: "4",
            authorName: "John Smith",
            content: "I strongly disagree with this review. The service was extremely poor, and the staff was not helpful at all. I'll be taking my business elsewhere.",
            createdAt: "2023-03-12T10:30:00Z"
          }
        ]
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
  },
  // New mock users in San Diego
  {
    id: "6",
    name: "Peter Parker",
    email: "parker@example.com",
    type: "customer",
    avatar: "/placeholder.svg",
    bio: "Freelance photographer and occasional customer",
    phone: "(619) 555-1212",
    address: "123 Spider Ave",
    city: "San Diego",
    state: "CA",
    zipCode: "92101",
    reviews: [
      {
        id: "104",
        title: "Good customer but always late",
        content: "Peter is generally a pleasant customer who is respectful to staff and pays his bills on time. However, he is chronically late for appointments and often has to reschedule at the last minute. He's always very apologetic and offers reasonable explanations, though it does impact our scheduling. Despite this, his friendly demeanor and understanding attitude make him a welcome customer. He tips well and recommends our services to friends.",
        rating: 4,
        reviewerId: "2", // Written by Bob's Bistro
        reviewerName: "Bob's Bistro",
        reviewerAvatar: "/placeholder.svg",
        date: "2023-07-14",
        reactions: {
          like: [],
          funny: ["1"],
          useful: ["5"],
          ohNo: []
        }
      }
    ]
  },
  {
    id: "7",
    name: "Def Jeff",
    email: "jeff@example.com",
    type: "customer",
    avatar: "/placeholder.svg",
    bio: "Music enthusiast and regular patron",
    phone: "(619) 555-6789",
    address: "456 Rhythm Road",
    city: "San Diego",
    state: "CA",
    zipCode: "92109",
    reviews: [
      {
        id: "105",
        title: "Exceptional customer",
        content: "Jeff is one of our favorite customers. Always polite, patient, and respectful of our staff and other customers. He's very understanding when we're busy and never complains about wait times. Jeff is the kind of customer that makes running a business worthwhile - he offers constructive feedback rather than complaints and is genuinely interested in the success of our establishment. He's consistent about paying his bills promptly and has referred several friends to us who have also become regular customers.",
        rating: 5,
        reviewerId: "2", // Written by Bob's Bistro
        reviewerName: "Bob's Bistro",
        reviewerAvatar: "/placeholder.svg",
        date: "2023-08-22",
        reactions: {
          like: ["1"],
          funny: [],
          useful: ["5"],
          ohNo: []
        }
      },
      {
        id: "106",
        title: "Difficult to satisfy",
        content: "While Jeff is generally polite, he has very specific preferences that can be challenging to accommodate. He often makes special requests that go beyond our standard offerings and seems disappointed when we can't meet his exact specifications. During busy hours, this can put strain on our kitchen staff. On the positive side, he is never rude about it and accepts our limitations when explained clearly. He tips averagely but is not particularly generous considering the extra attention he requires.",
        rating: 3,
        reviewerId: "2", // Written by Bob's Bistro
        reviewerName: "Bob's Bistro",
        reviewerAvatar: "/placeholder.svg",
        date: "2023-09-05",
        reactions: {
          like: [],
          funny: [],
          useful: ["1"],
          ohNo: []
        }
      }
    ]
  },
  {
    id: "8",
    name: "Alice Wonderland",
    email: "alice@example.com",
    type: "customer",
    avatar: "/placeholder.svg",
    bio: "Adventure seeker and curious customer",
    phone: "(619) 555-4321",
    address: "789 Rabbit Hole Lane",
    city: "San Diego",
    state: "CA",
    zipCode: "92103",
    reviews: [
      {
        id: "107",
        title: "Unpredictable customer",
        content: "Alice is a customer who can be quite unpredictable. Some days she's incredibly pleasant and engaging, other times she seems distracted and makes unusual requests. She has a tendency to change her mind frequently during service, which can create challenges for our staff. Despite this, she's never rude and always apologizes for any inconvenience. She has an interesting perspective on our products and has actually provided some innovative suggestions that we've implemented. While she can be somewhat demanding, her enthusiasm is contagious and she's generous with tips.",
        rating: 4,
        reviewerId: "2", // Written by Bob's Bistro
        reviewerName: "Bob's Bistro",
        reviewerAvatar: "/placeholder.svg",
        date: "2023-10-10",
        reactions: {
          like: [],
          funny: ["1", "5"],
          useful: [],
          ohNo: []
        }
      }
    ]
  }
];

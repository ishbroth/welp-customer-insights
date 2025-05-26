
import { BusinessProfile } from "@/services/businessProfileService";

interface RawReview {
  id: string;
  rating: number;
  content: string;
  created_at: string;
  business_id: string;
  business_profile: BusinessProfile | null;
}

interface FormattedReview {
  id: string;
  rating: number;
  content: string;
  date: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar: string;
  customerId: string;
  customerName: string;
  reactions: { like: string[]; funny: string[]; useful: string[]; ohNo: string[] };
  responses: string[];
}

export const formatReview = (review: RawReview, currentUser: any): FormattedReview => {
  const businessProfile = review.business_profile;
  
  // Determine business name and avatar with proper fallbacks
  let businessName = "Anonymous Business";
  let businessAvatar = "";
  
  if (businessProfile) {
    // Special handling for admin account
    if (businessProfile.email === 'iw@thepaintedpainter.com' || 
        businessProfile.id === 'be76ebe3-4b67-4f11-bf4b-2dcb297f1fb7') {
      businessName = "The Painted Painter";
      // Use the avatar from the profile if it exists
      businessAvatar = businessProfile.avatar || "";
    } else if (businessProfile.name) {
      businessName = businessProfile.name;
      businessAvatar = businessProfile.avatar || "";
    }
  }
  
  console.log("Final business name for review:", businessName);
  console.log("Final business avatar for review:", businessAvatar);
  
  return {
    id: review.id,
    rating: review.rating,
    content: review.content,
    date: review.created_at,
    reviewerId: review.business_id,
    reviewerName: businessName,
    reviewerAvatar: businessAvatar,
    customerId: currentUser.id,
    customerName: currentUser.name || "Anonymous Customer",
    reactions: { like: [], funny: [], useful: [], ohNo: [] },
    responses: []
  };
};


import { Customer } from "@/types/search";
import { compareAddresses } from "./addressNormalization";
import { calculateStringSimilarity } from "./stringSimilarity";

interface ReviewMatchData {
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
  customer_city?: string;
  customer_zipcode?: string;
}

export const doesReviewMatchUser = (
  review: ReviewMatchData,
  currentUser: any,
  userProfile?: any
): boolean => {
  if (!currentUser || !review) return false;

  // Get user's full name from profile
  const userFullName = userProfile 
    ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim()
    : `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim();

  // Check name match with fuzzy logic
  if (review.customer_name && userFullName) {
    const similarity = calculateStringSimilarity(review.customer_name, userFullName);
    if (similarity >= 0.8) {
      return true;
    }
  }

  // Check phone match (remove non-digits for comparison)
  if (review.customer_phone && (userProfile?.phone || currentUser.phone)) {
    const reviewPhone = review.customer_phone.replace(/\D/g, '');
    const userPhone = (userProfile?.phone || currentUser.phone || '').replace(/\D/g, '');
    if (reviewPhone && userPhone && reviewPhone === userPhone) {
      return true;
    }
  }

  // Check address match using fuzzy comparison
  if (review.customer_address && (userProfile?.address || currentUser.address)) {
    const reviewAddress = review.customer_address;
    const userAddress = userProfile?.address || currentUser.address || '';
    if (compareAddresses(reviewAddress, userAddress, 0.8)) {
      return true;
    }
  }

  return false;
};

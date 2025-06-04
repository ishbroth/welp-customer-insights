
import { Customer } from "@/types/search";

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

  // Check name match (case insensitive)
  if (review.customer_name && userFullName) {
    const reviewName = review.customer_name.toLowerCase().trim();
    const userName = userFullName.toLowerCase().trim();
    if (reviewName === userName) {
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

  // Check address match (case insensitive)
  if (review.customer_address && (userProfile?.address || currentUser.address)) {
    const reviewAddress = review.customer_address.toLowerCase().trim();
    const userAddress = (userProfile?.address || currentUser.address || '').toLowerCase().trim();
    if (reviewAddress === userAddress) {
      return true;
    }
  }

  return false;
};

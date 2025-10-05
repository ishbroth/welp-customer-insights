/**
 * Utility functions for handling anonymous review display logic
 */

/**
 * Gets the display name for a reviewer, showing business category when anonymous
 * @param isAnonymous - Whether the review is anonymous
 * @param businessName - The actual business name
 * @param businessCategory - The business category/type
 * @param isReviewAuthor - Whether the current user is the author of the review
 * @returns The name to display for the reviewer
 */
export const getReviewerDisplayName = (
  isAnonymous: boolean,
  businessName: string,
  businessCategory?: string,
  isReviewAuthor?: boolean
): string => {
  // Review authors always see their actual business name
  if (isReviewAuthor) {
    return businessName;
  }

  if (!isAnonymous) {
    return businessName;
  }

  // For anonymous reviews, show business category instead of name
  if (businessCategory) {
    // Capitalize first letter of each word
    return businessCategory
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  // Fallback if no business category is available
  return "Anonymous Business";
};

/**
 * Determines if a reviewer can participate in conversations
 * @param isAnonymous - Whether the review is anonymous
 * @param isReviewAuthor - Whether the current user is the author of the review
 * @returns Whether the reviewer can participate in conversations
 */
export const canParticipateInConversation = (
  isAnonymous: boolean,
  isReviewAuthor: boolean
): boolean => {
  // Anonymous reviewers cannot participate in conversations
  // even if they are the author of the review
  if (isAnonymous && isReviewAuthor) {
    return false;
  }

  return true;
};
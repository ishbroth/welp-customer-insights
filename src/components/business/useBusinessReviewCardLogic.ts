
import { useNavigate } from "react-router-dom";
import { Review } from "@/types";
import { logger } from '@/utils/logger';

export const useBusinessReviewCardLogic = (review: Review) => {
  const navigate = useNavigate();
  const componentLogger = logger.withContext('useBusinessReviewCardLogic');

  const handleCustomerClick = () => {
    // Only allow navigation if the review is claimed (has customerId)
    if (review.customerId) {
      navigate(`/customer-profile/${review.customerId}`, {
        state: {
          readOnly: true,
          showWriteReviewButton: true // Business can write more reviews
        }
      });
    }
  };

  // Check if the review is claimed (has a customer who claimed it)
  const isReviewClaimed = !!review.customerId;

  const formatDate = (dateString: string | any) => {
    componentLogger.debug("formatDate input:", { _type: typeof dateString, value: dateString });
    componentLogger.debug("formatDate review.date:", review.date);
    componentLogger.debug("formatDate review object:", review);
    
    // Try to get a valid date string from multiple sources
    let cleanDateString = null;
    
    // First try the passed dateString if it's a valid string
    if (typeof dateString === 'string' && dateString !== 'undefined' && dateString !== 'null') {
      cleanDateString = dateString;
    }
    // Try review.date if it's a string
    else if (typeof review.date === 'string' && review.date !== 'undefined' && review.date !== 'null') {
      cleanDateString = review.date;
    }
    // Handle corrupted nested objects - extract the actual date string
    else if (typeof review.date === 'object' && review.date) {
      // Try to extract from nested object structure
      const extractDateString = (obj: any): string | null => {
        if (typeof obj === 'string') return obj;
        if (obj && typeof obj === 'object') {
          if (obj.value) return extractDateString(obj.value);
          if (obj.date) return extractDateString(obj.date);
          if (obj.created_at) return extractDateString(obj.created_at);
        }
        return null;
      };
      cleanDateString = extractDateString(review.date);
    }
    
    // If still no valid date, check if we have any other date fields on the review
    if (!cleanDateString) {
      // Look for other potential date fields on the review object
      const reviewObj = review as any;
      if (reviewObj.created_at && typeof reviewObj.created_at === 'string') {
        cleanDateString = reviewObj.created_at;
      } else if (reviewObj.createdAt && typeof reviewObj.createdAt === 'string') {
        cleanDateString = reviewObj.createdAt;
      }
    }
    
    // As a last fallback, use current date
    if (!cleanDateString || cleanDateString === 'undefined' || cleanDateString === 'null') {
      componentLogger.warn("formatDate: No valid date found, using current date");
      cleanDateString = new Date().toISOString();
    }

    componentLogger.debug("formatDate: Using date string:", cleanDateString);

    try {
      const date = new Date(cleanDateString);

      if (isNaN(date.getTime())) {
        componentLogger.debug("formatDate: Invalid date object");
        return "Invalid date";
      }

      const formatted = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      componentLogger.debug("formatDate result:", formatted);
      return formatted;
    } catch (error) {
      componentLogger.error("formatDate error:", error);
      return "Invalid date";
    }
  };

  const getCustomerInitials = (name?: string) => {
    const customerName = name || review.customerName;
    if (customerName) {
      const names = customerName.split(' ');
      return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return "C";
  };

  return {
    handleCustomerClick,
    formatDate,
    getCustomerInitials,
    isReviewClaimed
  };
};

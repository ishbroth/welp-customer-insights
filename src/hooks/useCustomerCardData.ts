
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/utils/logger';

const hookLogger = logger.withContext('CustomerCardData');

interface CustomerInfo {
  label: string;
  value: string;
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  verified?: boolean;
  reviews?: Array<{
    id: string;
    reviewerId: string;
    reviewerName: string;
    rating: number;
    content: string;
    date: string;
    reviewerVerified?: boolean;
  }>;
}

export const useCustomerCardData = (customer: Customer) => {
  // Fetch customer's verification status from profiles table
  const { data: customerProfile } = useQuery({
    queryKey: ['customerVerification', customer.id],
    queryFn: async () => {
      if (!customer.id) return null;
      
      hookLogger.debug(`Fetching verification for customer ID: ${customer.id}`);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('verified, type')
        .eq('id', customer.id)
        .maybeSingle();

      if (error) {
        hookLogger.error("Error fetching customer verification:", error);
        return null;
      }

      hookLogger.debug(`Customer ${customer.id} verification status: ${data?.verified}, type: ${data?.type}`);
      return data;
    },
    enabled: !!customer.id
  });

  // Calculate average rating with precise decimal
  const calculateAverageRating = () => {
    if (!customer.reviews || customer.reviews.length === 0) return 0;
    const total = customer.reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / customer.reviews.length;
  };

  // Sort reviews to put verified businesses first, then by date
  const sortedReviews = customer.reviews ? [...customer.reviews].sort((a, b) => {
    // First, prioritize verified reviewers
    if (a.reviewerVerified !== b.reviewerVerified) {
      return b.reviewerVerified ? 1 : -1;
    }
    
    // Then sort by date (newest first)
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  }) : [];

  const getCustomerInfo = (): CustomerInfo[] => {
    const info = [];
    
    // Customer name - always show this
    const name = [customer.firstName, customer.lastName].filter(Boolean).join(' ');
    if (name) info.push({ label: 'Name', value: name });
    
    // Phone - show for everyone (this is public identifying information from the review)
    if (customer.phone) {
      info.push({ label: 'Phone', value: customer.phone });
    }
    
    // Address - show for everyone (this is public identifying information from the review)
    if (customer.address) {
      info.push({ label: 'Address', value: customer.address });
    }
    
    // City, State, Zip - show for everyone (this is public identifying information from the review)
    const location = [customer.city, customer.state, customer.zipCode].filter(Boolean).join(', ');
    if (location) {
      info.push({ label: 'Location', value: location });
    }
    
    return info;
  };

  const customerInfo = getCustomerInfo();
  const averageRating = calculateAverageRating();
  const hasReviews = customer.reviews && customer.reviews.length > 0;
  const customerName = customerInfo.find(info => info.label === 'Name')?.value || 'Unknown Customer';

  // Use verification status from database, fallback to customer prop
  const isVerified = customerProfile?.verified || customer.verified || false;

  hookLogger.debug(`Customer ${customer.id} final verification status: ${isVerified} (from profile: ${customerProfile?.verified}, from prop: ${customer.verified})`);

  return {
    customerProfile,
    customerInfo,
    averageRating,
    hasReviews,
    customerName,
    isVerified,
    sortedReviews
  };
};

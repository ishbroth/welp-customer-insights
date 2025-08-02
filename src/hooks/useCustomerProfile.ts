
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { compareAddresses } from "@/utils/addressNormalization";
import { calculateStringSimilarity } from "@/utils/stringSimilarity";
import { useReviewAccess } from "./useReviewAccess";

export const useCustomerProfile = (customerId: string | undefined) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isReviewUnlocked } = useReviewAccess();
  
  const [customerProfile, setCustomerProfile] = useState<any | null>(null);
  const [customerReviews, setCustomerReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only business users can view customer profiles
    if (!currentUser || (currentUser.type !== 'business' && currentUser.type !== 'admin')) {
      toast({
        title: "Access Denied",
        description: "You need to be logged in as a business to view customer profiles.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }

    const fetchCustomerProfile = async () => {
      if (!customerId) return;
      
      setIsLoading(true);
      
      try {
        // Get customer profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', customerId)
          .eq('type', 'customer')
          .single();
          
        if (profileError) {
          throw profileError;
        }
        
        if (!profileData) {
          toast({
            title: "Customer Not Found",
            description: "The customer profile you're looking for does not exist.",
            variant: "destructive",
          });
          navigate('/search');
          return;
        }
        
        setCustomerProfile(profileData);
        
        // Fetch reviews about this customer using matching logic
        await fetchReviewsAboutCustomer(profileData);
        
      } catch (error: any) {
        console.error("Error fetching customer profile:", error);
        toast({
          title: "Error",
          description: "Failed to load customer profile. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    const fetchReviewsAboutCustomer = async (customerProfile: any) => {
      try {
        // Get all claimed reviews for this customer
        const { data: claimedReviews, error: claimedError } = await supabase
          .from('review_claims')
          .select(`
            review_id,
            reviews!inner(
              id,
              customer_name,
              customer_address,
              customer_city,
              customer_zipcode,
              customer_phone,
              rating,
              content,
              created_at,
              business_id,
              profiles!business_id(id, name, avatar, verified)
            )
          `)
          .eq('claimed_by', customerId);

        // Get all unclaimed reviews to check for potential matches
        const { data: allReviews, error: reviewsError } = await supabase
          .from('reviews')
          .select(`
            id,
            customer_name,
            customer_address,
            customer_city,
            customer_zipcode,
            customer_phone,
            rating,
            content,
            created_at,
            business_id,
            profiles!business_id(id, name, avatar, verified)
          `)
          .order('created_at', { ascending: false });

        if (reviewsError) {
          console.error("Error fetching reviews:", reviewsError);
          return;
        }

        // Get globally claimed review IDs to exclude from potential matches
        const { data: globalClaims } = await supabase
          .from('review_claims')
          .select('review_id');

        const globallyClaimedReviewIds = globalClaims?.map(claim => claim.review_id) || [];

        // Process claimed reviews
        const processedClaimedReviews = claimedReviews?.map(claim => ({
          ...claim.reviews,
          business_name: claim.reviews.profiles?.name || 'Business',
          business_avatar: claim.reviews.profiles?.avatar,
          business_verified: claim.reviews.profiles?.verified,
          isClaimed: true,
          matchType: 'claimed',
          matchScore: 100,
          matchReasons: ['Claimed by customer']
        })) || [];

        // Check unclaimed reviews for potential matches
        const potentialMatches = allReviews
          ?.filter(review => !globallyClaimedReviewIds.includes(review.id))
          .map(review => {
            const matchResult = checkReviewMatch(review, customerProfile);
            return {
              ...review,
              business_name: review.profiles?.name || 'Business',
              business_avatar: review.profiles?.avatar,
              business_verified: review.profiles?.verified,
              isClaimed: false,
              matchType: matchResult.matchType,
              matchScore: matchResult.matchScore,
              matchReasons: matchResult.matchReasons
            };
          })
          .filter(review => 
            review.matchType === 'high_quality' || 
            (review.matchType === 'potential' && review.matchScore > 30)
          ) || [];

        // Combine and sort all reviews
        const allCustomerReviews = [...processedClaimedReviews, ...potentialMatches]
          .sort((a, b) => {
            // Claimed reviews first
            if (a.isClaimed && !b.isClaimed) return -1;
            if (!a.isClaimed && b.isClaimed) return 1;
            // Then by match score
            return b.matchScore - a.matchScore;
          });

        setCustomerReviews(allCustomerReviews);

      } catch (error) {
        console.error("Error fetching customer reviews:", error);
      }
    };

    const checkReviewMatch = (review: any, customerProfile: any): { matchType: string, matchScore: number, matchReasons: string[] } => {
      let matchScore = 0;
      const matchReasons: string[] = [];

      // Build customer full name
      const customerFullName = `${customerProfile.first_name || ''} ${customerProfile.last_name || ''}`.trim() || customerProfile.name || '';

      // Check name match
      if (review.customer_name && customerFullName) {
        const similarity = calculateStringSimilarity(review.customer_name, customerFullName);
        if (similarity >= 0.8) {
          matchScore += 40;
          matchReasons.push('Name match');
        }
      }

      // Check phone match
      if (review.customer_phone && customerProfile.phone) {
        const reviewPhone = review.customer_phone.replace(/\D/g, '');
        const userPhone = customerProfile.phone.replace(/\D/g, '');
        if (reviewPhone && userPhone && reviewPhone === userPhone) {
          matchScore += 30;
          matchReasons.push('Phone match');
        }
      }

      // Check address match
      if (review.customer_address && customerProfile.address) {
        if (compareAddresses(review.customer_address, customerProfile.address, 0.8)) {
          matchScore += 30;
          matchReasons.push('Address match');
        }
      }

      let matchType = 'none';
      if (matchScore >= 70) {
        matchType = 'high_quality';
      } else if (matchScore >= 30) {
        matchType = 'potential';
      }

      return { matchType, matchScore, matchReasons };
    };
    
    fetchCustomerProfile();
  }, [customerId, currentUser, navigate, toast]);

  // Check if user has access to full reviews
  const hasFullAccess = (reviewId: string) => {
    // Business users can unlock any review with credits or have access through subscription
    return isReviewUnlocked(reviewId);
  };

  return {
    customerProfile,
    customerReviews,
    isLoading,
    hasFullAccess
  };
};

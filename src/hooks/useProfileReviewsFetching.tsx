
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

export const useProfileReviewsFetching = () => {
  const { toast } = useToast();
  const { currentUser, isSubscribed } = useAuth();
  const [customerReviews, setCustomerReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCustomerReviews = async () => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    try {
      console.log("=== FETCHING REVIEWS FOR CUSTOMER ===");
      console.log("Customer ID:", currentUser.id);
      
      // First try to fetch by customer_id
      const { data: directReviews, error: directError } = await supabase
        .from('reviews')
        .select(`
          id, 
          rating, 
          content, 
          created_at,
          business_id
        `)
        .eq('customer_id', currentUser.id);

      if (directError) {
        console.error("Error fetching direct reviews:", directError);
      }

      console.log("Direct reviews found:", directReviews?.length || 0);
      let allReviews = directReviews || [];

      // If no direct reviews and we have a current user with a name, search by name
      if ((!directReviews || directReviews.length === 0) && currentUser?.name) {
        console.log("Searching by customer name:", currentUser.name);
        
        const { data: nameReviews, error: nameError } = await supabase
          .from('reviews')
          .select(`
            id, 
            rating, 
            content, 
            created_at,
            business_id
          `)
          .ilike('customer_name', `%${currentUser.name}%`);

        if (nameError) {
          console.error("Error fetching reviews by name:", nameError);
        } else {
          console.log("Reviews found by name:", nameReviews?.length || 0);
          allReviews = [...allReviews, ...(nameReviews || [])];
        }
      }

      // Remove duplicates based on review ID
      const uniqueReviews = allReviews.filter((review, index, self) => 
        index === self.findIndex(r => r.id === review.id)
      );

      console.log("Total unique reviews:", uniqueReviews.length);

      // Now fetch business profiles for each review separately
      const reviewsWithProfiles = await Promise.all(
        uniqueReviews.map(async (review) => {
          if (review.business_id) {
            console.log("Looking up business profile for ID:", review.business_id);
            
            // First try to get any profile by business_id (regardless of type)
            let { data: businessProfile, error: profileError } = await supabase
              .from('profiles')
              .select('name, avatar, email, type')
              .eq('id', review.business_id)
              .maybeSingle();

            if (profileError) {
              console.error("Error fetching profile for:", review.business_id, profileError);
            }

            console.log("Profile found by ID:", businessProfile);

            // If no profile found by ID, check for admin account by email
            if (!businessProfile) {
              console.log("No profile found by ID, checking for admin account by email...");
              
              const { data: adminProfile, error: adminError } = await supabase
                .from('profiles')
                .select('name, avatar, email, type, id')
                .eq('email', 'iw@thepaintedpainter.com')
                .maybeSingle();

              if (adminError) {
                console.error("Error fetching admin profile:", adminError);
              } else if (adminProfile) {
                console.log("Found admin profile:", adminProfile);
                businessProfile = adminProfile;
              }
            }

            // Additional fallback: check if this is your main admin account
            if (!businessProfile && review.business_id === currentUser.id) {
              console.log("Review written by current user, using current user profile");
              businessProfile = {
                name: currentUser.name || "The Painted Painter",
                avatar: currentUser.avatar || "",
                email: currentUser.email,
                type: currentUser.type
              };
            }

            return {
              ...review,
              business_profile: businessProfile
            };
          }
          return {
            ...review,
            business_profile: null
          };
        })
      );

      console.log("Reviews with business profile data:", reviewsWithProfiles);

      // Format the reviews data
      const formattedReviews = reviewsWithProfiles.map(review => {
        const businessProfile = review.business_profile;
        
        // Use proper business name for admin account
        let businessName = "Anonymous Business";
        if (businessProfile) {
          if (businessProfile.email === 'iw@thepaintedpainter.com') {
            businessName = "The Painted Painter";
          } else {
            businessName = businessProfile.name || "Anonymous Business";
          }
        }
        
        return {
          id: review.id,
          rating: review.rating,
          content: review.content,
          date: review.created_at,
          reviewerId: review.business_id,
          reviewerName: businessName,
          reviewerAvatar: businessProfile?.avatar || "",
          customerId: currentUser.id,
          customerName: currentUser.name || "Anonymous Customer",
          reactions: { like: [], funny: [], useful: [], ohNo: [] },
          responses: []
        };
      });

      setCustomerReviews(formattedReviews);
      console.log("=== REVIEW FETCH COMPLETE ===");
      console.log("Formatted reviews:", formattedReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast({
        title: "Error",
        description: "Failed to fetch reviews.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerReviews();
  }, [currentUser]);

  return { customerReviews, isLoading, fetchCustomerReviews };
};

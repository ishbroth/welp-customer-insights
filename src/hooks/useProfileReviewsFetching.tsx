
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

      // Debug: Check what profiles exist and specifically look for the admin account
      console.log("=== DEBUGGING PROFILE LOOKUP ===");
      const { data: adminCheck, error: adminCheckError } = await supabase
        .from('profiles')
        .select('id, name, email, type, avatar')
        .eq('email', 'iw@thepaintedpainter.com')
        .maybeSingle();
      
      console.log("Admin profile check result:", adminCheck);
      if (adminCheckError) {
        console.error("Admin profile check error:", adminCheckError);
      }

      // Now fetch business profiles for each review separately
      const reviewsWithProfiles = await Promise.all(
        uniqueReviews.map(async (review) => {
          if (review.business_id) {
            console.log("Looking up business profile for ID:", review.business_id);
            
            let businessProfile = null;
            
            // Strategy 1: Direct ID lookup
            const { data: profileById, error: profileError } = await supabase
              .from('profiles')
              .select('id, name, email, type, avatar')
              .eq('id', review.business_id)
              .maybeSingle();

            if (profileError) {
              console.error("Error fetching profile by ID:", profileError);
            } else if (profileById) {
              console.log("Found profile by ID:", profileById);
              businessProfile = profileById;
            }

            // Strategy 2: If no profile found and this is the admin business ID, look up by email
            if (!businessProfile) {
              console.log("No profile found by ID, checking admin email...");
              
              const { data: adminProfile, error: adminError } = await supabase
                .from('profiles')
                .select('id, name, email, type, avatar')
                .eq('email', 'iw@thepaintedpainter.com')
                .maybeSingle();

              if (adminError) {
                console.error("Error fetching admin profile:", adminError);
              } else if (adminProfile) {
                console.log("Found admin profile by email:", adminProfile);
                businessProfile = adminProfile;
              }
            }

            // Strategy 3: Manual fallback for known admin business ID
            if (!businessProfile && review.business_id === 'be76ebe3-4b67-4f11-bf4b-2dcb297f1fb7') {
              console.log("Using hardcoded admin profile for known business ID");
              businessProfile = {
                id: review.business_id,
                name: "The Painted Painter",
                email: "iw@thepaintedpainter.com",
                type: "business",
                avatar: ""
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
        
        // Determine business name with proper fallbacks
        let businessName = "Anonymous Business";
        let businessAvatar = "";
        
        if (businessProfile) {
          // Special handling for admin account
          if (businessProfile.email === 'iw@thepaintedpainter.com' || 
              businessProfile.id === 'be76ebe3-4b67-4f11-bf4b-2dcb297f1fb7') {
            businessName = "The Painted Painter";
          } else if (businessProfile.name) {
            businessName = businessProfile.name;
          }
          businessAvatar = businessProfile.avatar || "";
        }
        
        console.log("Final business name for review:", businessName);
        
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

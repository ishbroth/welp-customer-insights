import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

interface Review {
  id: string;
  rating: number;
  content: string;
  created_at: string;
  business_id: string;
  customer_name?: string;
  customer_phone?: string;
}

interface FormattedReview {
  id: string;
  rating: number;
  content: string;
  date: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar: string;
}

export const useReviewsFetching = (
  customerId: string,
  initialReviews: any[] = [],
  isReviewCustomer = false
) => {
  const { toast } = useToast();
  const { currentUser, isSubscribed } = useAuth();
  const [processedReviews, setProcessedReviews] = useState<FormattedReview[]>(initialReviews);
  
  useEffect(() => {
    // If reviews are already passed as props, use those
    if (initialReviews.length > 0) {
      setProcessedReviews(initialReviews);
      return;
    }

    // If this is a customer found from review data (ID starts with "review-customer-")
    if (isReviewCustomer) {
      const actualReviewId = customerId.replace('review-customer-', '');
      
      // Fetch the review that created this customer entry
      const fetchReviewCustomerData = async () => {
        try {
          // First get the specific review
          const { data: reviewData, error: reviewError } = await supabase
            .from('reviews')
            .select('id, rating, content, created_at, business_id, customer_name, customer_phone')
            .eq('id', actualReviewId);

          if (reviewError) {
            throw reviewError;
          }
          
          if (!reviewData || reviewData.length === 0) {
            return;
          }
          
          // Then find other reviews with similar customer info
          const review = reviewData[0];
          const { data: similarReviews, error: similarError } = await supabase
            .from('reviews')
            .select('id, rating, content, created_at, business_id')
            .ilike('customer_name', `%${review.customer_name}%`)
            .order('created_at', { ascending: false });

          if (similarError) {
            throw similarError;
          }
          
          // Format the reviews data and fetch business names separately
          const formattedReviews: FormattedReview[] = [];
          
          if (similarReviews) {
            for (const rev of similarReviews) {
              let businessName = "The Painted Painter";
              let businessAvatar = "";
              
              if (rev.business_id) {
                try {
                  const { data: businessData } = await supabase
                    .from('profiles')
                    .select('name, avatar')
                    .eq('id', rev.business_id)
                    .single();
                  businessName = businessData?.name || "The Painted Painter";
                  businessAvatar = businessData?.avatar || "";
                } catch (error) {
                  console.error('Error fetching business profile:', error);
                }
              }
              
              formattedReviews.push({
                id: rev.id,
                rating: rev.rating,
                content: rev.content,
                date: rev.created_at,
                reviewerId: rev.business_id,
                reviewerName: businessName,
                reviewerAvatar: businessAvatar
              });
            }
          }

          setProcessedReviews(formattedReviews);
        } catch (error) {
          console.error("Error fetching review customer data:", error);
          toast({
            title: "Error",
            description: "Failed to fetch reviews.",
            variant: "destructive"
          });
        }
      };
      
      fetchReviewCustomerData();
      return;
    }

    // If no reviews are passed as props and this is a regular customer, fetch them from Supabase
    const fetchReviews = async () => {
      try {
        console.log("=== FETCHING REVIEWS FOR CUSTOMER ===");
        console.log("Customer ID:", customerId);
        
        // Search by customer name if available
        let allReviews: Review[] = [];
        
        if (currentUser?.name) {
          console.log("Searching by customer name:", currentUser.name);
          
          const { data: nameReviews, error: nameError } = await supabase
            .from('reviews')
            .select('id, rating, content, created_at, business_id')
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

        // Format the reviews data and fetch business names separately
        const formattedReviews: FormattedReview[] = [];
        
        for (const review of uniqueReviews) {
          let businessName = "The Painted Painter";
          let businessAvatar = "";
          
          if (review.business_id) {
            try {
              const { data: businessData } = await supabase
                .from('profiles')
                .select('name, avatar')
                .eq('id', review.business_id)
                .single();
              businessName = businessData?.name || "The Painted Painter";
              businessAvatar = businessData?.avatar || "";
            } catch (error) {
              console.error('Error fetching business profile:', error);
            }
          }
          
          formattedReviews.push({
            id: review.id,
            rating: review.rating,
            content: review.content,
            date: review.created_at,
            reviewerId: review.business_id,
            reviewerName: businessName,
            reviewerAvatar: businessAvatar
          });
        }

        setProcessedReviews(formattedReviews);
        console.log("=== REVIEW FETCH COMPLETE ===");
      } catch (error) {
        console.error("Error fetching reviews:", error);
        toast({
          title: "Error",
          description: "Failed to fetch reviews.",
          variant: "destructive"
        });
      }
    };

    fetchReviews();
  }, [customerId, initialReviews, toast, isReviewCustomer, currentUser?.name]);

  return { processedReviews };
};
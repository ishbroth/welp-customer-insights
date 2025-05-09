
import { useAuth } from "@/contexts/auth";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import ReviewItem from "./ReviewItem";
import { supabase } from "@/integrations/supabase/client";

interface ReviewsListProps {
  customerId: string;
  reviews: any[];
  hasFullAccess: (customerId: string) => boolean;
}

const ReviewsList = ({ customerId, reviews, hasFullAccess }: ReviewsListProps) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [processedReviews, setProcessedReviews] = useState<any[]>(reviews);
  
  useEffect(() => {
    // If reviews are already passed as props, use those
    if (reviews.length > 0) {
      setProcessedReviews(reviews);
      return;
    }

    // If no reviews are passed as props, fetch them from Supabase
    const fetchReviews = async () => {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            id, 
            rating, 
            content, 
            created_at,
            business_id,
            profiles!business_id(name)
          `)
          .eq('customer_id', customerId);

        if (error) {
          throw error;
        }

        // Format the reviews data
        const formattedReviews = data ? data.map(review => ({
          id: review.id,
          rating: review.rating,
          content: review.content,
          date: review.created_at,
          reviewerId: review.business_id,
          reviewerName: review.profiles?.name || "Anonymous Business"
        })) : [];

        setProcessedReviews(formattedReviews);
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
  }, [customerId, reviews, toast]);
  
  // Non-logged in users and customers who haven't subscribed only see truncated reviews
  const shouldShowLimitedReview = !currentUser || (currentUser?.type === "customer" && !hasFullAccess(customerId));

  return (
    <div className="mt-4 space-y-4">
      {processedReviews?.length > 0 ? (
        processedReviews.map((review: any) => (
          <ReviewItem 
            key={review.id}
            review={review}
            customerId={customerId}
            hasFullAccess={hasFullAccess}
            shouldShowLimitedReview={shouldShowLimitedReview}
          />
        ))
      ) : (
        <div className="text-center py-4 text-gray-500">No reviews available</div>
      )}
    </div>
  );
};

export default ReviewsList;
